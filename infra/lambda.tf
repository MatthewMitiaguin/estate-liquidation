# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

resource "null_resource" "lambda_build" {
  triggers = {
    source_hash = sha256(join("", [
      filesha256("${path.module}/lambda/jobs/create.ts"),
      filesha256("${path.module}/lambda/jobs/get.ts"),
      filesha256("${path.module}/lambda/jobs/list.ts"),
      filesha256("${path.module}/lambda/items/create.ts"),
      filesha256("${path.module}/lambda/items/analyse.ts"),
      filesha256("${path.module}/lambda/items/update.ts"),
      filesha256("${path.module}/lambda/package.json"),
    ]))
  }

  provisioner "local-exec" {
    command     = "npm ci && npm run build"
    working_dir = "${path.module}/lambda"
  }
}

data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/dist"
  output_path = "${path.module}/lambda/lambda.zip"
  depends_on  = [null_resource.lambda_build]
}

# ---------------------------------------------------------------------------
# IAM
# ---------------------------------------------------------------------------

resource "aws_iam_role" "lambda_exec" {
  name = "estate-liquidation-lambda-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "estate-liquidation-lambda-${var.environment}"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ]
        Resource = aws_dynamodb_table.estate_liquidation.arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = "${aws_s3_bucket.estate_liquidation.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter"]
        Resource = aws_ssm_parameter.anthropic_api_key.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
    ]
  })
}

# ---------------------------------------------------------------------------
# Lambda functions
# ---------------------------------------------------------------------------

locals {
  lambda_env = {
    TABLE_NAME            = aws_dynamodb_table.estate_liquidation.name
    BUCKET_NAME           = aws_s3_bucket.estate_liquidation.bucket
    ANTHROPIC_API_KEY_SSM = aws_ssm_parameter.anthropic_api_key.name
  }

  lambdas = {
    jobs_create = {
      name    = "jobs-create"
      handler = "jobs/create.handler"
      timeout = 30
      memory  = 256
    }
    jobs_get = {
      name    = "jobs-get"
      handler = "jobs/get.handler"
      timeout = 30
      memory  = 256
    }
    jobs_list = {
      name    = "jobs-list"
      handler = "jobs/list.handler"
      timeout = 30
      memory  = 256
    }
    items_create = {
      name    = "items-create"
      handler = "items/create.handler"
      timeout = 30
      memory  = 256
    }
    items_analyse = {
      name    = "items-analyse"
      handler = "items/analyse.handler"
      timeout = 120
      memory  = 512
    }
    items_update = {
      name    = "items-update"
      handler = "items/update.handler"
      timeout = 30
      memory  = 256
    }
  }
}

resource "aws_lambda_function" "handlers" {
  for_each = local.lambdas

  function_name    = "estate-liquidation-${each.value.name}-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = each.value.handler
  runtime          = "nodejs20.x"
  timeout          = each.value.timeout
  memory_size      = each.value.memory
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = local.lambda_env
  }

  tags = local.common_tags
}
