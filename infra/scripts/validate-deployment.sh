#!/bin/bash

# Terraform Deployment Validation Script
# This script checks if all prerequisites are met before deployment

set -e

echo "=========================================="
echo "Terraform Deployment Validation"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Check AWS CLI
echo "Checking AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
    check_pass "AWS CLI installed: $AWS_VERSION"
    
    # Check credentials
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
        check_pass "AWS credentials configured"
        echo "   Account: $AWS_ACCOUNT"
        echo "   User: $AWS_USER"
    else
        check_fail "AWS credentials not configured or invalid"
    fi
else
    check_fail "AWS CLI not installed"
fi
echo ""

# 2. Check Terraform
echo "Checking Terraform..."
if command -v terraform &> /dev/null; then
    TF_VERSION=$(terraform version -json | grep -o '"terraform_version":"[^"]*' | cut -d'"' -f4)
    check_pass "Terraform installed: v$TF_VERSION"
    
    # Check version >= 1.0
    if [ "$(printf '%s\n' "1.0" "$TF_VERSION" | sort -V | head -n1)" = "1.0" ]; then
        check_pass "Terraform version >= 1.0"
    else
        check_warn "Terraform version < 1.0 (recommended: >= 1.0)"
    fi
else
    check_fail "Terraform not installed"
fi
echo ""

# 3. Check Lambda package
echo "Checking Lambda package..."
if [ -f "../app/lambda.zip" ]; then
    PACKAGE_SIZE=$(du -h ../app/lambda.zip | cut -f1)
    check_pass "Lambda package exists: lambda.zip ($PACKAGE_SIZE)"
    
    # Check size
    PACKAGE_SIZE_BYTES=$(stat -f%z ../app/lambda.zip 2>/dev/null || stat -c%s ../app/lambda.zip 2>/dev/null)
    if [ $PACKAGE_SIZE_BYTES -lt 52428800 ]; then  # 50MB
        check_pass "Package size within Lambda limits (< 50MB)"
    else
        check_fail "Package size exceeds Lambda limit (50MB)"
    fi
    
    # Check contents
    if unzip -l ../app/lambda.zip | grep -q "handlers/index.js"; then
        check_pass "Package contains handler code"
    else
        check_fail "Package missing handler code"
    fi
    
    if unzip -l ../app/lambda.zip | grep -q "node_modules"; then
        check_pass "Package contains dependencies"
    else
        check_warn "Package may be missing dependencies"
    fi
else
    check_fail "Lambda package not found (run: cd ../app && npm run package)"
fi
echo ""

# 4. Check Terraform configuration
echo "Checking Terraform configuration..."
if [ -f "terraform.tfvars" ]; then
    check_pass "terraform.tfvars exists"
    
    # Check required variables
    if grep -q "project_name" terraform.tfvars; then
        check_pass "project_name configured"
    else
        check_warn "project_name not set in terraform.tfvars"
    fi
    
    if grep -q "environment" terraform.tfvars; then
        check_pass "environment configured"
    else
        check_warn "environment not set in terraform.tfvars"
    fi
else
    check_warn "terraform.tfvars not found (copy from terraform.tfvars.example)"
fi

if [ -f "main.tf" ]; then
    check_pass "main.tf exists"
else
    check_fail "main.tf not found"
fi

if [ -f "versions.tf" ]; then
    check_pass "versions.tf exists"
else
    check_fail "versions.tf not found"
fi
echo ""

# 5. Check Terraform initialization
echo "Checking Terraform initialization..."
if [ -d ".terraform" ]; then
    check_pass "Terraform initialized (.terraform directory exists)"
else
    check_warn "Terraform not initialized (run: terraform init)"
fi
echo ""

# 6. Check for common issues
echo "Checking for common issues..."

# Check if state file exists
if [ -f "terraform.tfstate" ]; then
    check_warn "Local state file exists (consider using remote state for production)"
fi

# Check gitignore
if [ -f ".gitignore" ]; then
    if grep -q "terraform.tfstate" .gitignore; then
        check_pass ".gitignore configured for Terraform"
    else
        check_warn ".gitignore may not exclude Terraform state files"
    fi
fi

# Check for sensitive files
if [ -f "terraform.tfvars" ] && ! grep -q "terraform.tfvars" .gitignore 2>/dev/null; then
    check_warn "terraform.tfvars should be in .gitignore"
fi
echo ""

# 7. Validate Terraform configuration
echo "Validating Terraform configuration..."
if [ -d ".terraform" ]; then
    if terraform validate &> /dev/null; then
        check_pass "Terraform configuration is valid"
    else
        check_fail "Terraform configuration has errors"
        echo "   Run 'terraform validate' for details"
    fi
else
    check_warn "Skipping validation (run 'terraform init' first)"
fi
echo ""

# Summary
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Ready to deploy. Run:"
    echo "  terraform plan"
    echo "  terraform apply"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
    echo ""
    echo "You can proceed with deployment, but review warnings above."
    echo "Run: terraform plan"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s), $WARNINGS warning(s)${NC}"
    echo ""
    echo "Fix errors before deploying."
    exit 1
fi
