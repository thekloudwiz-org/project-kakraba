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

variable "lambda_package_path" {
  description = "Path to the Lambda deployment package (zip file)"
  type        = string
}

variable "table_name" {
  description = "DynamoDB table name"
  type        = string
}

variable "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_key_pair_id" {
  description = "CloudFront key pair ID for signed URLs"
  type        = string
}

variable "cloudfront_secret_arn" {
  description = "ARN of Secrets Manager secret containing CloudFront private key"
  type        = string
}

variable "iam_role_arn" {
  description = "IAM role ARN for Lambda execution"
  type        = string
}
