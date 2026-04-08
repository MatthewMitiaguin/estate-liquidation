output "anthropic_api_key_ssm_name" {
  description = "SSM parameter name for the Anthropic API key"
  value       = resource.aws_ssm_parameter.anthropic_api_key.name
}