# KaKraba Content Access Control Lambda

Lambda function for validating user access and generating signed CloudFront URLs.

## Build

```bash
npm install
npm run build
```

## Test

```bash
npm test
npm run test:coverage
```

## Package for Deployment

```bash
npm run package
```

This creates `lambda.zip` ready for Terraform deployment.

## Environment Variables

- `TABLE_NAME`: DynamoDB table name
- `CLOUDFRONT_DOMAIN`: CloudFront distribution domain
- `CLOUDFRONT_KEY_PAIR_ID`: CloudFront key pair ID for signed URLs
- `CLOUDFRONT_PRIVATE_KEY_SECRET_ARN`: ARN of Secrets Manager secret containing private key
- `NODE_ENV`: Environment (development/production)

## Recent Updates

- **2024-12-11**: Backend workflow verification - all tests passing, type checking complete
