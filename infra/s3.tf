resource "aws_s3_bucket" "estate_liquidation" {
  bucket = "estate-liquidation-${var.environment}"

  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "estate_liquidation" {
  bucket = aws_s3_bucket.estate_liquidation.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "estate_liquidation" {
  bucket = aws_s3_bucket.estate_liquidation.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "estate_liquidation" {
  bucket = aws_s3_bucket.estate_liquidation.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Auto-expire objects to cap storage runaway from any abuse
resource "aws_s3_bucket_lifecycle_configuration" "estate_liquidation" {
  bucket = aws_s3_bucket.estate_liquidation.id

  rule {
    id     = "expire-objects"
    status = "Enabled"

    filter {}

    expiration {
      days = 7
    }

    noncurrent_version_expiration {
      noncurrent_days = 1
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "estate_liquidation" {
  bucket = aws_s3_bucket.estate_liquidation.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}
