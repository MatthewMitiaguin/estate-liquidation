locals {
  common_tags = {
    Project     = "estate-liquidation"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
