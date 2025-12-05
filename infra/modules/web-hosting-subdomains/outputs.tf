# Creator Portal Outputs
output "creator_portal_url" {
  description = "Creator portal URL"
  value       = "https://${var.creator_domain}"
}

output "creator_s3_bucket_name" {
  description = "Creator portal S3 bucket name"
  value       = aws_s3_bucket.creator_portal.id
}

output "creator_cloudfront_id" {
  description = "Creator portal CloudFront distribution ID"
  value       = aws_cloudfront_distribution.creator_portal.id
}

output "creator_cloudfront_domain" {
  description = "Creator portal CloudFront domain name"
  value       = aws_cloudfront_distribution.creator_portal.domain_name
}

# Fan Portal Outputs
output "fan_portal_url" {
  description = "Fan portal URL"
  value       = "https://${var.fan_domain}"
}

output "fan_s3_bucket_name" {
  description = "Fan portal S3 bucket name"
  value       = aws_s3_bucket.fan_portal.id
}

output "fan_cloudfront_id" {
  description = "Fan portal CloudFront distribution ID"
  value       = aws_cloudfront_distribution.fan_portal.id
}

output "fan_cloudfront_domain" {
  description = "Fan portal CloudFront domain name"
  value       = aws_cloudfront_distribution.fan_portal.domain_name
}

# Landing Page Outputs
output "landing_page_url" {
  description = "Landing page URL"
  value       = "https://${var.landing_domain}"
}

output "landing_s3_bucket_name" {
  description = "Landing page S3 bucket name"
  value       = aws_s3_bucket.landing_page.id
}

output "landing_cloudfront_id" {
  description = "Landing page CloudFront distribution ID"
  value       = aws_cloudfront_distribution.landing_page.id
}

output "landing_cloudfront_domain" {
  description = "Landing page CloudFront domain name"
  value       = aws_cloudfront_distribution.landing_page.domain_name
}
