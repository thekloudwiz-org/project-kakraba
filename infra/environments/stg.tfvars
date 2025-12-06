# Staging Environment Configuration

# Project Configuration
project_name = "kakraba"
environment  = "stg"
aws_region   = "eu-central-1"

# Lambda Configuration
lambda_package_path = "../app/lambda.zip"

# Tags
tags = {
  Environment = "stg"
  Project     = "kakraba"
  ManagedBy   = "terraform"
  Owner       = "TheKloudWiz"
}

# Custom Domain Configuration
custom_domain_name = "api-kakraba-stg.thekloudwiz.com"
route53_zone_name  = "thekloudwiz.com"

# Web Hosting Domain Configuration
website_domain = "kakraba-stg.thekloudwiz.com"

# Monitoring Configuration
alarm_email = "" # Set to your email to receive alarm notifications

# Monitoring Thresholds (moderate for staging environment)
lambda_error_threshold    = 15
lambda_throttle_threshold = 8
lambda_duration_threshold = 12000

api_5xx_threshold     = 15
api_4xx_threshold     = 80
api_latency_threshold = 2500

dynamodb_error_threshold    = 15
dynamodb_throttle_threshold = 8

cloudfront_error_rate_threshold = 8
