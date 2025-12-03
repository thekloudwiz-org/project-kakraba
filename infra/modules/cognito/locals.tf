# Local values for Cognito module naming convention
# Naming pattern: <project>-<environment>-<resource>

locals {
  # Base naming components
  name_prefix = "${var.project_name}-${var.environment}"

  # Resource-specific names
  user_pool_name        = "${local.name_prefix}-user-pool"
  user_pool_client_name = "${local.name_prefix}-api-client"
  user_pool_domain      = "${local.name_prefix}-${data.aws_caller_identity.current.account_id}"
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}
