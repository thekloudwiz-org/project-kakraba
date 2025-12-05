#!/bin/bash
#
# Update GitHub Secrets and Variables from Terraform Outputs
# This script reads Terraform outputs and updates GitHub repository secrets/variables
# so that backend and frontend CI/CD workflows always have current infrastructure values
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check required environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}Error: GITHUB_TOKEN environment variable is required${NC}"
  exit 1
fi

if [ -z "$GITHUB_REPOSITORY" ]; then
  echo -e "${RED}Error: GITHUB_REPOSITORY environment variable is required${NC}"
  exit 1
fi

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
  echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
  exit 1
fi

# Test GitHub CLI authentication
echo -e "${YELLOW}Testing GitHub CLI authentication...${NC}"
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}⚠️  GitHub CLI not authenticated, attempting login...${NC}"
  if ! echo "$GITHUB_TOKEN" | gh auth login --with-token 2>&1; then
    echo -e "${RED}❌ Failed to authenticate with GitHub CLI${NC}"
    echo -e "${YELLOW}Note: Default GITHUB_TOKEN may not have 'secrets' write permission${NC}"
    echo -e "${YELLOW}To fix: Create a PAT with 'repo' scope and add as PAT_TOKEN secret${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
echo ""

ENVIRONMENT=${1:-dev}
TERRAFORM_DIR=${2:-infra}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Updating GitHub Secrets from Terraform${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Environment: $ENVIRONMENT"
echo "Repository: $GITHUB_REPOSITORY"
echo ""

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Get Terraform outputs as JSON
echo -e "${YELLOW}Reading Terraform outputs...${NC}"
if ! terraform output -json > /tmp/tf-outputs.json; then
  echo -e "${RED}Failed to read Terraform outputs${NC}"
  exit 1
fi

# Extract values from Terraform outputs
LAMBDA_FUNCTION_NAME=$(jq -r '.lambda_function_name.value // empty' /tmp/tf-outputs.json)
S3_BUCKET=$(jq -r '.website_s3_bucket.value // empty' /tmp/tf-outputs.json)
CLOUDFRONT_ID=$(jq -r '.website_cloudfront_id.value // empty' /tmp/tf-outputs.json)
API_ENDPOINT=$(jq -r '.api_endpoint.value // empty' /tmp/tf-outputs.json)
WEBSITE_URL=$(jq -r '.website_url.value // empty' /tmp/tf-outputs.json)
COGNITO_USER_POOL_ID=$(jq -r '.cognito_user_pool_id.value // empty' /tmp/tf-outputs.json)
COGNITO_CLIENT_ID=$(jq -r '.cognito_client_id.value // empty' /tmp/tf-outputs.json)
COGNITO_DOMAIN=$(jq -r '.cognito_domain.value // empty' /tmp/tf-outputs.json)
AWS_REGION=$(jq -r '.aws_region.value // "eu-central-1"' /tmp/tf-outputs.json)

# Convert environment to uppercase for naming
ENV_UPPER=$(echo "$ENVIRONMENT" | tr '[:lower:]' '[:upper:]')

echo -e "${YELLOW}Terraform Outputs:${NC}"
echo "  AWS Region: $AWS_REGION"
echo "  Lambda Function: $LAMBDA_FUNCTION_NAME"
echo "  S3 Bucket: $S3_BUCKET"
echo "  CloudFront ID: $CLOUDFRONT_ID"
echo "  API Endpoint: ${API_ENDPOINT:0:50}..."
echo "  Website URL: $WEBSITE_URL"
echo "  Cognito User Pool: $COGNITO_USER_POOL_ID"
echo "  Cognito Client ID: $COGNITO_CLIENT_ID"
echo "  Cognito Domain: $COGNITO_DOMAIN"
echo ""

# Function to update a GitHub variable
update_variable() {
  local var_name=$1
  local var_value=$2

  if [ -z "$var_value" ]; then
    echo -e "${YELLOW}⚠️  Skipping variable $var_name (empty value)${NC}"
    return
  fi

  if echo "$var_value" | gh variable set "$var_name" --repo "$GITHUB_REPOSITORY" --body - 2>&1; then
    echo -e "${GREEN}✓${NC} Updated variable $var_name"
  else
    echo -e "${RED}✗${NC} Failed to update variable $var_name"
  fi
}

# Function to update a GitHub secret
update_secret() {
  local secret_name=$1
  local secret_value=$2

  if [ -z "$secret_value" ]; then
    echo -e "${YELLOW}⚠️  Skipping secret $secret_name (empty value)${NC}"
    return
  fi

  if echo "$secret_value" | gh secret set "$secret_name" --repo "$GITHUB_REPOSITORY" --body - 2>&1; then
    echo -e "${GREEN}✓${NC} Updated secret $secret_name"
  else
    echo -e "${RED}✗${NC} Failed to update secret $secret_name"
    echo -e "${YELLOW}   Note: GITHUB_TOKEN may not have 'secrets' write permission${NC}"
  fi
}

# Update GitHub Variables (used by backend/frontend workflows)
echo -e "${BLUE}Updating GitHub variables...${NC}"
update_variable "LAMBDA_FUNCTION_NAME_${ENV_UPPER}" "$LAMBDA_FUNCTION_NAME"
update_variable "S3_BUCKET_${ENV_UPPER}" "$S3_BUCKET"
update_variable "CLOUDFRONT_ID_${ENV_UPPER}" "$CLOUDFRONT_ID"
update_variable "WEBSITE_URL" "$WEBSITE_URL"

echo ""

# Update GitHub Secrets (used by frontend workflows)
echo -e "${BLUE}Updating GitHub secrets...${NC}"
update_secret "VITE_API_ENDPOINT_${ENV_UPPER}" "$API_ENDPOINT"
update_secret "VITE_COGNITO_USER_POOL_ID_${ENV_UPPER}" "$COGNITO_USER_POOL_ID"
update_secret "VITE_COGNITO_CLIENT_ID_${ENV_UPPER}" "$COGNITO_CLIENT_ID"
update_secret "VITE_COGNITO_DOMAIN_${ENV_UPPER}" "$COGNITO_DOMAIN"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ GitHub secrets/variables update complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Updated variables:${NC}"
echo "  - LAMBDA_FUNCTION_NAME_${ENV_UPPER}"
echo "  - S3_BUCKET_${ENV_UPPER}"
echo "  - CLOUDFRONT_ID_${ENV_UPPER}"
echo "  - WEBSITE_URL (shared across all environments)"
echo ""
echo -e "${YELLOW}Updated secrets:${NC}"
echo "  - VITE_API_ENDPOINT_${ENV_UPPER}"
echo "  - VITE_COGNITO_USER_POOL_ID_${ENV_UPPER}"
echo "  - VITE_COGNITO_CLIENT_ID_${ENV_UPPER}"
echo "  - VITE_COGNITO_DOMAIN_${ENV_UPPER}"
echo ""
echo -e "${YELLOW}Note:${NC} Stripe keys must be set manually:"
echo "  - VITE_STRIPE_PUBLISHABLE_KEY_TEST (for dev/stg)"
echo "  - VITE_STRIPE_PUBLISHABLE_KEY_LIVE (for prod)"

# Cleanup
rm -f /tmp/tf-outputs.json
