# Local values for consistent naming convention
# Naming pattern: <project><environment><resource>

locals {
  # Base naming components
  project     = var.project_name
  environment = var.environment

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
}
