# Environment Variables Documentation

Complete reference for all environment variables used in the Kakraba platform.

## Table of Contents

- [Overview](#overview)
- [Infrastructure Variables](#infrastructure-variables)
- [Backend Variables](#backend-variables)
- [Frontend Variables](#frontend-variables)
- [Security Best Practices](#security-best-practices)

## Overview

The Kakraba platform uses environment variables for configuration across different environments (development, staging, production). This document provides a complete reference for all variables.

### Variable Naming Convention

- **Terraform:** `snake_case` (e.g., `project_name`)
- **Backend:** `UPPER_SNAKE_CASE` (e.g., `TABLE_NAME`)
- **Frontend:** `VITE_UPPER_SNAKE_CASE` (e.g., `VITE_API_ENDPOINT`)

## Infrastructure Variables

### Terraform Variables

Location: `infra/environments/{env}.tfvars`

#### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `project_name` | string | Project identifier | `"kakraba"` |
| `environment` | string | Environment name | `"dev"`, `"prod"` |
| `aws_region` | string | AWS region | `"eu-central-1"` |
| `lambda_package_path` | string | Path to Lambda zip | `"../app/lambda.zip"` |

#### Domain Configuration

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `custom_domain_name` | string | API custom domain | `"api-kakraba.thekloudwiz.com"` |
| `route53_zone_name` | string | Route53 hosted zone | `"thekloudwiz.com"` |
| `website_domain` | string | Website domain | `"kakraba.thekloudwiz.com"` |

#### Subdomain Hosting (Optional)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `use_subdomain_hosting` | bool | Use separate subdomains | `false` |
| `creator_portal_domain` | string | Creator portal domain | `"create-kakraba.thekloudwiz.com"` |
| `fan_portal_domain` | string | Fan portal domain | `"fan-kakraba.thekloudwiz.com"` |
| `landing_page_domain` | string | Landing page domain | `"kakraba.thekloudwiz.com"` |

#### Monitoring Configuration

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `alarm_email` | string | Email for alarm notifications | `""` |
| `lambda_error_threshold` | number | Lambda error alarm threshold | `10` |
| `lambda_throttle_threshold` | number | Lambda throttle alarm threshold | `5` |
| `lambda_duration_threshold` | number | Lambda duration threshold (ms) | `10000` |
| `api_5xx_threshold` | number | API 5XX error threshold | `10` |
| `api_4xx_threshold` | number | API 4XX error threshold | `50` |
| `api_latency_threshold` | number | API latency threshold (ms) | `2000` |
| `dynamodb_error_threshold` | number | DynamoDB error threshold | `10` |
| `dynamodb_throttle_threshold` | number | DynamoDB throttle threshold | `5` |
| `cloudfront_error_rate_threshold` | number | CloudFront error rate (%) | `5` |

#### Tags

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `tags` | map(string) | Resource tags | `{ Environment = "dev" }` |

### Example Configuration

**Development (`infra/environments/dev.tfvars`):**
```hcl
# Project Configuration
project_name = "kakraba"
environment  = "dev"
aws_region   = "eu-central-1"

# Lambda Configuration
lambda_package_path = "../app/lambda.zip"

# Domain Configuration
custom_domain_name = "api-kakraba.thekloudwiz.com"
route53_zone_name  = "thekloudwiz.com"
website_domain     = "kakraba.thekloudwiz.com"

# Monitoring (higher thresholds for dev)
alarm_email                     = "dev-team@example.com"
lambda_error_threshold          = 20
api_5xx_threshold               = 20
cloudfront_error_rate_threshold = 10

# Tags
tags = {
  Environment = "dev"
  Project     = "kakraba"
  ManagedBy   = "terraform"
}
```

**Production (`infra/environments/prod.tfvars`):**
```hcl
# Project Configuration
project_name = "kakraba"
environment  = "prod"
aws_region   = "eu-central-1"

# Lambda Configuration
lambda_package_path = "../app/lambda.zip"

# Domain Configuration
custom_domain_name = "api-kakraba.thekloudwiz.com"
route53_zone_name  = "thekloudwiz.com"
website_domain     = "kakraba.thekloudwiz.com"

# Monitoring (stricter thresholds for prod)
alarm_email                     = "ops-team@example.com"
lambda_error_threshold          = 10
api_5xx_threshold               = 10
cloudfront_error_rate_threshold = 5

# Tags
tags = {
  Environment = "production"
  Project     = "kakraba"
  ManagedBy   = "terraform"
  CostCenter  = "engineering"
}
```

## Backend Variables

### Lambda Environment Variables

Location: Set via Terraform in Lambda function configuration

#### Access Control Lambda

| Variable | Type | Description | Source |
|----------|------|-------------|--------|
| `TABLE_NAME` | string | DynamoDB table name | Terraform output |
| `CLOUDFRONT_DOMAIN` | string | CloudFront distribution domain | Terraform output |
| `CLOUDFRONT_KEY_PAIR_ID` | string | CloudFront key pair ID | Terraform output |
| `CLOUDFRONT_SECRET_ARN` | string | Secrets Manager ARN for CF key | Terraform output |
| `AWS_REGION` | string | AWS region | Terraform variable |

**Example:**
```bash
TABLE_NAME=kakraba-dev-creator-vault
CLOUDFRONT_DOMAIN=d1rwanl0beslh.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K5X4ESOPM7VNU
CLOUDFRONT_SECRET_ARN=arn:aws:secretsmanager:eu-central-1:123456789012:secret:kakraba-dev-cf-private-key
AWS_REGION=eu-central-1
```

#### User Management Lambda

| Variable | Type | Description | Source |
|----------|------|-------------|--------|
| `TABLE_NAME` | string | DynamoDB table name | Terraform output |
| `COGNITO_USER_POOL_ID` | string | Cognito user pool ID | Terraform output |
| `AWS_REGION` | string | AWS region | Terraform variable |

#### Content Management Lambda

| Variable | Type | Description | Source |
|----------|------|-------------|--------|
| `TABLE_NAME` | string | DynamoDB table name | Terraform output |
| `CONTENT_BUCKET` | string | S3 bucket for content | Terraform output |
| `AWS_REGION` | string | AWS region | Terraform variable |

#### Payment Service Lambda

| Variable | Type | Description | Source |
|----------|------|-------------|--------|
| `TABLE_NAME` | string | DynamoDB table name | Terraform output |
| `STRIPE_SECRET_KEY` | string | Stripe secret key | Secrets Manager |
| `STRIPE_WEBHOOK_SECRET` | string | Stripe webhook secret | Secrets Manager |
| `AWS_REGION` | string | AWS region | Terraform variable |

#### Analytics Service Lambda

| Variable | Type | Description | Source |
|----------|------|-------------|--------|
| `TABLE_NAME` | string | DynamoDB table name | Terraform output |
| `AWS_REGION` | string | AWS region | Terraform variable |

### Local Development

For local development, create `.env` file in `app/` directory:

```bash
# DynamoDB
TABLE_NAME=kakraba-dev-creator-vault

# CloudFront
CLOUDFRONT_DOMAIN=d1rwanl0beslh.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K5X4ESOPM7VNU
CLOUDFRONT_SECRET_ARN=arn:aws:secretsmanager:eu-central-1:123456789012:secret:kakraba-dev-cf-private-key

# Cognito
COGNITO_USER_POOL_ID=eu-central-1_vnydtmVKe

# S3
CONTENT_BUCKET=kakraba-dev-content

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS
AWS_REGION=eu-central-1
AWS_PROFILE=default
```

## Frontend Variables

### Vite Environment Variables

Location: `.env` file in each frontend package

#### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `VITE_API_ENDPOINT` | string | API Gateway URL | `"https://api-kakraba.thekloudwiz.com"` |
| `VITE_COGNITO_USER_POOL_ID` | string | Cognito user pool ID | `"eu-central-1_vnydtmVKe"` |
| `VITE_COGNITO_CLIENT_ID` | string | Cognito app client ID | `"7o8bojjgslvjq183l60rvuocf"` |
| `VITE_COGNITO_DOMAIN` | string | Cognito hosted UI domain | `"kakraba-dev-288761729262.auth.eu-central-1.amazoncognito.com"` |
| `VITE_AWS_REGION` | string | AWS region | `"eu-central-1"` |

#### Payment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | string | Stripe publishable key | `"pk_test_..."` |

#### Optional Variables

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `VITE_APP_NAME` | string | Application name | `"Kakraba"` |
| `VITE_APP_VERSION` | string | Application version | `"1.0.0"` |
| `VITE_ENABLE_ANALYTICS` | boolean | Enable analytics | `"false"` |

### Environment-Specific Configuration

#### Development (`.env.development`)

```bash
# API
VITE_API_ENDPOINT=https://1olgwybpe4.execute-api.eu-central-1.amazonaws.com

# Cognito
VITE_COGNITO_USER_POOL_ID=eu-central-1_vnydtmVKe
VITE_COGNITO_CLIENT_ID=7o8bojjgslvjq183l60rvuocf
VITE_COGNITO_DOMAIN=kakraba-dev-288761729262.auth.eu-central-1.amazoncognito.com

# Stripe (test mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef

# AWS
VITE_AWS_REGION=eu-central-1

# Debug
VITE_ENABLE_ANALYTICS=false
VITE_LOG_LEVEL=debug
```

#### Production (`.env.production`)

```bash
# API
VITE_API_ENDPOINT=https://api-kakraba.thekloudwiz.com

# Cognito
VITE_COGNITO_USER_POOL_ID=eu-central-1_PRODPOOL
VITE_COGNITO_CLIENT_ID=prodclientid123
VITE_COGNITO_DOMAIN=kakraba-prod.auth.eu-central-1.amazoncognito.com

# Stripe (live mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51234567890abcdef

# AWS
VITE_AWS_REGION=eu-central-1

# Production settings
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=error
```

### Package-Specific Variables

#### Landing Page (`frontend/packages/landing-page/.env`)

```bash
VITE_API_ENDPOINT=https://api-kakraba.thekloudwiz.com
VITE_CREATOR_PORTAL_URL=https://kakraba.thekloudwiz.com/creator
VITE_FAN_PORTAL_URL=https://kakraba.thekloudwiz.com/fan
```

#### Creator Portal (`frontend/packages/creator-portal/.env`)

```bash
VITE_API_ENDPOINT=https://api-kakraba.thekloudwiz.com
VITE_COGNITO_USER_POOL_ID=eu-central-1_vnydtmVKe
VITE_COGNITO_CLIENT_ID=7o8bojjgslvjq183l60rvuocf
VITE_COGNITO_DOMAIN=kakraba-dev-288761729262.auth.eu-central-1.amazoncognito.com
VITE_AWS_REGION=eu-central-1
VITE_MAX_UPLOAD_SIZE=5368709120
VITE_ALLOWED_FILE_TYPES=video/mp4,audio/mp3,application/pdf,image/jpeg,image/png
```

#### Fan Portal (`frontend/packages/fan-portal/.env`)

```bash
VITE_API_ENDPOINT=https://api-kakraba.thekloudwiz.com
VITE_COGNITO_USER_POOL_ID=eu-central-1_vnydtmVKe
VITE_COGNITO_CLIENT_ID=7o8bojjgslvjq183l60rvuocf
VITE_COGNITO_DOMAIN=kakraba-dev-288761729262.auth.eu-central-1.amazoncognito.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
VITE_AWS_REGION=eu-central-1
```

## Security Best Practices

### Never Commit Secrets

**Add to `.gitignore`:**
```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.tfvars
!*.tfvars.example
```

### Use Example Files

Create `.env.example` files with dummy values:

```bash
# .env.example
VITE_API_ENDPOINT=https://api.example.com
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Secrets Management

#### AWS Secrets Manager

Store sensitive values in Secrets Manager:

```bash
# Create secret
aws secretsmanager create-secret \
  --name kakraba-dev-stripe-keys \
  --secret-string '{"secret_key":"sk_test_...","webhook_secret":"whsec_..."}' \
  --region eu-central-1

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id kakraba-dev-stripe-keys \
  --region eu-central-1
```

#### Environment-Specific Secrets

- **Development:** Use test/sandbox credentials
- **Staging:** Use test credentials with production-like data
- **Production:** Use live credentials with strict access control

### Access Control

#### IAM Permissions

Lambda functions should have minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:kakraba-*"
    }
  ]
}
```

#### Rotation

Rotate secrets regularly:
- **API Keys:** Every 90 days
- **Database Credentials:** Every 30 days
- **CloudFront Keys:** Every 180 days

### Validation

#### Required Variables Check

Add validation in your code:

```typescript
// Backend
const requiredEnvVars = [
  'TABLE_NAME',
  'CLOUDFRONT_DOMAIN',
  'AWS_REGION'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Frontend
const requiredEnvVars = [
  'VITE_API_ENDPOINT',
  'VITE_COGNITO_USER_POOL_ID',
  'VITE_COGNITO_CLIENT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## Troubleshooting

### Common Issues

#### Variables Not Loading

**Problem:** Environment variables not available

**Solutions:**
1. Check file name (`.env` not `.env.txt`)
2. Restart development server
3. Verify file location (package root)
4. Check variable prefix (`VITE_` for frontend)

#### Wrong Environment

**Problem:** Using dev config in production

**Solutions:**
1. Use correct `.env` file
2. Set `NODE_ENV` correctly
3. Verify build command
4. Check deployment scripts

#### Secrets Not Found

**Problem:** Can't access Secrets Manager

**Solutions:**
1. Verify IAM permissions
2. Check secret name/ARN
3. Verify AWS region
4. Check secret exists

---

For more information, see:
- [Usage & Contributing](./USAGE_AND_CONTRIBUTING.md)
- [Architecture & Flow](./ARCHITECTURE_AND_FLOW.md)
