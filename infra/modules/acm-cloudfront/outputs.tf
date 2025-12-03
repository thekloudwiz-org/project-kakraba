output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.cloudfront.arn
}

output "validated_certificate_arn" {
  description = "ARN of the validated ACM certificate"
  value       = aws_acm_certificate_validation.cloudfront.certificate_arn
}
