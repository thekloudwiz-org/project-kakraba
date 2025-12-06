#!/bin/bash

# Script to create test user accounts in AWS Cognito for E2E testing
# Usage: ./scripts/create-test-users.sh <environment>
# Example: ./scripts/create-test-users.sh dev

set -e

ENVIRONMENT=${1:-dev}

echo "Creating test users for environment: $ENVIRONMENT"

# Get Cognito User Pool ID from Terraform output
echo "Getting Cognito User Pool ID from Terraform..."
USER_POOL_ID=$(cd infra && terraform output -raw cognito_user_pool_id 2>/dev/null)

if [ -z "$USER_POOL_ID" ]; then
    echo "Error: Could not get Cognito User Pool ID from Terraform"
    echo "Make sure you're in the project root directory and Terraform is initialized"
    exit 1
fi

if [ -z "$USER_POOL_ID" ]; then
    echo "Error: Could not find User Pool ID for environment $ENVIRONMENT"
    exit 1
fi

echo "Using User Pool ID: $USER_POOL_ID"

# Test user credentials
CREATOR_EMAIL="test-creator@example.com"
CREATOR_PASSWORD="TestPassword123!"
CREATOR_NAME="Test Creator"

FAN_EMAIL="test-fan@example.com"
FAN_PASSWORD="TestPassword123!"
FAN_NAME="Test Fan"

# Function to create a user
create_user() {
    local email=$1
    local password=$2
    local name=$3
    
    echo "Creating user: $email"
    
    # Check if user already exists
    if aws cognito-idp admin-get-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$email" \
        --region eu-central-1 2>/dev/null; then
        echo "User $email already exists. Deleting..."
        aws cognito-idp admin-delete-user \
            --user-pool-id "$USER_POOL_ID" \
            --username "$email" \
            --region eu-central-1
    fi
    
    # Create user
    aws cognito-idp admin-create-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$email" \
        --user-attributes \
            Name=email,Value="$email" \
            Name=email_verified,Value=true \
        --message-action SUPPRESS \
        --region eu-central-1
    
    # Set permanent password
    aws cognito-idp admin-set-user-password \
        --user-pool-id "$USER_POOL_ID" \
        --username "$email" \
        --password "$password" \
        --permanent \
        --region eu-central-1
    
    echo "✅ Created user: $email"
}

# Create test creator
create_user "$CREATOR_EMAIL" "$CREATOR_PASSWORD" "$CREATOR_NAME"

# Create test fan
create_user "$FAN_EMAIL" "$FAN_PASSWORD" "$FAN_NAME"

echo ""
echo "✅ Test users created successfully!"
echo ""
echo "Creator Account:"
echo "  Email: $CREATOR_EMAIL"
echo "  Password: $CREATOR_PASSWORD"
echo ""
echo "Fan Account:"
echo "  Email: $FAN_EMAIL"
echo "  Password: $FAN_PASSWORD"
echo ""
echo "These accounts can be used for E2E testing."
