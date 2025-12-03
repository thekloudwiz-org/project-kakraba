# Terraform Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **AWS CLI configured** with appropriate credentials:
   ```bash
   aws configure
   aws sts get-caller-identity  # Verify credentials
   ```

2. **Terraform installed** (version >= 1.0):
   ```bash
   terraform version
   ```

3. **Lambda package built**:
   ```bash
   cd ../app
   npm run package
   cd ../infra
   ```

4. **CloudFront key pair generated**:
   - Generate RSA key pair (2048-bit)
   - Upload public key to CloudFront
   - Store private key in AWS Secrets Manager

## Pre-Deployment Checklist

- [ ] AWS credentials configured
- [ ] Lambda package (`../app/lambda.zip`) exists
- [ ] CloudFront key pair generated
- [ ] Private key stored in Secrets Manager
- [ ] Cognito User Pool created (if using authentication)
- [ ] Review `terraform.tfvars` configuration

## Deployment Steps

### 1. Initialize Terraform

```bash
terraform init
```

This will:
- Download required provider plugins (AWS)
- Initialize the backend
- Prepare modules

Expected output:
```
Terraform has been successfully initialized!
```

### 2. Create Configuration File

Copy the example and customize:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
# Project Configuration
project_name = "kakraba"
environment  = "dev"  # or "staging", "production"
aws_region   = "us-east-1"

# Lambda Configuration
lambda_package_path = "../app/lambda.zip"

# Cognito Configuration (optional)
cognito_user_pool_id = "us-east-1_XXXXXXXXX"  # Your Cognito User Pool ID
```

### 3. Review Deployment Plan

```bash
terraform plan -out=tfplan
```

This will show:
- Resources to be created
- Estimated costs
- Any potential issues

Review the output carefully. You should see:
- 1 S3 bucket
- 1 CloudFront distribution
- 1 DynamoDB table
- 1 Lambda function
- 1 API Gateway
- Multiple IAM roles and policies

### 4. Deploy Infrastructure

```bash
terraform apply tfplan
```

Or interactively:

```bash
terraform apply
```

Type `yes` when prompted.

**Deployment time**: ~10-15 minutes (CloudFront distribution takes the longest)

### 5. Capture Outputs

After successful deployment, note the outputs:

```bash
terraform output
```

Important outputs:
- `api_endpoint`: Your API Gateway URL
- `cloudfront_domain`: CloudFront distribution domain
- `dynamodb_table_name`: DynamoDB table name
- `lambda_function_name`: Lambda function name

Save these for testing and configuration.

## Post-Deployment Configuration

### 1. Store CloudFront Private Key

If not already done, store the CloudFront private key in Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name kakraba-cloudfront-private-key \
  --secret-string file://cloudfront-private-key.pem \
  --region us-east-1
```

### 2. Verify Lambda Function

```bash
aws lambda get-function \
  --function-name $(terraform output -raw lambda_function_name) \
  --region us-east-1
```

### 3. Test API Gateway

```bash
API_ENDPOINT=$(terraform output -raw api_endpoint)
echo "API Endpoint: $API_ENDPOINT"

# Test with curl (will fail without valid auth, but should return 401/403)
curl -X POST $API_ENDPOINT/access/generate-link \
  -H "Content-Type: application/json" \
  -d '{"product_id":"test","user_id":"test","intent":"STREAM"}'
```

## Updating Infrastructure

### Update Lambda Code Only

If you only changed Lambda code:

```bash
# Rebuild package
cd ../app
npm run package
cd ../infra

# Update Lambda
terraform apply -target=module.compute.aws_lambda_function.access_control
```

### Update All Infrastructure

```bash
terraform plan
terraform apply
```

## Destroying Infrastructure

⚠️ **WARNING**: This will delete all resources and data!

```bash
terraform destroy
```

Type `yes` when prompted.

## Troubleshooting

### Issue: "Error: No valid credential sources found"

**Solution**: Configure AWS credentials:
```bash
aws configure
```

### Issue: "Error: Lambda package not found"

**Solution**: Build the Lambda package:
```bash
cd ../app
npm run package
cd ../infra
```

### Issue: "Error: CloudFront distribution creation failed"

**Solution**: 
- Verify S3 bucket was created successfully
- Check CloudFront limits in your AWS account
- Ensure you have permissions to create CloudFront distributions

### Issue: "Error: DynamoDB table already exists"

**Solution**:
- Import existing table: `terraform import module.database.aws_dynamodb_table.creator_vault CreatorVault`
- Or use a different table name in `terraform.tfvars`

### Issue: Lambda function fails at runtime

**Solution**:
1. Check CloudWatch Logs:
   ```bash
   aws logs tail /aws/lambda/$(terraform output -raw lambda_function_name) --follow
   ```

2. Verify environment variables:
   ```bash
   aws lambda get-function-configuration \
     --function-name $(terraform output -raw lambda_function_name)
   ```

3. Test Lambda directly:
   ```bash
   aws lambda invoke \
     --function-name $(terraform output -raw lambda_function_name) \
     --payload '{"body":"{\"product_id\":\"test\",\"user_id\":\"test\",\"intent\":\"STREAM\"}"}' \
     response.json
   cat response.json
   ```

## State Management

### Remote State (Recommended for Teams)

Configure S3 backend in `versions.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "kakraba/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

Then:
```bash
terraform init -migrate-state
```

### Local State (Default)

State is stored in `terraform.tfstate`. 

⚠️ **Important**: 
- Never commit `terraform.tfstate` to git
- Back up state file regularly
- Use remote state for production

## Cost Estimation

Approximate monthly costs (us-east-1):

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 1M requests, 512MB, 1s avg | ~$2 |
| API Gateway | 1M requests | ~$3.50 |
| DynamoDB | On-demand, 1M reads/writes | ~$1.25 |
| CloudFront | 1TB transfer | ~$85 |
| S3 | 100GB storage | ~$2.30 |
| Secrets Manager | 1 secret | ~$0.40 |
| **Total** | | **~$95/month** |

*Costs vary based on actual usage. Use AWS Cost Calculator for accurate estimates.*

## Security Best Practices

1. **Enable CloudTrail** for audit logging
2. **Use AWS WAF** with API Gateway for DDoS protection
3. **Enable S3 bucket versioning** for data protection
4. **Rotate CloudFront keys** regularly
5. **Use AWS Secrets Manager** for sensitive data
6. **Enable VPC** for Lambda (optional, for enhanced security)
7. **Set up CloudWatch Alarms** for monitoring

## Monitoring

### CloudWatch Dashboards

Create a dashboard to monitor:
- Lambda invocations, errors, duration
- API Gateway requests, 4xx/5xx errors
- DynamoDB read/write capacity
- CloudFront requests, cache hit ratio

### Alarms

Set up alarms for:
- Lambda errors > 1%
- API Gateway 5xx errors > 0.5%
- DynamoDB throttling
- Lambda duration > 25s (near timeout)

## Compliance

Ensure compliance with:
- **GDPR**: Data encryption, access controls
- **PCI DSS**: If handling payment data
- **HIPAA**: If handling health data
- **SOC 2**: Audit logging, access controls

## Next Steps

After successful deployment:

1. ✅ Test API endpoints (Task 21)
2. ✅ Verify CloudFront signed URLs work
3. ✅ Test access control logic
4. ✅ Set up monitoring and alarms
5. ✅ Document API for consumers
6. ✅ Set up CI/CD pipeline
