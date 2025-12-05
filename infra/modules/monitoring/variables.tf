# Variables for monitoring module

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Lambda monitoring variables
variable "lambda_function_names" {
  description = "List of Lambda function names to monitor"
  type        = list(string)
  default     = []
}

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

# API Gateway monitoring variables
variable "api_gateway_name" {
  description = "Name of the API Gateway to monitor"
  type        = string
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

# DynamoDB monitoring variables
variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table to monitor"
  type        = string
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

# CloudFront monitoring variables
variable "cloudfront_error_rate_threshold" {
  description = "Threshold for CloudFront error rate (percentage)"
  type        = number
  default     = 5
}

# Alarm notification variables
variable "alarm_email" {
  description = "Email address for alarm notifications"
  type        = string
  default     = ""
}

# Log group prefix
variable "log_group_prefix" {
  description = "Prefix for CloudWatch log groups"
  type        = string
  default     = "/aws/lambda"
}
