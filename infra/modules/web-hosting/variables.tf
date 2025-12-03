variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "site_name" {
  description = "Name of the site (landing, creator, fan)"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the site"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for the domain"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS records"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
