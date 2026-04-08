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