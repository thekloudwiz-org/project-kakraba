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

variable "dynamodb_table_arn" {
  description = "DynamoDB table ARN for access policy"
  type        = string
}

variable "cloudfront_secret_arn" {
  description = "Secrets Manager secret ARN for CloudFront private key"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for content storage"
  type        = string
}
