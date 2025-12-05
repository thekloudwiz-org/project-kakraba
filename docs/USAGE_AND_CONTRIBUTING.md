# Usage & Contributing Guide

This guide covers everything you need to know about setting up, deploying, and contributing to the Kakraba platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [Code Style](#code-style)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **AWS Account** with appropriate permissions
- **AWS CLI** v2.x configured with credentials
- **Terraform** >= 1.0
- **Node.js** >= 20.x
- **npm** or **pnpm** >= 8.x
- **Git** for version control
- **Stripe Account** (for payment processing)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/kakraba.git
cd kakraba

# Install dependencies
cd app && npm install
cd ../frontend && npm install

# Configure environment
cp infra/environments/dev.tfvars.example infra/environments/dev.tfvars
# Edit dev.tfvars with your configuration

# Deploy infrastructure
cd infra
terraform init
terraform apply -var-file="environments/dev.tfvars"

# Build and deploy frontend
cd ../frontend
npm run build
# Upload to S3 (see deployment section)
```

## Development Setup

### 1. Backend Development

#### Lambda Functions

```bash
cd app

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build Lambda package
npm run build
```

#### Local Development with DynamoDB Local

```bash
# Install DynamoDB Local
npm install -g dynamodb-local

# Start DynamoDB Local
dynamodb-local

# Run tests against local DynamoDB
npm run test:integration
```

#### Environment Variables

Create `.env` file in `app/` directory:

```env
TABLE_NAME=kakraba-dev-creator-vault
CLOUDFRONT_DOMAIN=d1rwanl0beslh.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K5X4ESOPM7VNU
CLOUDFRONT_SECRET_ARN=arn:aws:secretsmanager:...
AWS_REGION=eu-central-1
```

### 2. Frontend Development

#### Project Structure

```
frontend/
├── packages/
│   ├── shared/          # Shared components and utilities
│   ├── landing-page/    # Landing page application
│   ├── creator-portal/  # Creator portal application
│   └── fan-portal/      # Fan portal application
├── package.json         # Workspace configuration
└── pnpm-workspace.yaml  # pnpm workspace config
```

#### Development Server

```bash
cd frontend

# Install dependencies
npm install

# Start development server for creator portal
cd packages/creator-portal
npm run dev

# Start development server for fan portal
cd packages/fan-portal
npm run dev

# Start development server for landing page
cd packages/landing-page
npm run dev
```

#### Environment Variables

Create `.env` file in each package:

```env
VITE_API_ENDPOINT=https://api-kakraba.thekloudwiz.com
VITE_COGNITO_USER_POOL_ID=eu-central-1_vnydtmVKe
VITE_COGNITO_CLIENT_ID=7o8bojjgslvjq183l60rvuocf
VITE_COGNITO_DOMAIN=kakraba-dev-288761729262.auth.eu-central-1.amazoncognito.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_AWS_REGION=eu-central-1
```

### 3. Infrastructure Development

#### Terraform Workflow

```bash
cd infra

# Initialize Terraform
terraform init

# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan changes
terraform plan -var-file="environments/dev.tfvars"

# Apply changes
terraform apply -var-file="environments/dev.tfvars"

# Destroy resources (careful!)
terraform destroy -var-file="environments/dev.tfvars"
```

#### Creating New Modules

```bash
cd infra/modules

# Create new module directory
mkdir my-module
cd my-module

# Create module files
touch main.tf variables.tf outputs.tf README.md
```

## Deployment

### Infrastructure Deployment

#### 1. Configure Environment

```bash
cd infra

# Copy example configuration
cp environments/dev.tfvars.example environments/dev.tfvars

# Edit configuration
vim environments/dev.tfvars
```

Required variables:
```hcl
project_name = "kakraba"
environment  = "dev"
aws_region   = "eu-central-1"

lambda_package_path = "../app/lambda.zip"

custom_domain_name = "api-kakraba.thekloudwiz.com"
route53_zone_name  = "thekloudwiz.com"
website_domain     = "kakraba.thekloudwiz.com"

# Optional: Monitoring
alarm_email = "ops@example.com"
```

#### 2. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Review plan
terraform plan -var-file="environments/dev.tfvars"

# Apply changes
terraform apply -var-file="environments/dev.tfvars"

# Save outputs
terraform output > outputs.txt
```

#### 3. Configure Secrets

```bash
# Store Stripe API keys in Secrets Manager
aws secretsmanager create-secret \
  --name kakraba-dev-stripe-keys \
  --secret-string '{"secret_key":"sk_test_...","webhook_secret":"whsec_..."}' \
  --region eu-central-1
```

### Backend Deployment

#### 1. Build Lambda Package

```bash
cd app

# Install production dependencies
npm ci --production

# Build TypeScript
npm run build

# Create deployment package
zip -r lambda.zip dist/ node_modules/ package.json
```

#### 2. Deploy Lambda Functions

```bash
# Update Lambda function
aws lambda update-function-code \
  --function-name kakraba-dev-access-control \
  --zip-file fileb://lambda.zip \
  --region eu-central-1

# Wait for update to complete
aws lambda wait function-updated \
  --function-name kakraba-dev-access-control \
  --region eu-central-1
```

### Frontend Deployment

#### 1. Build Applications

```bash
cd frontend

# Build all applications
npm run build

# Or build individually
cd packages/landing-page && npm run build
cd packages/creator-portal && npm run build
cd packages/fan-portal && npm run build
```

#### 2. Deploy to S3

```bash
# Get S3 bucket name from Terraform
BUCKET_NAME=$(cd ../../infra && terraform output -raw website_s3_bucket)

# Upload landing page
aws s3 sync packages/landing-page/dist s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Upload creator portal
aws s3 sync packages/creator-portal/dist s3://$BUCKET_NAME/creator/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Upload fan portal
aws s3 sync packages/fan-portal/dist s3://$BUCKET_NAME/fan/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable"
```

#### 3. Invalidate CloudFront Cache

```bash
# Get CloudFront distribution ID
DISTRIBUTION_ID=$(cd ../../infra && terraform output -raw website_cloudfront_id)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region us-east-1
```

### Deployment Scripts

Create `deploy.sh` in project root:

```bash
#!/bin/bash
set -e

ENV=${1:-dev}

echo "Deploying to $ENV environment..."

# Build backend
echo "Building backend..."
cd app
npm ci --production
npm run build
zip -r lambda.zip dist/ node_modules/ package.json

# Deploy infrastructure
echo "Deploying infrastructure..."
cd ../infra
terraform apply -var-file="environments/$ENV.tfvars" -auto-approve

# Build frontend
echo "Building frontend..."
cd ../frontend
npm run build

# Deploy frontend
echo "Deploying frontend..."
BUCKET_NAME=$(cd ../infra && terraform output -raw website_s3_bucket)
DISTRIBUTION_ID=$(cd ../infra && terraform output -raw website_cloudfront_id)

aws s3 sync packages/landing-page/dist s3://$BUCKET_NAME/ --delete
aws s3 sync packages/creator-portal/dist s3://$BUCKET_NAME/creator/ --delete
aws s3 sync packages/fan-portal/dist s3://$BUCKET_NAME/fan/ --delete

aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Use it:
```bash
./deploy.sh dev
./deploy.sh prod
```

## Testing

### Backend Tests

#### Unit Tests

```bash
cd app

# Run all tests
npm test

# Run specific test file
npm test -- access-control.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Property-Based Tests

```bash
# Run property tests
npm run test:properties

# Run with more iterations
npm run test:properties -- --iterations=1000
```

#### Integration Tests

```bash
# Start DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# Run integration tests
npm run test:integration
```

### Frontend Tests

#### Unit Tests

```bash
cd frontend

# Run all tests
npm test

# Run specific package tests
cd packages/creator-portal
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

#### E2E Tests

```bash
cd frontend

# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in headed mode
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- creator-auth.spec.ts
```

### Infrastructure Tests

```bash
cd infra

# Validate Terraform
terraform validate

# Format check
terraform fmt -check -recursive

# Plan (dry run)
terraform plan -var-file="environments/dev.tfvars"
```

## Contributing

We welcome contributions! Please follow these guidelines:

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/yourusername/kakraba.git
cd kakraba

# Add upstream remote
git remote add upstream https://github.com/originalowner/kakraba.git
```

### 2. Create a Branch

```bash
# Create feature branch
git checkout -b feature/my-new-feature

# Or bug fix branch
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clean, readable code
- Follow the code style guide
- Add tests for new features
- Update documentation
- Commit with clear messages

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description"
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/my-new-feature

# Create Pull Request on GitHub
```

### Pull Request Guidelines

- **Title:** Clear and descriptive
- **Description:** Explain what and why
- **Tests:** Include test results
- **Screenshots:** For UI changes
- **Breaking Changes:** Clearly marked

### Code Review Process

1. Automated checks must pass
2. At least one approval required
3. No merge conflicts
4. Documentation updated
5. Tests added/updated

## Code Style

### TypeScript/JavaScript

We use ESLint and Prettier for code formatting.

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

**Style Guidelines:**
- Use TypeScript for type safety
- Prefer `const` over `let`
- Use arrow functions
- Destructure objects and arrays
- Use async/await over promises
- Add JSDoc comments for public APIs

### React

**Component Guidelines:**
- Use functional components with hooks
- One component per file
- Use TypeScript interfaces for props
- Extract custom hooks for reusable logic
- Use React.memo for expensive components

**Example:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### Terraform

**Style Guidelines:**
- Use consistent naming conventions
- Add comments for complex logic
- Use variables for reusable values
- Create modules for reusable components
- Tag all resources

**Example:**
```hcl
resource "aws_lambda_function" "example" {
  function_name = "${var.project_name}-${var.environment}-example"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  
  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-example"
  })
}
```

## Troubleshooting

### Common Issues

#### 1. Terraform State Lock

**Problem:** `Error acquiring the state lock`

**Solution:**
```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>

# Or remove lock file
rm -f .terraform.tfstate.lock.info
```

#### 2. Lambda Deployment Fails

**Problem:** `ResourceConflictException: Function is being updated`

**Solution:**
```bash
# Wait for previous update to complete
aws lambda wait function-updated \
  --function-name <function-name>

# Then retry deployment
```

#### 3. CloudFront Cache Issues

**Problem:** Old content still being served

**Solution:**
```bash
# Create cache invalidation
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

#### 4. CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors

**Solution:**
- Check API Gateway CORS configuration
- Verify frontend is using correct API endpoint
- Check CloudFront response headers policy

#### 5. Authentication Errors

**Problem:** `Invalid JWT token`

**Solution:**
- Verify Cognito configuration
- Check token expiration
- Ensure API Gateway authorizer is configured
- Verify frontend is sending token correctly

### Getting Help

- **Documentation:** Check [docs/](../docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/kakraba/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/kakraba/discussions)
- **Email:** support@kakraba.com

### Reporting Bugs

When reporting bugs, include:

1. **Description:** Clear description of the issue
2. **Steps to Reproduce:** Detailed steps
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Environment:** OS, Node version, AWS region
6. **Logs:** Relevant error messages
7. **Screenshots:** If applicable

### Feature Requests

When requesting features, include:

1. **Use Case:** Why is this needed?
2. **Proposed Solution:** How should it work?
3. **Alternatives:** Other approaches considered
4. **Additional Context:** Any other information

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull upstream main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes and test
npm test

# 4. Commit changes
git commit -m "feat: add my feature"

# 5. Push to fork
git push origin feature/my-feature

# 6. Create Pull Request
```

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Deploy to staging
6. Test in staging
7. Deploy to production
8. Create GitHub release
9. Tag release

## Resources

### Documentation
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Tools
- [AWS CLI](https://aws.amazon.com/cli/)
- [Terraform](https://www.terraform.io/)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/)

### Community
- [GitHub Discussions](https://github.com/yourusername/kakraba/discussions)
- [Discord Server](https://discord.gg/kakraba)
- [Twitter](https://twitter.com/kakraba)

---

Thank you for contributing to Kakraba! 🎉
