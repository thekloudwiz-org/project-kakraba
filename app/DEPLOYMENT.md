# Lambda Deployment Guide

## Building the Lambda Package

### Prerequisites
- Node.js 20.x or later
- npm
- zip utility

### Build Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests** (optional but recommended):
   ```bash
   npm test
   ```

3. **Build and package**:
   ```bash
   npm run package
   ```

   This will:
   - Compile TypeScript to JavaScript
   - Install production dependencies only
   - Create `lambda.zip` with all necessary files
   - Restore dev dependencies

4. **Verify package**:
   ```bash
   ls -lh lambda.zip
   ```

   The package should be around 3-4MB (well within Lambda's 50MB limit).

## Package Contents

The `lambda.zip` file contains:
- Compiled JavaScript code (`handlers/`, `services/`, `repositories/`, `types/`)
- Production dependencies (`node_modules/`)
- Source maps for debugging

## Deployment

### Using Terraform

The Lambda function is deployed as part of the Terraform infrastructure:

```bash
cd ../infra
terraform apply -var="lambda_package_path=../app/lambda.zip"
```

### Manual Deployment (AWS CLI)

If you need to update just the Lambda function code:

```bash
aws lambda update-function-code \
  --function-name kakraba-access-control \
  --zip-file fileb://lambda.zip \
  --region us-east-1
```

### Manual Deployment (AWS Console)

1. Go to AWS Lambda Console
2. Find your function (e.g., `kakraba-access-control`)
3. Click "Upload from" → ".zip file"
4. Select `lambda.zip`
5. Click "Save"

## Environment Variables

The Lambda function requires these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `TABLE_NAME` | DynamoDB table name | `CreatorVault` |
| `CLOUDFRONT_DOMAIN` | CloudFront distribution domain | `d1234567890.cloudfront.net` |
| `CLOUDFRONT_KEY_PAIR_ID` | CloudFront key pair ID | `APKAXXXXXXXXXX` |
| `CLOUDFRONT_PRIVATE_KEY_SECRET_ARN` | Secrets Manager ARN for private key | `arn:aws:secretsmanager:...` |

These are automatically configured by Terraform.

## Configuration

### Lambda Settings

Recommended configuration:
- **Runtime**: Node.js 20.x
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **Architecture**: x86_64 or arm64

### IAM Permissions

The Lambda function needs:
- DynamoDB: `GetItem`, `UpdateItem`, `Query`
- Secrets Manager: `GetSecretValue`
- CloudWatch Logs: `CreateLogGroup`, `CreateLogStream`, `PutLogEvents`

## Updating the Function

After making code changes:

1. Run tests:
   ```bash
   npm test
   ```

2. Rebuild package:
   ```bash
   npm run package
   ```

3. Deploy with Terraform:
   ```bash
   cd ../infra
   terraform apply
   ```

## Troubleshooting

### Package too large

If the package exceeds Lambda limits:
- Check for unnecessary dependencies in `package.json`
- Remove dev dependencies from the package
- Consider using Lambda Layers for large dependencies

### Build fails

- Ensure TypeScript compiles without errors: `npm run build`
- Check that all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 20.x)

### Function fails at runtime

- Check CloudWatch Logs for error messages
- Verify environment variables are set correctly
- Ensure IAM role has necessary permissions
- Test locally with sample events

## Testing Locally

You can test the handler locally:

```typescript
import { handler } from './dist/handlers/index';

const event = {
  body: JSON.stringify({
    product_id: 'prod-123',
    user_id: 'user-456',
    intent: 'STREAM'
  })
};

handler(event).then(result => {
  console.log(JSON.stringify(result, null, 2));
});
```

## Performance Optimization

- **Cold Start**: ~500-800ms (includes loading dependencies)
- **Warm Execution**: ~50-100ms
- **Memory Usage**: ~100-150MB

To reduce cold starts:
- Use Provisioned Concurrency for production
- Keep the package size small
- Minimize dependencies
