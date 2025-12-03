# Infrastructure Scripts

This directory contains utility scripts for deploying and managing the infrastructure.

## Available Scripts

### Deployment Scripts

#### `deploy-dev.sh`
Deploys infrastructure to the development environment.

**Usage:**
```bash
./scripts/deploy-dev.sh
```

**What it does:**
- Checks for Lambda package (builds if missing)
- Initializes Terraform
- Validates configuration
- Plans deployment
- Applies changes after confirmation

**Requirements:**
- AWS credentials configured
- Lambda package built (or will build automatically)
- `environments/dev.tfvars` configured

---

#### `deploy-prod.sh`
Deploys infrastructure to the production environment with safety checks.

**Usage:**
```bash
./scripts/deploy-prod.sh
```

**What it does:**
- Requires explicit "PRODUCTION" confirmation
- Verifies tests have passed
- Checks for Lambda package
- Validates configuration
- Plans deployment
- Applies changes after confirmation
- Shows post-deployment checklist

**Requirements:**
- AWS credentials configured
- Lambda package built
- All tests passing
- `environments/prod.tfvars` configured

**Safety Features:**
- Requires typing "PRODUCTION" to proceed
- Asks for test confirmation
- Requires explicit "yes" to apply
- Shows post-deployment monitoring reminder

---

### Validation Scripts

#### `validate-deployment.sh`
Validates that all prerequisites are met before deployment.

**Usage:**
```bash
./scripts/validate-deployment.sh
```

**What it checks:**
- ✓ AWS CLI installed and configured
- ✓ Terraform installed (version >= 1.0)
- ✓ Lambda package exists and is valid
- ✓ Terraform configuration files present
- ✓ Terraform initialized
- ✓ Configuration is valid
- ⚠ Common issues (state files, gitignore)

**Exit codes:**
- `0` - All checks passed or only warnings
- `1` - Errors found, fix before deploying

---

## Script Workflow

### Typical Development Workflow

1. **Make code changes**
   ```bash
   cd ../app
   # Edit code...
   npm test
   ```

2. **Validate deployment**
   ```bash
   cd ../infra
   ./scripts/validate-deployment.sh
   ```

3. **Deploy to dev**
   ```bash
   ./scripts/deploy-dev.sh
   ```

4. **Test in dev environment**
   ```bash
   # Test API endpoints, verify functionality
   ```

5. **Deploy to production** (when ready)
   ```bash
   ./scripts/deploy-prod.sh
   ```

---

### Production Deployment Workflow

1. **Ensure all tests pass**
   ```bash
   cd ../app
   npm test
   ```

2. **Build Lambda package**
   ```bash
   npm run package
   ```

3. **Validate infrastructure**
   ```bash
   cd ../infra
   ./scripts/validate-deployment.sh
   ```

4. **Review changes**
   ```bash
   terraform plan -var-file=environments/prod.tfvars
   ```

5. **Deploy to production**
   ```bash
   ./scripts/deploy-prod.sh
   ```

6. **Monitor deployment**
   - Check CloudWatch logs
   - Verify API responses
   - Monitor error rates

---

## Customization

### Adding New Scripts

To add a new script:

1. Create the script file:
   ```bash
   touch scripts/my-script.sh
   chmod +x scripts/my-script.sh
   ```

2. Add shebang and error handling:
   ```bash
   #!/bin/bash
   set -e  # Exit on error
   ```

3. Document in this README

### Script Best Practices

- Always use `set -e` to exit on errors
- Add color output for better readability
- Include confirmation prompts for destructive actions
- Validate prerequisites before proceeding
- Show clear success/failure messages
- Clean up temporary files

---

## Troubleshooting

### Script Permission Denied

If you get "Permission denied":
```bash
chmod +x scripts/*.sh
```

### AWS Credentials Not Found

Configure AWS CLI:
```bash
aws configure
```

### Terraform Not Initialized

Run from infra directory:
```bash
terraform init
```

### Lambda Package Not Found

Build the package:
```bash
cd ../app
npm run package
cd ../infra
```

---

## Environment Variables

Scripts respect these environment variables:

- `AWS_PROFILE` - AWS CLI profile to use
- `AWS_REGION` - Override default region
- `TF_LOG` - Terraform log level (DEBUG, INFO, WARN, ERROR)

Example:
```bash
AWS_PROFILE=production ./scripts/deploy-prod.sh
```

---

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

### GitHub Actions Example

```yaml
- name: Deploy to Dev
  run: |
    cd infra
    ./scripts/validate-deployment.sh
    ./scripts/deploy-dev.sh
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitLab CI Example

```yaml
deploy:dev:
  script:
    - cd infra
    - ./scripts/validate-deployment.sh
    - ./scripts/deploy-dev.sh
  only:
    - develop
```

---

## Security Notes

⚠️ **Important:**
- Never commit AWS credentials to scripts
- Use environment variables or AWS profiles
- Review scripts before running in production
- Keep scripts in version control
- Audit script changes in pull requests
