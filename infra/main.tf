# Data source to fetch Route53 hosted zone ID dynamically
data "aws_route53_zone" "main" {
  count = var.custom_domain_name != "" && var.route53_zone_name != "" ? 1 : 0
  name  = var.route53_zone_name
}

# ACM Module - SSL certificate for custom domain (optional)
module "acm" {
  count  = var.custom_domain_name != "" && var.route53_zone_name != "" ? 1 : 0
  source = "./modules/acm"

  domain_name = var.custom_domain_name
  zone_id     = data.aws_route53_zone.main[0].zone_id
  tags        = local.common_tags
}

# Cognito Module - User authentication
module "cognito" {
  source = "./modules/cognito"

  project_name = local.project
  environment  = local.environment
  tags         = local.common_tags
}

# Storage Module - S3 bucket for content
module "storage" {
  source = "./modules/storage"

  project_name       = local.project
  environment        = local.environment
  tags               = local.common_tags
  cloudfront_oai_arn = module.content_delivery.cloudfront_oai_iam_arn
}

# Content Delivery Module - CloudFront distribution and signed URL configuration
module "content_delivery" {
  source = "./modules/content-delivery"

  project_name                       = local.project
  environment                        = local.environment
  tags                               = local.common_tags
  s3_bucket_id                       = module.storage.bucket_id
  s3_bucket_regional_domain          = module.storage.bucket_regional_domain_name
  cloudfront_logs_bucket_domain_name = module.storage.cloudfront_logs_bucket_domain_name
  cloudfront_private_key_pem         = var.cloudfront_private_key_pem
}

# Database Module - DynamoDB table for access rights and products
module "database" {
  source = "./modules/database"

  project_name = local.project
  environment  = local.environment
  tags         = local.common_tags
}

# IAM Module - Lambda execution role and policies
module "iam" {
  source = "./modules/iam"

  project_name          = local.project
  environment           = local.environment
  tags                  = local.common_tags
  dynamodb_table_arn    = module.database.table_arn
  cloudfront_secret_arn = module.content_delivery.cloudfront_private_key_secret_arn
}

# Compute Module - Lambda function
module "compute" {
  source = "./modules/compute"

  project_name           = local.project
  environment            = local.environment
  tags                   = local.common_tags
  lambda_package_path    = var.lambda_package_path
  table_name             = module.database.table_name
  cloudfront_domain      = module.content_delivery.cloudfront_domain
  cloudfront_key_pair_id = module.content_delivery.cloudfront_key_pair_id
  cloudfront_secret_arn  = module.content_delivery.cloudfront_private_key_secret_arn
  iam_role_arn           = module.iam.lambda_role_arn
}

# API Gateway Module - HTTP API with Cognito authorization
module "api_gateway" {
  source = "./modules/api-gateway"

  project_name                 = local.project
  environment                  = local.environment
  tags                         = local.common_tags
  lambda_invoke_arn            = module.compute.lambda_invoke_arn
  lambda_function_name         = module.compute.lambda_function_name
  cognito_user_pool_id         = module.cognito.user_pool_id
  cognito_user_pool_client_ids = [module.cognito.user_pool_client_id]

  # Custom domain configuration (optional)
  custom_domain_name = var.custom_domain_name
  certificate_arn    = var.custom_domain_name != "" && var.route53_zone_name != "" ? module.acm[0].validated_certificate_arn : ""
  zone_id            = var.custom_domain_name != "" && var.route53_zone_name != "" ? data.aws_route53_zone.main[0].zone_id : ""
}

# ACM Certificate for Unified Web Hosting (CloudFront requires us-east-1)
module "acm_website" {
  count  = var.website_domain != "" && var.route53_zone_name != "" ? 1 : 0
  source = "./modules/acm-cloudfront"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  domain_name = var.website_domain
  zone_id     = data.aws_route53_zone.main[0].zone_id
  tags        = local.common_tags
}

# Unified Web Hosting - Single bucket with path-based routing
module "web_hosting" {
  count  = var.website_domain != "" && var.route53_zone_name != "" ? 1 : 0
  source = "./modules/web-hosting-unified"

  project_name        = local.project
  environment         = local.environment
  domain_name         = var.website_domain
  acm_certificate_arn = module.acm_website[0].validated_certificate_arn
  route53_zone_id     = data.aws_route53_zone.main[0].zone_id
  tags                = local.common_tags
}
