variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "lambda_package_path" {
  description = "Path to the Lambda deployment package (zip file)"
  type        = string
}

variable "cloudfront_private_key_pem" {
  description = "CloudFront private key in PEM format for signed URLs (optional, will be generated if not provided)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "custom_domain_name" {
  description = "Custom domain name for API Gateway (optional)"
  type        = string
  default     = ""
}

variable "route53_zone_name" {
  description = "Route53 hosted zone name (e.g., thekloudwiz.com)"
  type        = string
  default     = ""
}

# Web Hosting Variables
variable "website_domain" {
  description = "Custom domain for unified website (e.g., kakraba.thekloudwiz.com)"
  type        = string
  default     = ""
}

# Subdomain Web Hosting Variables
variable "use_subdomain_hosting" {
  description = "Use separate subdomains for portals instead of path-based routing"
  type        = bool
  default     = false
}

variable "creator_portal_domain" {
  description = "Domain for creator portal (e.g., create-kakraba.thekloudwiz.com)"
  type        = string
  default     = ""
}

variable "fan_portal_domain" {
  description = "Domain for fan portal (e.g., fan-kakraba.thekloudwiz.com)"
  type        = string
  default     = ""
}

variable "landing_page_domain" {
  description = "Domain for landing page (e.g., kakraba.thekloudwiz.com)"
  type        = string
  default     = ""
}

# Monitoring Variables
variable "lambda_error_threshold" {
  description = "Threshold for Lambda errors alarm"
  type        = number
  default     = 10
}

variable "lambda_throttle_threshold" {
  description = "Threshold for Lambda throttles alarm"
  type        = number
  default     = 5
}

variable "lambda_duration_threshold" {
  description = "Threshold for Lambda duration alarm (milliseconds)"
  type        = number
  default     = 10000
}

variable "api_5xx_threshold" {
  description = "Threshold for API Gateway 5XX errors"
  type        = number
  default     = 10
}

variable "api_4xx_threshold" {
  description = "Threshold for API Gateway 4XX errors"
  type        = number
  default     = 50
}

variable "api_latency_threshold" {
  description = "Threshold for API Gateway latency (milliseconds)"
  type        = number
  default     = 2000
}

variable "dynamodb_error_threshold" {
  description = "Threshold for DynamoDB errors"
  type        = number
  default     = 10
}

variable "dynamodb_throttle_threshold" {
  description = "Threshold for DynamoDB throttle events"
  type        = number
  default     = 5
}

variable "cloudfront_error_rate_threshold" {
  description = "Threshold for CloudFront error rate (percentage)"
  type        = number
  default     = 5
}

variable "alarm_email" {
  description = "Email address for alarm notifications (leave empty to skip email notifications)"
  type        = string
  default     = ""
}
