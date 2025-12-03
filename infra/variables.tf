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
