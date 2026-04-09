#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Estate Liquidation API Test Suite${NC}"
echo "=================================="
echo ""

# Get API endpoint
cd ..
API_URL=$(terraform output -raw api_endpoint 2>/dev/null)
cd test

if [ -z "$API_URL" ]; then
  echo -e "${RED}Error: Could not get API endpoint from Terraform${NC}"
  echo "Make sure you're in infra/test/ and Terraform has been applied"
  exit 1
fi

# Get API token from SSM
API_TOKEN=$(aws ssm get-parameter \
  --name /estate-liquidation/dev/api-token \
  --with-decryption \
  --query Parameter.Value \
  --output text 2>/dev/null)

if [ -z "$API_TOKEN" ]; then
  echo -e "${RED}Error: Could not read /estate-liquidation/dev/api-token from SSM${NC}"
  echo "Create the SecureString parameter in the AWS console first"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $API_TOKEN"

echo "API Endpoint: $API_URL"
echo ""

# Test 1: Create job
echo -e "${BLUE}Test 1: Creating job...${NC}"
JOB_RESPONSE=$(curl -s -X POST "$API_URL/jobs" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"workerName":"Test Worker","address":"123 Test Street, Sydney"}')

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.jobId')

if [ "$JOB_ID" = "null" ] || [ -z "$JOB_ID" ]; then
  echo -e "${RED}✗ Failed to create job${NC}"
  echo "Response: $JOB_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Created job: $JOB_ID${NC}"
echo ""

# Test 2: Get job
echo -e "${BLUE}Test 2: Getting job...${NC}"
GET_JOB_RESPONSE=$(curl -s -H "$AUTH_HEADER" "$API_URL/jobs/$JOB_ID")
echo "$GET_JOB_RESPONSE" | jq '.'
echo -e "${GREEN}✓ Job retrieved successfully${NC}"
echo ""

# Test 3: List all jobs
echo -e "${BLUE}Test 3: Listing all jobs...${NC}"
LIST_RESPONSE=$(curl -s -H "$AUTH_HEADER" "$API_URL/jobs")
JOB_COUNT=$(echo $LIST_RESPONSE | jq 'length')
echo -e "${GREEN}✓ Found $JOB_COUNT job(s)${NC}"
echo ""

# Test 4: Create item
echo -e "${BLUE}Test 4: Creating item...${NC}"
PHOTO_SIZE=$(stat -f%z test-photo.jpg 2>/dev/null || stat -c%s test-photo.jpg 2>/dev/null || echo 0)
ITEM_RESPONSE=$(curl -s -X POST "$API_URL/jobs/$JOB_ID/items" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"name\":\"Antique Wooden Chair\",\"contentLength\":$PHOTO_SIZE}")

ITEM_ID=$(echo $ITEM_RESPONSE | jq -r '.itemId')
UPLOAD_URL=$(echo $ITEM_RESPONSE | jq -r '.uploadUrl')

if [ "$ITEM_ID" = "null" ] || [ -z "$ITEM_ID" ]; then
  echo -e "${RED}✗ Failed to create item${NC}"
  echo "Response: $ITEM_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Created item: $ITEM_ID${NC}"
echo "Upload URL received"
echo ""

# Test 5: Upload photo
if [ -f "test-photo.jpg" ]; then
  echo -e "${BLUE}Test 5: Uploading photo to S3...${NC}"
  UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$UPLOAD_URL" \
    -H "Content-Type: image/jpeg" \
    --upload-file test-photo.jpg)
  
  HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Photo uploaded successfully${NC}"
    echo ""
    
    # Test 6: Analyze item
    echo -e "${BLUE}Test 6: Analyzing item with Claude Vision...${NC}"
    echo "(This may take 10-30 seconds...)"
    ANALYZE_RESPONSE=$(curl -s -X POST -H "$AUTH_HEADER" "$API_URL/jobs/$JOB_ID/items/$ITEM_ID/analyse")
    
    ITEM_NAME=$(echo $ANALYZE_RESPONSE | jq -r '.name')
    
    if [ "$ITEM_NAME" != "null" ] && [ -n "$ITEM_NAME" ]; then
      echo -e "${GREEN}✓ Analysis complete${NC}"
      echo ""
      echo "Analyzed item details:"
      echo $ANALYZE_RESPONSE | jq '{name, description, condition, valueLow, valueHigh, category, auctionSuitable}'
      echo ""
    else
      echo -e "${RED}✗ Analysis failed${NC}"
      echo "Response: $ANALYZE_RESPONSE"
    fi
  else
    echo -e "${RED}✗ Photo upload failed (HTTP $HTTP_CODE)${NC}"
  fi
else
  echo -e "${RED}✗ test-photo.jpg not found - skipping upload and analysis tests${NC}"
  echo "Add a test-photo.jpg to infra/test/ to test photo upload and analysis"
  echo ""
fi

# Test 7: Update item
echo -e "${BLUE}Test 7: Updating item disposition...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/jobs/$JOB_ID/items/$ITEM_ID" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"disposition":"sell","notes":"Beautiful vintage piece, excellent condition"}')

DISPOSITION=$(echo $UPDATE_RESPONSE | jq -r '.disposition')

if [ "$DISPOSITION" = "sell" ]; then
  echo -e "${GREEN}✓ Item updated successfully${NC}"
  echo ""
else
  echo -e "${RED}✗ Update failed${NC}"
  echo "Response: $UPDATE_RESPONSE"
fi

# Test 8: Get job with items
echo -e "${BLUE}Test 8: Getting job with all items...${NC}"
FINAL_JOB=$(curl -s -H "$AUTH_HEADER" "$API_URL/jobs/$JOB_ID")
ITEM_COUNT=$(echo $FINAL_JOB | jq '.items | length')
echo -e "${GREEN}✓ Job has $ITEM_COUNT item(s)${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}All tests completed!${NC}"
echo ""
echo "Test job ID: $JOB_ID"
echo "Test item ID: $ITEM_ID"
echo ""
echo "You can view the data in:"
echo "- DynamoDB table: estate-liquidation-dev"
echo "- S3 bucket: estate-liquidation-dev"
echo "- CloudWatch logs: /aws/lambda/estate-liquidation-api-dev"