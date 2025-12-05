# Terraform Backend Configuration
# State is stored in S3 with native lockfile support

terraform {
  backend "s3" {
    bucket = "thekloudwiz-tf-state-bucket"
    # key is provided via -backend-config in CI/CD: project-kakraba/<env>-tf.state
    region = "eu-central-1"

    # Use S3 native lockfile instead of DynamoDB
    use_lockfile = true

    # Enable encryption at rest
    encrypt = true

    # Enable versioning for state file recovery
    # Note: Versioning must be enabled on the S3 bucket
  }
}
