# Local values for consistent naming convention
# Naming pattern: <project>-<environment>-<resource>

locals {
  # Base naming components
  project     = var.project_name
  environment = var.environment

  # Common tags applied to all resources
  common_tags = merge(
    var.tags,
    {
      Project     = local.project
      Environment = local.environment
      ManagedBy   = "terraform"
      Owner       = "TheKloudWiz"
    }
  )
}

# Note: Resource-specific naming is handled within each module
# using the pattern: ${var.project_name}-${var.environment}-<resource>
# This ensures consistent naming across all infrastructure components
