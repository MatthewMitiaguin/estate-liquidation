data "aws_ssm_parameter" "anthropic_api_key" {
  name             = "/estate-liquidation/${var.environment}/anthropic-api-key"
  with_decryption  = false
}

data "aws_ssm_parameter" "api_token" {
  name            = "/estate-liquidation/${var.environment}/api-token"
  with_decryption = false
}
