# KaKraba Content Access Control - Project Structure

## Overview

This project implements a serverless content access control system for the KaKraba platform using AWS Lambda, DynamoDB, CloudFront, and API Gateway.

## Directory Structure

```
.
├── .kiro/
│   └── specs/
│       └── content-access-control/     # Feature specifications
│           ├── requirements.md          # EARS requirements
│           ├── design.md               # System design & properties
│           └── tasks.md                # Implementation tasks
│
├── app/                                # Lambda application
│   ├── handlers/                       # Lambda handlers
│   │   ├── index.ts                   # Main handler
│   │   ├── index.test.ts              # Unit tests
│   │   └── index.integration.test.ts  # Integration tests
│   │
│   ├── services/                       # Business logic
│   │   ├── AccessValidator.ts         # Access validation
│   │   ├── AccessValidator.test.ts
│   │   ├── AccessValidator.property.test.ts
│   │   └── SignedUrlGenerator.ts      # CloudFront URL signing
│   │
│   ├── repositories/                   # Data access
│   │   ├── DynamoDBRepository.ts      # DynamoDB operations
│   │   ├── DynamoDBRepository.test.ts
│   │   └── DynamoDBRepository.property.test.ts
│   │
│   ├── types/                          # TypeScript types
│   │   └── index.ts
│   │
│   ├── scripts/                        # Build scripts
│   │   ├── package-lambda.sh          # Lambda packaging script
│   │   └── README.md
│   │
│   ├── dist/                           # Compiled output (gitignored)
│   ├── node_modules/                   # Dependencies (gitignored)
│   ├── lambda.zip                      # Deployment package (gitignored)
│   │
│   ├── package.json                    # Node.js configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── jest.config.js                  # Jest configuration
│   ├── DEPLOYMENT.md                   # Deployment guide
│   └── README.md                       # Application documentation
│
├── infra/                              # Terraform infrastructure
│   ├── modules/                        # Terraform modules
│   │   ├── storage/                   # S3 bucket
│   │   ├── content-delivery/          # CloudFront + Secrets
│   │   ├── database/                  # DynamoDB
│   │   ├── iam/                       # IAM roles & policies
│   │   ├── compute/                   # Lambda function
│   │   └── api-gateway/               # API Gateway
│   │
│   ├── environments/                   # Environment configs
│   │   ├── dev.tfvars                 # Development settings
│   │   ├── prod.tfvars                # Production settings
│   │   ├── .gitignore
│   │   └── README.md
│   │
│   ├── scripts/                        # Deployment scripts
│   │   ├── deploy-dev.sh              # Deploy to dev
│   │   ├── deploy-prod.sh             # Deploy to prod
│   │   ├── validate-deployment.sh     # Pre-deployment checks
│   │   └── README.md
│   │
│   ├── main.tf                         # Root module
│   ├── variables.tf                    # Input variables
│   ├── outputs.tf                      # Output values
│   ├── versions.tf                     # Provider versions
│   ├── terraform.tfvars.example        # Example configuration
│   ├── DEPLOYMENT_GUIDE.md             # Detailed deployment guide
│   └── README.md                       # Infrastructure documentation
│
├── IMPLEMENTATION_STATUS.md            # Implementation progress
└── README.md                           # Project overview
```

## Key Components

### Application Layer (`app/`)

**Purpose**: Lambda function that validates access and generates signed URLs

**Key Files**:
- `handlers/index.ts` - Main Lambda handler
- `services/AccessValidator.ts` - Business logic for access validation
- `services/SignedUrlGenerator.ts` - CloudFront signed URL generation
- `repositories/DynamoDBRepository.ts` - DynamoDB data access

**Scripts**:
- `npm test` - Run all tests
- `npm run build` - Compile TypeScript
- `npm run package` - Build deployment package

### Infrastructure Layer (`infra/`)

**Purpose**: Terraform configuration for AWS resources

**Modules**:
1. **Storage** - S3 bucket for content
2. **Content Delivery** - CloudFront distribution + Secrets Manager
3. **Database** - DynamoDB table with GSI
4. **IAM** - Roles and policies
5. **Compute** - Lambda function
6. **API Gateway** - HTTP API with Cognito auth

**Environments**:
- `dev` - Development environment
- `prod` - Production environment

**Scripts**:
- `./scripts/validate-deployment.sh` - Validate prerequisites
- `./scripts/deploy-dev.sh` - Deploy to development
- `./scripts/deploy-prod.sh` - Deploy to production

## Workflow

### Development Workflow

1. **Make changes**:
   ```bash
   cd app
   # Edit code...
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Build package**:
   ```bash
   npm run package
   ```

4. **Deploy to dev**:
   ```bash
   cd ../infra
   ./scripts/deploy-dev.sh
   ```

5. **Test in dev environment**

### Production Deployment

1. **Ensure tests pass**:
   ```bash
   cd app
   npm test
   ```

2. **Build package**:
   ```bash
   npm run package
   ```

3. **Validate infrastructure**:
   ```bash
   cd ../infra
   ./scripts/validate-deployment.sh
   ```

4. **Deploy to production**:
   ```bash
   ./scripts/deploy-prod.sh
   ```

5. **Monitor deployment**

## Testing Strategy

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Located alongside source files (`.test.ts`)

### Property-Based Tests
- Test universal properties across random inputs
- Use fast-check library
- Located in `.property.test.ts` files

### Integration Tests
- Test end-to-end flows
- Validate component integration
- Located in `.integration.test.ts` files

## Configuration Management

### Application Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler options
- `jest.config.js` - Test configuration

### Infrastructure Configuration
- `environments/dev.tfvars` - Development settings
- `environments/prod.tfvars` - Production settings
- `terraform.tfvars.example` - Example configuration

## Documentation

### Application Documentation
- `app/README.md` - Application overview
- `app/DEPLOYMENT.md` - Lambda deployment guide
- `app/scripts/README.md` - Build scripts documentation

### Infrastructure Documentation
- `infra/README.md` - Infrastructure overview
- `infra/DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `infra/scripts/README.md` - Deployment scripts documentation
- `infra/environments/README.md` - Environment management

### Specification Documentation
- `.kiro/specs/content-access-control/requirements.md` - Requirements
- `.kiro/specs/content-access-control/design.md` - Design
- `.kiro/specs/content-access-control/tasks.md` - Tasks

## Environment Variables

### Lambda Function
- `TABLE_NAME` - DynamoDB table name
- `CLOUDFRONT_DOMAIN` - CloudFront distribution domain
- `CLOUDFRONT_KEY_PAIR_ID` - CloudFront key pair ID
- `CLOUDFRONT_PRIVATE_KEY_SECRET_ARN` - Secrets Manager ARN

### Deployment Scripts
- `AWS_PROFILE` - AWS CLI profile
- `AWS_REGION` - AWS region
- `TF_LOG` - Terraform log level

## Security

### Secrets Management
- CloudFront private key stored in AWS Secrets Manager
- No secrets in code or configuration files
- Environment-specific credentials

### Access Control
- IAM roles with least privilege
- API Gateway with Cognito authentication
- CloudFront signed URLs with expiration

## Monitoring

### CloudWatch Logs
- Lambda function logs: `/aws/lambda/{function-name}`
- API Gateway logs: Configured per stage

### Metrics
- Lambda invocations, errors, duration
- API Gateway requests, 4xx/5xx errors
- DynamoDB read/write capacity

## Cost Optimization

### Development
- On-demand DynamoDB billing
- Shorter log retention (7 days)
- Smaller Lambda memory (512MB)

### Production
- Consider provisioned capacity for DynamoDB
- Longer log retention (30 days)
- Optimized Lambda memory (512-1024MB)
- CloudFront caching enabled

## Next Steps

1. ✅ Complete implementation
2. ✅ Write comprehensive tests
3. ✅ Build deployment package
4. ✅ Create environment configurations
5. 📋 Deploy to development
6. 📋 Test in development
7. 📋 Deploy to production
8. 📋 Monitor and optimize
