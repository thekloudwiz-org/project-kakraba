# Local values for consistent naming convention
# Naming pattern: <project><environment><resource>

locals {
  # Base naming components
  project     = var.project_name
  environment = var.environment

  # Standardized resource names
  # Pattern: kakraba-dev-<resource>
  name_prefix = "${local.project}-${local.environment}"

  # Resource-specific names
  s3_bucket_name       = "${local.name_prefix}-content"
  dynamodb_table_name  = "${local.name_prefix}-creator-vault"
  lambda_function_name = "${local.name_prefix}-access-control"
  api_gateway_name     = "${local.name_prefix}-api"
  cloudfront_key_name  = "${local.name_prefix}-cf-key"
  secrets_manager_name = "${local.name_prefix}-cf-private-key"
  iam_role_name        = "${local.name_prefix}-lambda-role"
  cloudwatch_log_group = "/aws/lambda/${local.name_prefix}-access-control"

  # Common tags
  common_tags = merge(
    var.tags,
    {
      Project     = local.project
      Environment = local.environment
      ManagedBy   = "terraform"
      Owner       = "TheKloudWiz"
    }
  )

  # Region-specific settings
  region = var.aws_region
}
