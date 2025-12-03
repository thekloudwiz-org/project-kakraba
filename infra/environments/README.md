# Environment Configurations

This directory contains environment-specific Terraform variable files.

## Available Environments

### Development (`dev.tfvars`)
- Used for development and testing
- Lower resource limits
- Relaxed security for easier debugging
- Cost-optimized settings

### Production (`prod.tfvars`)
- Used for production workloads
- Higher resource limits
- Strict security settings
- Performance-optimized settings

## Usage

### Deploy to Development

```bash
cd ../
terraform init
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

### Deploy to Production

```bash
cd ../
terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

## Configuration Guidelines

### Required Variables

All environment files must define:
- `project_name`: Project identifier
- `environment`: Environment name (dev, staging, prod)
- `aws_region`: AWS region for deployment
- `lambda_package_path`: Path to Lambda deployment package
- `cognito_user_pool_id`: Cognito User Pool ID for authentication

### Optional Variables

- `cognito_user_pool_client_ids`: List of allowed Cognito client IDs
- `tags`: Additional resource tags

## Adding New Environments

To add a new environment (e.g., staging):

1. Copy an existing file:
   ```bash
   cp dev.tfvars staging.tfvars
   ```

2. Update the values:
   ```hcl
   environment = "staging"
   # ... other staging-specific values
   ```

3. Deploy:
   ```bash
   terraform apply -var-file=environments/staging.tfvars
   ```

## Security Notes

⚠️ **Important**:
- Never commit sensitive values (API keys, passwords) to these files
- Use AWS Secrets Manager or Parameter Store for sensitive data
- Consider using `.tfvars.encrypted` files for sensitive environments
- Add `*.tfvars` to `.gitignore` if they contain secrets

## Best Practices

1. **Naming Convention**: Use lowercase environment names (dev, staging, prod)
2. **Tagging**: Always include environment tags for cost tracking
3. **Region**: Consider using different regions for different environments
4. **State Management**: Use separate state files per environment
5. **Validation**: Run `terraform validate` before applying changes

## Environment-Specific Settings

### Development
- Smaller Lambda memory (512MB)
- Shorter log retention (7 days)
- On-demand DynamoDB billing
- No CloudFront caching (for testing)

### Production
- Larger Lambda memory (1024MB)
- Longer log retention (30 days)
- Provisioned DynamoDB capacity (if needed)
- CloudFront caching enabled
- Multi-AZ deployments
- Backup enabled

## Workspace Management (Alternative Approach)

Instead of `-var-file`, you can use Terraform workspaces:

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new prod

# Switch to dev
terraform workspace select dev
terraform apply -var-file=environments/dev.tfvars

# Switch to prod
terraform workspace select prod
terraform apply -var-file=environments/prod.tfvars
```

This keeps state files separate automatically.
