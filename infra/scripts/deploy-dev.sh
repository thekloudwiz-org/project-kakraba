#!/bin/bash
set -e

echo "=========================================="
echo "Deploying to Development Environment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Lambda package exists
if [ ! -f "../app/lambda.zip" ]; then
    echo -e "${YELLOW}Lambda package not found. Building...${NC}"
    cd ../app
    npm run package
    cd ../infra
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
terraform plan -var-file=environments/dev.tfvars -out=tfplan-dev

# Ask for confirmation
echo ""
read -p "Do you want to apply this plan? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    rm -f tfplan-dev
    exit 0
fi

# Apply deployment
echo ""
echo "Applying deployment..."
terraform apply tfplan-dev

# Clean up plan file
rm -f tfplan-dev

# Show outputs
echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
terraform output

echo ""
echo "Next steps:"
echo "1. Test the API endpoint"
echo "2. Verify CloudWatch logs"
echo "3. Check DynamoDB table"
