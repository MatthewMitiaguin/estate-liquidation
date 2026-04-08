resource "aws_ssm_parameter" "anthropic_api_key" {
  name        = "/estate-liquidation/${var.environment}/anthropic-api-key"
  description = "Anthropic API key for Claude vision API"
  type        = "SecureString"
  value       = var.anthropic_api_key

  tags = local.common_tags
}