data "aws_ssm_parameter" "anthropic_api_key" {
  name             = "/estate-liquidation/${var.environment}/anthropic-api-key"
  with_decryption  = false
}
