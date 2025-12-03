output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.api.arn
}

output "certificate_domain_name" {
  description = "Domain name of the certificate"
  value       = aws_acm_certificate.api.domain_name
}

output "certificate_status" {
  description = "Status of the certificate"
  value       = aws_acm_certificate.api.status
}

output "validated_certificate_arn" {
  description = "ARN of the validated certificate"
  value       = aws_acm_certificate_validation.api.certificate_arn
}
