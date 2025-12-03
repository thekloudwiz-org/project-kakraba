output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.content.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.content.arn
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.content.bucket_regional_domain_name
}

output "cloudfront_logs_bucket_id" {
  description = "S3 bucket ID for CloudFront logs"
  value       = aws_s3_bucket.cloudfront_logs.id
}

output "cloudfront_logs_bucket_domain_name" {
  description = "S3 bucket domain name for CloudFront logs"
  value       = aws_s3_bucket.cloudfront_logs.bucket_domain_name
}
