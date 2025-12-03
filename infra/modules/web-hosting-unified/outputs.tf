output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "URL of the website"
  value       = "https://${var.domain_name}"
}

output "landing_page_url" {
  description = "URL of the landing page"
  value       = "https://${var.domain_name}"
}

output "creator_portal_url" {
  description = "URL of the creator portal"
  value       = "https://${var.domain_name}/creator"
}

output "fan_portal_url" {
  description = "URL of the fan portal"
  value       = "https://${var.domain_name}/fan"
}
