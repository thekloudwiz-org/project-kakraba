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

# Web Hosting Outputs (Unified)
output "website_url" {
  description = "Main website URL"
  value       = !var.use_subdomain_hosting && var.website_domain != "" ? module.web_hosting[0].website_url : null
}

output "landing_page_url" {
  description = "Landing page URL"
  value       = var.use_subdomain_hosting ? (var.route53_zone_name != "" ? module.web_hosting_subdomains[0].landing_page_url : null) : (var.website_domain != "" ? module.web_hosting[0].landing_page_url : null)
}

output "creator_portal_url" {
  description = "Creator portal URL"
  value       = var.use_subdomain_hosting ? (var.route53_zone_name != "" ? module.web_hosting_subdomains[0].creator_portal_url : null) : (var.website_domain != "" ? module.web_hosting[0].creator_portal_url : null)
}

output "fan_portal_url" {
  description = "Fan portal URL"
  value       = var.use_subdomain_hosting ? (var.route53_zone_name != "" ? module.web_hosting_subdomains[0].fan_portal_url : null) : (var.website_domain != "" ? module.web_hosting[0].fan_portal_url : null)
}

output "website_s3_bucket" {
  description = "Website S3 bucket name (unified hosting)"
  value       = !var.use_subdomain_hosting && var.website_domain != "" ? module.web_hosting[0].s3_bucket_name : null
}

output "website_cloudfront_id" {
  description = "Website CloudFront distribution ID (unified hosting)"
  value       = !var.use_subdomain_hosting && var.website_domain != "" ? module.web_hosting[0].cloudfront_distribution_id : null
}

# Subdomain Hosting Outputs
output "creator_s3_bucket" {
  description = "Creator portal S3 bucket name (subdomain hosting)"
  value       = var.use_subdomain_hosting && var.route53_zone_name != "" ? module.web_hosting_subdomains[0].creator_s3_bucket_name : null
}

output "creator_cloudfront_id" {
  description = "Creator portal CloudFront distribution ID (subdomain hosting)"
  value       = var.use_subdomain_hosting && var.route53_zone_name != "" ? module.web_hosting_subdomains[0].creator_cloudfront_id : null
}

output "fan_s3_bucket" {
  description = "Fan portal S3 bucket name (subdomain hosting)"
  value       = var.use_subdomain_hosting && var.route53_zone_name != "" ? module.web_hosting_subdomains[0].fan_s3_bucket_name : null
}

output "fan_cloudfront_id" {
  description = "Fan portal CloudFront distribution ID (subdomain hosting)"
  value       = var.use_subdomain_hosting && var.route53_zone_name != "" ? module.web_hosting_subdomains[0].fan_cloudfront_id : null
}

output "landing_s3_bucket" {
  description = "Landing page S3 bucket name (subdomain hosting)"
  value       = var.use_subdomain_hosting && var.route53_zone_name != "" ? module.web_hosting_subdomains[0].landing_s3_bucket_name : null
}

output "landing_cloudfront_id" {
  description = "Landing page CloudFront distribution ID (subdomain hosting)"
  value       = var.use_subdomain_hosting && var.route53_zone_name != "" ? module.web_hosting_subdomains[0].landing_cloudfront_id : null
}

# Monitoring Outputs
output "main_dashboard_name" {
  description = "Name of the main CloudWatch dashboard"
  value       = module.monitoring.main_dashboard_name
}

output "main_dashboard_url" {
  description = "URL to access the main CloudWatch dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${module.monitoring.main_dashboard_name}"
}

output "business_metrics_dashboard_name" {
  description = "Name of the business metrics dashboard"
  value       = module.monitoring.business_metrics_dashboard_name
}

output "business_metrics_dashboard_url" {
  description = "URL to access the business metrics dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${module.monitoring.business_metrics_dashboard_name}"
}

output "alarm_sns_topic_arn" {
  description = "ARN of the SNS topic for alarm notifications"
  value       = module.monitoring.sns_topic_arn
}

output "alarm_names" {
  description = "List of all CloudWatch alarm names"
  value       = module.monitoring.alarm_names
}

output "xray_console_url" {
  description = "URL to access AWS X-Ray console"
  value       = "https://console.aws.amazon.com/xray/home?region=${var.aws_region}#/service-map"
}
