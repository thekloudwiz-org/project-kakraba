output "creator_certificate_arn" {
  description = "ARN of the validated ACM certificate for creator portal"
  value       = aws_acm_certificate_validation.creator_portal.certificate_arn
}

output "fan_certificate_arn" {
  description = "ARN of the validated ACM certificate for fan portal"
  value       = aws_acm_certificate_validation.fan_portal.certificate_arn
}

output "landing_certificate_arn" {
  description = "ARN of the validated ACM certificate for landing page"
  value       = aws_acm_certificate_validation.landing_page.certificate_arn
}
