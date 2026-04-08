output "anthropic_api_key_ssm_name" {
  description = "SSM parameter name for the Anthropic API key"
  value       = data.aws_ssm_parameter.anthropic_api_key.name
}

output "api_gateway_url" {
  description = "HTTP API Gateway invoke URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}