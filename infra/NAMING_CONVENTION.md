# Naming Convention

## Pattern

All resources follow the naming pattern: `<project><environment><resource>`

Example: `kakraba-dev-content` (S3 bucket for development)

## Implementation

Naming is centralized in `locals.tf` using Terraform local values.

## Resource Names

### Development Environment (dev)

| Resource | Name | Example |
|----------|------|---------|
| S3 Bucket | `kakraba-dev-content` | Content storage |
| DynamoDB Table | `kakraba-dev-creator-vault` | Access rights & products |
| Lambda Function | `kakraba-dev-access-control` | Access control handler |
| API Gateway | `kakraba-dev-api` | HTTP API |
| IAM Role | `kakraba-dev-lambda-role` | Lambda execution role |
| CloudWatch Logs | `/aws/lambda/kakraba-dev-access-control` | Lambda logs |
| Secrets Manager | `kakraba-dev-cf-private-key` | CloudFront private key |

### Production Environment (prod)

| Resource | Name | Example |
|----------|------|---------|
| S3 Bucket | `kakraba-prod-content` | Content storage |
| DynamoDB Table | `kakraba-prod-creator-vault` | Access rights & products |
| Lambda Function | `kakraba-prod-access-control` | Access control handler |
| API Gateway | `kakraba-prod-api` | HTTP API |
| IAM Role | `kakraba-prod-lambda-role` | Lambda execution role |
| CloudWatch Logs | `/aws/lambda/kakraba-prod-access-control` | Lambda logs |
| Secrets Manager | `kakraba-prod-cf-private-key` | CloudFront private key |

## Usage in Terraform

### In locals.tf

```hcl
locals {
  name_prefix = "${local.project}-${local.environment}"
  
  s3_bucket_name = "${local.name_prefix}-content"
  dynamodb_table_name = "${local.name_prefix}-creator-vault"
  # ... other resources
}
```

### In Modules

Modules receive `project_name` and `environment` variables and construct names:

```hcl
resource "aws_s3_bucket" "content" {
  bucket = "${var.project_name}-${var.environment}-content"
  # ...
}
```

## Benefits

1. **Consistency**: All resources follow the same pattern
2. **Environment Isolation**: Easy to identify which environment a resource belongs to
3. **No Conflicts**: Different environments can coexist in the same AWS account
4. **Easy Cleanup**: Filter resources by name prefix for cleanup
5. **Cost Tracking**: Tag-based cost allocation by environment

## Tags

All resources are tagged with:
- `Project`: kakraba
- `Environment`: dev/prod
- `ManagedBy`: terraform
- Additional custom tags from `var.tags`

## Region

Default region: **eu-central-1** (Frankfurt)

Can be overridden in environment-specific `.tfvars` files.

## Finding Resources

### AWS CLI

```bash
# List all dev resources
aws resourcegroupstaggingapi get-resources \
  --tag-filters Key=Project,Values=kakraba Key=Environment,Values=dev \
  --region eu-central-1

# List S3 buckets
aws s3 ls | grep kakraba-dev

# List Lambda functions
aws lambda list-functions --region eu-central-1 | grep kakraba-dev

# List DynamoDB tables
aws dynamodb list-tables --region eu-central-1 | grep kakraba-dev
```

### AWS Console

1. Select region: **eu-central-1**
2. Search for resources by name prefix: `kakraba-dev-` or `kakraba-prod-`
3. Or filter by tags: `Project=kakraba`, `Environment=dev`

## Modifying the Convention

To change the naming pattern:

1. Edit `locals.tf`
2. Update the `name_prefix` or individual resource names
3. Run `terraform plan` to see what will change
4. **Warning**: Changing names will recreate resources!

## Best Practices

1. **Never hardcode names** - Always use variables or locals
2. **Keep names short** - Some AWS services have length limits
3. **Use lowercase** - Avoid case sensitivity issues
4. **Use hyphens** - Not underscores (AWS convention)
5. **Be descriptive** - Name should indicate the resource purpose
