#!/bin/bash
set -e

echo "=========================================="
echo "Deploying to Production Environment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Production safety check
echo -e "${RED}⚠️  WARNING: You are deploying to PRODUCTION${NC}"
echo ""
read -p "Are you sure you want to continue? (type 'PRODUCTION' to confirm): " confirm
if [ "$confirm" != "PRODUCTION" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if Lambda package exists
if [ ! -f "../app/lambda.zip" ]; then
    echo -e "${RED}Error: Lambda package not found.${NC}"
    echo "Build the package first: cd ../app && npm run package"
    exit 1
fi

# Verify tests passed
echo ""
echo "Have all tests passed? (yes/no)"
read -p "> " tests_passed
if [ "$tests_passed" != "yes" ]; then
    echo -e "${RED}Please run tests before deploying to production.${NC}"
    exit 1
fi

# Initialize Terraform if needed
if [ ! -d ".terraform" ]; then
    echo "Initializing Terraform..."
    terraform init
fi

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate

# Plan deployment
echo ""
echo "Planning deployment..."
terraform plan -var-file=environments/prod.tfvars -out=tfplan-prod

# Review plan
echo ""
echo -e "${YELLOW}Please review the plan carefully.${NC}"
read -p "Do you want to apply this plan? (type 'yes' to confirm): " apply_confirm
if [ "$apply_confirm" != "yes" ]; then
    echo "Deployment cancelled."
    rm -f tfplan-prod
    exit 0
fi

# Apply deployment
echo ""
echo "Applying deployment..."
terraform apply tfplan-prod

# Clean up plan file
rm -f tfplan-prod

# Show outputs
echo ""
echo -e "${GREEN}=========================================="
echo "Production Deployment Complete!"
echo "==========================================${NC}"
echo ""
terraform output

echo ""
echo "Post-deployment checklist:"
echo "1. ✓ Verify API endpoint is responding"
echo "2. ✓ Check CloudWatch logs for errors"
echo "3. ✓ Test critical user flows"
echo "4. ✓ Monitor error rates"
echo "5. ✓ Verify CloudFront distribution"
echo "6. ✓ Test signed URL generation"
echo ""
echo -e "${YELLOW}Remember to monitor the deployment for the next 30 minutes.${NC}"
