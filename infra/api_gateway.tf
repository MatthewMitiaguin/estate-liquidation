resource "aws_apigatewayv2_api" "main" {
  name          = "estate-liquidation-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PATCH", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  tags = local.common_tags
}

# Single integration pointing to the unified Lambda
resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = module.lambda_api.lambda_function_invoke_arn  # Changed this line
  payload_format_version = "2.0"
}

# All routes point to the same integration
locals {
  routes = {
    jobs_create   = "POST /jobs"
    jobs_get      = "GET /jobs/{id}"
    jobs_list     = "GET /jobs"
    items_create  = "POST /jobs/{id}/items"
    items_analyse = "POST /jobs/{id}/items/{itemId}/analyse"
    items_update  = "PATCH /jobs/{id}/items/{itemId}"
  }
}

resource "aws_apigatewayv2_route" "handlers" {
  for_each = local.routes

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}

# Single Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_api.lambda_function_name  # Changed this line
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Output the API endpoint
output "api_endpoint" {
  value       = aws_apigatewayv2_stage.default.invoke_url
  description = "HTTP API Gateway endpoint URL"
}