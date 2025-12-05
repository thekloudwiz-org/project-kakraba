variable "creator_domain" {
  description = "Domain name for creator portal certificate"
  type        = string
}

variable "fan_domain" {
  description = "Domain name for fan portal certificate"
  type        = string
}

variable "landing_domain" {
  description = "Domain name for landing page certificate"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID for DNS validation"
  type        = string
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
