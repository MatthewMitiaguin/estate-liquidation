variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Environment name e.g. dev, prod"
  type        = string
  default     = "dev"
}

variable "lambda_concurrency" {
  description = "Reserved concurrent executions for the API Lambda. Set to 0 to disable the API entirely (off-switch). Set to -1 (default) for no reservation."
  type        = number
  default     = -1
}