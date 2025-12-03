variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "s3_bucket_id" {
  description = "S3 bucket ID for CloudFront origin"
  type        = string
}

variable "s3_bucket_regional_domain" {
  description = "S3 bucket regional domain name"
  type        = string
}

variable "cloudfront_private_key_pem" {
  description = "CloudFront private key in PEM format (optional, will generate if not provided)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "cloudfront_logs_bucket_domain_name" {
  description = "S3 bucket domain name for CloudFront access logs"
  type        = string
}
