output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.content.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.content.id
}

output "cloudfront_key_pair_id" {
  description = "CloudFront public key ID for signed URLs"
  value       = aws_cloudfront_public_key.signing_key.id
}

output "cloudfront_oai_iam_arn" {
  description = "CloudFront Origin Access Identity IAM ARN"
  value       = aws_cloudfront_origin_access_identity.content.iam_arn
}

output "cloudfront_private_key_secret_arn" {
  description = "ARN of the Secrets Manager secret containing CloudFront private key"
  value       = aws_secretsmanager_secret.cloudfront_private_key.arn
}
