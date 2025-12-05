variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "creator_domain" {
  description = "Domain name for creator portal (e.g., create-kakraba.thekloudwiz.com)"
  type        = string
}

variable "fan_domain" {
  description = "Domain name for fan portal (e.g., fan-kakraba.thekloudwiz.com)"
  type        = string
}

variable "landing_domain" {
  description = "Domain name for landing page (e.g., kakraba.thekloudwiz.com)"
  type        = string
}

variable "creator_acm_certificate_arn" {
  description = "ACM certificate ARN for creator portal (must be in us-east-1)"
  type        = string
}

variable "fan_acm_certificate_arn" {
  description = "ACM certificate ARN for fan portal (must be in us-east-1)"
  type        = string
}

variable "landing_acm_certificate_arn" {
  description = "ACM certificate ARN for landing page (must be in us-east-1)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
