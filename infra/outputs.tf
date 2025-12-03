output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "api_id" {
  description = "API Gateway ID"
  value       = module.api_gateway.api_id
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = module.content_delivery.cloudfront_domain
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.content_delivery.cloudfront_distribution_id
}

output "cloudfront_key_pair_id" {
  description = "CloudFront key pair ID for signed URLs"
  value       = module.content_delivery.cloudfront_key_pair_id
}

output "s3_bucket_name" {
  description = "S3 bucket name for content storage"
  value       = module.storage.bucket_id
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.database.table_name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.compute.lambda_function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = module.compute.lambda_function_arn
}

# Cognito Outputs
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = module.cognito.user_pool_arn
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.user_pool_client_id
}

output "cognito_user_pool_domain" {
  description = "Cognito User Pool Domain"
  value       = module.cognito.user_pool_domain
}

output "cognito_hosted_ui_url" {
  description = "Cognito Hosted UI URL for user authentication"
  value       = module.cognito.hosted_ui_url
}

# Custom Domain Outputs
output "custom_domain_name" {
  description = "Custom domain name for API"
  value       = var.custom_domain_name != "" ? var.custom_domain_name : null
}

output "custom_domain_url" {
  description = "Full URL for custom domain API"
  value       = var.custom_domain_name != "" ? "https://${var.custom_domain_name}" : null
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.custom_domain_name != "" && var.route53_zone_name != "" ? module.acm[0].certificate_arn : null
}

# Web Hosting Outputs
output "website_url" {
  description = "Main website URL"
  value       = var.website_domain != "" ? module.web_hosting[0].website_url : null
}

output "landing_page_url" {
  description = "Landing page URL"
  value       = var.website_domain != "" ? module.web_hosting[0].landing_page_url : null
}

output "creator_portal_url" {
  description = "Creator portal URL"
  value       = var.website_domain != "" ? module.web_hosting[0].creator_portal_url : null
}

output "fan_portal_url" {
  description = "Fan portal URL"
  value       = var.website_domain != "" ? module.web_hosting[0].fan_portal_url : null
}

output "website_s3_bucket" {
  description = "Website S3 bucket name"
  value       = var.website_domain != "" ? module.web_hosting[0].s3_bucket_name : null
}

output "website_cloudfront_id" {
  description = "Website CloudFront distribution ID"
  value       = var.website_domain != "" ? module.web_hosting[0].cloudfront_distribution_id : null
}
