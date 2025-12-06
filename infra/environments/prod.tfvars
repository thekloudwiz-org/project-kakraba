# Production Environment Configuration

# Project Configuration
project_name = "kakraba"
environment  = "prod"
aws_region   = "eu-central-1"

# Lambda Configuration
lambda_package_path = "../app/lambda.zip"

# Tags
tags = {
  Environment = "production"
  Project     = "kakraba"
  ManagedBy   = "terraform"
  Owner       = "TheKloudWiz"
  CostCenter  = "engineering"
}

# Monitoring Configuration
alarm_email = "" # Set to your email to receive alarm notifications

# Monitoring Thresholds (stricter for production)
lambda_error_threshold    = 10
lambda_throttle_threshold = 5
lambda_duration_threshold = 10000

api_5xx_threshold     = 10
api_4xx_threshold     = 50
api_latency_threshold = 2000

dynamodb_error_threshold    = 10
dynamodb_throttle_threshold = 5

cloudfront_error_rate_threshold = 5
