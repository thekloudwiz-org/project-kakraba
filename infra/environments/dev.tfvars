# Development Environment Configuration

# Project Configuration
project_name = "kakraba"
environment  = "dev"
aws_region   = "eu-central-1"

# Lambda Configuration
lambda_package_path = "../app/lambda.zip"

# Tags
tags = {
  Environment = "dev"
  Project     = "kakraba"
  ManagedBy   = "terraform"
  Owner       = "TheKloudWiz"
}

# Custom Domain Configuration
custom_domain_name = "api-kakraba.thekloudwiz.com"
route53_zone_name  = "thekloudwiz.com"

# Web Hosting Domain Configuration
website_domain = "kakraba.thekloudwiz.com"

# Monitoring Configuration
alarm_email = "" # Set to your email to receive alarm notifications

# Monitoring Thresholds (higher for dev environment)
lambda_error_threshold    = 20
lambda_throttle_threshold = 10
lambda_duration_threshold = 15000

api_5xx_threshold     = 20
api_4xx_threshold     = 100
api_latency_threshold = 3000

dynamodb_error_threshold    = 20
dynamodb_throttle_threshold = 10

cloudfront_error_rate_threshold = 10
