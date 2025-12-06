# Lambda function for content access control
resource "aws_lambda_function" "access_control" {
  filename         = var.lambda_package_path
  function_name    = "${var.project_name}-${var.environment}-access-control"
  role             = var.iam_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256(var.lambda_package_path)
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512

  environment {
    variables = {
      TABLE_NAME                        = var.table_name
      CLOUDFRONT_DOMAIN                 = var.cloudfront_domain
      CLOUDFRONT_KEY_PAIR_ID            = var.cloudfront_key_pair_id
      CLOUDFRONT_PRIVATE_KEY_SECRET_ARN = var.cloudfront_secret_arn
      NODE_ENV                          = var.environment
    }
  }

  # Enable X-Ray tracing for observability
  tracing_config {
    mode = "Active"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-access-control"
    }
  )

  # Ignore code changes since Lambda is deployed via CI/CD
  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash
    ]
  }
}

# CloudWatch Log Group for Lambda logs
resource "aws_cloudwatch_log_group" "access_control" {
  name              = "/aws/lambda/${aws_lambda_function.access_control.function_name}"
  retention_in_days = 14

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-access-control-logs"
    }
  )
}
