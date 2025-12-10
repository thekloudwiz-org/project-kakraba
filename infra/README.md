# KaKraba Content Access Control Infrastructure

This directory contains Terraform configuration for deploying the KaKraba content access control system on AWS.

## Architecture

The infrastructure is organized into modular components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Root Module (main.tf)                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Storage    │      │   Content    │     │   Database   │
│   Module     │─────▶│   Delivery   │     │   Module     │
│              │      │   Module     │     │              │
│  - S3 Bucket │      │  - CloudFront│     │  - DynamoDB  │
│  - Versioning│      │  - OAI       │     │  - GSI       │
│  - Encryption│      │  - Signed    │     │  - PITR      │
│  - Lifecycle │      │    URLs      │     │              │
└──────────────┘      │  - Secrets   │     └──────────────┘
                      │    Manager   │
                      └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│     IAM      │      │   Compute    │     │ API Gateway  │
│   Module     │─────▶│   Module     │◀────│   Module     │
│              │      │              │     │              │
│  - Lambda    │      │  - Lambda    │     │  - HTTP API  │
│    Role      │      │    Function  │     │  - Cognito   │
│  - Policies  │      │  - CloudWatch│     │    Auth      │
│              │      │    Logs      │     │  - Routes    │
└──────────────┘      └──────────────┘     └──────────────┘
```

## Modules

### Storage Module (`modules/storage`)
- **Purpose**: S3 bucket for storing creator content (audio, video, books, art)
- **Resources**: S3 bucket, versioning, encryption, lifecycle rules, bucket policy
- **Outputs**: bucket_id, bucket_arn, bucket_regional_domain_name

### Content Delivery Module (`modules/content-delivery`)
- **Purpose**: CloudFront distribution for secure content delivery with signed URLs
- **Resources**: CloudFront distribution, OAI, public key, key group, Secrets Manager
- **Outputs**: cloudfront_domain, cloudfront_key_pair_id, cloudfront_private_key_secret_arn

### Database Module (`modules/database`)
- **Purpose**: DynamoDB table for access rights, products, and subscriptions
- **Resources**: DynamoDB table with GSI, point-in-time recovery
- **Outputs**: table_name, table_arn, table_stream_arn

### IAM Module (`modules/iam`)
- **Purpose**: IAM roles and policies for Lambda execution
- **Resources**: Lambda execution role, DynamoDB policy, Secrets Manager policy, CloudWatch Logs policy
- **Outputs**: lambda_role_arn, lambda_role_name

### Compute Module (`modules/compute`)
- **Purpose**: Lambda function for content access control
- **Resources**: Lambda function, CloudWatch log group
- **Outputs**: lambda_function_arn, lambda_function_name, lambda_invoke_arn

### API Gateway Module (`modules/api-gateway`)
- **Purpose**: HTTP API with Cognito authorization
- **Resources**: API Gateway, Cognito authorizer, routes, integrations, Lambda permission
- **Outputs**: api_endpoint, api_id

## Prerequisites

1. **Terraform**: Version >= 1.0
2. **AWS CLI**: Configured with appropriate credentials
3. **Cognito User Pool**: Existing Cognito User Pool for authentication
4. **Lambda Package**: Built Lambda deployment package at `../app/dist/lambda.zip`

## Deployment

### 1. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your values:

```hcl
aws_region                   = "us-east-1"
project_name                 = "kakraba"
environment                  = "dev"
cognito_user_pool_id         = "us-east-1_XXXXXXXXX"
cognito_user_pool_client_ids = ["your-client-id"]
lambda_package_path          = "../app/dist/lambda.zip"
```

### 2. Choose Environment

This project uses environment-specific configurations:
- `environments/dev.tfvars` - Development environment
- `environments/prod.tfvars` - Production environment

Edit the appropriate file and set your configuration values.

### 3. Deploy

#### Development Environment

Use the deployment script:
```bash
./scripts/deploy-dev.sh
```

Or manually:
```bash
terraform init
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

#### Production Environment

Use the deployment script:
```bash
./scripts/deploy-prod.sh
```

Or manually:
```bash
terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

### 4. Note Outputs

After deployment, Terraform will output important values:

```
Outputs:

api_endpoint = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com"
cloudfront_domain = "d111111abcdef8.cloudfront.net"
cloudfront_key_pair_id = "K2JCJMDEHXQW5F"
dynamodb_table_name = "kakraba-dev-creator-vault"
lambda_function_name = "kakraba-dev-access-control"
s3_bucket_name = "kakraba-dev-content"
```

## Updating Lambda Code

After making changes to the Lambda function code:

1. Build and package the Lambda code:
   ```bash
   cd ../app
   npm run build
   npm run package
   ```

2. Update the Lambda function:
   ```bash
   cd ../infra
   terraform apply -target=module.compute.aws_lambda_function.access_control
   ```

## Destroying Infrastructure

To tear down all resources:

```bash
terraform destroy
```

**Warning**: This will delete all data in S3 and DynamoDB. Make sure you have backups if needed.

## Troubleshooting

### CloudFront Key Pair Issues

If you encounter issues with CloudFront signed URLs:

1. Verify the public key is correctly configured:
   ```bash
   terraform output cloudfront_key_pair_id
   ```

2. Check the private key in Secrets Manager:
   ```bash
   aws secretsmanager get-secret-value --secret-id kakraba-dev-cloudfront-private-key
   ```

### Lambda Permission Errors

If Lambda cannot access DynamoDB or Secrets Manager:

1. Check IAM role policies:
   ```bash
   aws iam list-attached-role-policies --role-name kakraba-dev-lambda-execution
   ```

2. Verify environment variables:
   ```bash
   aws lambda get-function-configuration --function-name kakraba-dev-access-control
   ```

### API Gateway 403 Errors

If API requests return 403:

1. Verify Cognito authorizer configuration
2. Check that the JWT token includes the correct audience (client ID)
3. Ensure the token is not expired

## Module Dependencies

The modules have the following dependencies:

1. **storage** → No dependencies
2. **content-delivery** → Depends on storage (needs OAI ARN)
3. **database** → No dependencies
4. **iam** → Depends on database and content-delivery (needs ARNs)
5. **compute** → Depends on iam, database, content-delivery (needs role, table name, CloudFront config)
6. **api-gateway** → Depends on compute (needs Lambda invoke ARN)

## Security Considerations

- S3 bucket has public access blocked
- CloudFront uses Origin Access Identity for S3 access
- All data is encrypted at rest (S3, DynamoDB, Secrets Manager)
- API Gateway uses Cognito JWT authorization
- Lambda has minimal IAM permissions (principle of least privilege)
- CloudWatch logs enabled for auditing
- X-Ray tracing enabled for observability

## Cost Optimization

- DynamoDB uses on-demand billing (pay per request)
- S3 lifecycle rules transition old versions to cheaper storage classes
- CloudFront uses PriceClass_100 (North America and Europe only)
- CloudWatch logs have 14-day retention

## Support

For issues or questions, refer to the main project documentation or contact the development team.

## Recent Updates

- **2024-12-10**: Added product management API routes and S3 CORS configuration for content uploads
