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

variable "lambda_invoke_arn" {
  description = "Lambda function invoke ARN"
  type        = string
}

variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for API authorization"
  type        = string
}

variable "cognito_user_pool_client_ids" {
  description = "List of Cognito User Pool Client IDs"
  type        = list(string)
  default     = []
}

variable "custom_domain_name" {
  description = "Custom domain name for API Gateway (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for custom domain (optional)"
  type        = string
  default     = ""
}

variable "zone_id" {
  description = "Route53 hosted zone ID for DNS record (optional)"
  type        = string
  default     = ""
}
