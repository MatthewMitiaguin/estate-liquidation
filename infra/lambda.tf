# ---------------------------------------------------------------------------
# Lambda Function with Terraform AWS Lambda Module
# ---------------------------------------------------------------------------

module "lambda_api" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "~> 7.0"

  function_name = "estate-liquidation-api-${var.environment}"
  description   = "Single Lambda with internal routing for estate liquidation API"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 120
  memory_size   = 512

  # Off-switch: set var.lambda_concurrency = 0 to disable the API
  reserved_concurrent_executions = var.lambda_concurrency

  # Build settings
  source_path = [
    {
      path = "${path.module}/lambda"
      commands = [
        "npm ci",
        "npm run build",
        "cd dist",
        ":zip"
      ]
    }
  ]

  # Environment variables
  environment_variables = {
    TABLE_NAME            = aws_dynamodb_table.estate_liquidation.name
    BUCKET_NAME           = aws_s3_bucket.estate_liquidation.bucket
    ANTHROPIC_API_KEY_SSM = data.aws_ssm_parameter.anthropic_api_key.name
    API_TOKEN_SSM         = data.aws_ssm_parameter.api_token.name
  }

  # IAM policies
  attach_policy_statements = true
  policy_statements = {
    dynamodb = {
      effect = "Allow"
      actions = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan",
      ]
      resources = [aws_dynamodb_table.estate_liquidation.arn]
    }
    s3 = {
      effect = "Allow"
      actions = [
        "s3:GetObject",
        "s3:PutObject"
      ]
      resources = ["${aws_s3_bucket.estate_liquidation.arn}/*"]
    }
    ssm = {
      effect = "Allow"
      actions = [
        "ssm:GetParameter"
      ]
      resources = [
        data.aws_ssm_parameter.anthropic_api_key.arn,
        data.aws_ssm_parameter.api_token.arn,
      ]
    }
  }

  # CloudWatch Logs
  cloudwatch_logs_retention_in_days = 7

  tags = local.common_tags
}

# Outputs for use in API Gateway
output "lambda_function_arn" {
  value = module.lambda_api.lambda_function_arn
}

output "lambda_function_name" {
  value = module.lambda_api.lambda_function_name
}

output "lambda_function_invoke_arn" {
  value = module.lambda_api.lambda_function_invoke_arn
}