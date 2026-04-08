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

  tags = local.common_tags
}

locals {
  routes = {
    jobs_create = {
      lambda_key = "jobs_create"
      route_key  = "POST /jobs"
    }
    jobs_get = {
      lambda_key = "jobs_get"
      route_key  = "GET /jobs/{id}"
    }
    jobs_list = {
      lambda_key = "jobs_list"
      route_key  = "GET /jobs"
    }
    items_create = {
      lambda_key = "items_create"
      route_key  = "POST /jobs/{id}/items"
    }
    items_analyse = {
      lambda_key = "items_analyse"
      route_key  = "POST /jobs/{id}/items/{itemId}/analyse"
    }
    items_update = {
      lambda_key = "items_update"
      route_key  = "PATCH /jobs/{id}/items/{itemId}"
    }
  }
}

resource "aws_apigatewayv2_integration" "handlers" {
  for_each = local.routes

  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.handlers[each.value.lambda_key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "handlers" {
  for_each = local.routes

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value.route_key
  target    = "integrations/${aws_apigatewayv2_integration.handlers[each.key].id}"
}

resource "aws_lambda_permission" "api_gateway" {
  for_each = local.routes

  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.handlers[each.value.lambda_key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
