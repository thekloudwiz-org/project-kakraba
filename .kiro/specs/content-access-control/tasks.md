# Implementation Plan

## Phase 1: Infrastructure Setup (Terraform)

- [x] 1. Create Terraform root module structure
  - Create infra/ directory with main.tf, variables.tf, outputs.tf, versions.tf
  - Create modules/ subdirectory for reusable modules
  - Configure AWS provider and required Terraform version (>= 1.0)
  - Define root-level input variables (environment, region, project_name, cognito_user_pool_id)
  - Create terraform.tfvars.example with sample values
  - _Requirements: All_

- [x] 2. Create storage module (modules/storage)
  - [x] 2.1 Create module structure
    - Create modules/storage/ with main.tf, variables.tf, outputs.tf
    - Define input variables: project_name, environment, cloudfront_oai_iam_arn
    - _Requirements: All_

  - [x] 2.2 Implement S3 bucket resources
    - Create aws_s3_bucket for creator content storage
    - Enable versioning with aws_s3_bucket_versioning
    - Configure lifecycle rules with aws_s3_bucket_lifecycle_configuration
    - Enable server-side encryption (AES-256 or KMS)
    - Block public access with aws_s3_bucket_public_access_block
    - Create bucket policy allowing CloudFront OAI access only
    - Output bucket ID, ARN, and regional domain name
    - _Requirements: All_

- [x] 3. Create content-delivery module (modules/content-delivery)
  - [x] 3.1 Create module structure
    - Create modules/content-delivery/ with main.tf, variables.tf, outputs.tf
    - Define input variables: project_name, environment, s3_bucket_regional_domain_name, s3_bucket_id
    - _Requirements: 1.2, 1.4, 2.4, 5.1_

  - [x] 3.2 Implement CloudFront resources
    - Create aws_cloudfront_origin_access_identity
    - Create aws_cloudfront_distribution with S3 origin
    - Configure cache behaviors for content types (audio/*, video/*, application/pdf, image/*)
    - Create aws_cloudfront_public_key resource
    - Create aws_cloudfront_key_group with public key
    - Configure custom error responses (403, 404)
    - Enable access logging
    - Output CloudFront domain name, distribution ID, key pair ID
    - _Requirements: 1.2, 1.4, 2.4, 5.1, 5.2, 5.3_

  - [x] 3.3 Implement Secrets Manager for CloudFront private key
    - Create aws_secretsmanager_secret for CloudFront private key
    - Create aws_secretsmanager_secret_version with placeholder or actual key
    - Output secret ARN
    - _Requirements: 5.1_

- [x] 4. Create database module (modules/database)
  - [x] 4.1 Create module structure
    - Create modules/database/ with main.tf, variables.tf, outputs.tf
    - Define input variables: project_name, environment
    - _Requirements: 2.1, 3.1, 7.1_

  - [x] 4.2 Implement DynamoDB table
    - Create aws_dynamodb_table named CreatorVault
    - Configure hash_key (PK) and range_key (SK) as strings
    - Add global_secondary_index GSI1 with GSI1PK and GSI1SK
    - Set billing_mode to PAY_PER_REQUEST
    - Enable point_in_time_recovery
    - Add resource tags
    - Output table name, ARN, and stream ARN
    - _Requirements: 2.1, 3.1, 7.1_

- [x] 5. Create compute module (modules/compute)
  - [x] 5.1 Create module structure
    - Create modules/compute/ with main.tf, variables.tf, outputs.tf
    - Define input variables: project_name, environment, lambda_package_path, table_name, cloudfront_domain, cloudfront_key_pair_id, cloudfront_secret_arn, iam_role_arn
    - _Requirements: All_

  - [x] 5.2 Implement Lambda function
    - Create aws_lambda_function with Node.js 20.x runtime
    - Reference deployment package from var.lambda_package_path
    - Set environment variables (TABLE_NAME, CLOUDFRONT_DOMAIN, CLOUDFRONT_KEY_PAIR_ID, CLOUDFRONT_PRIVATE_KEY_SECRET_ARN)
    - Configure timeout (30s), memory (512MB)
    - Attach IAM role
    - Enable X-Ray tracing
    - Output Lambda function ARN, name, and invoke ARN
    - _Requirements: All_

- [x] 6. Create api-gateway module (modules/api-gateway)
  - [x] 6.1 Create module structure
    - Create modules/api-gateway/ with main.tf, variables.tf, outputs.tf
    - Define input variables: project_name, environment, lambda_invoke_arn, lambda_function_name, cognito_user_pool_id, cognito_user_pool_client_ids
    - _Requirements: 8.1_

  - [x] 6.2 Implement API Gateway resources
    - Create aws_apigatewayv2_api (HTTP API protocol)
    - Create aws_apigatewayv2_stage named $default with auto_deploy
    - Configure CORS if needed
    - Create aws_apigatewayv2_authorizer for Cognito
    - Create aws_apigatewayv2_route for POST /access/generate-link
    - Create aws_apigatewayv2_integration connecting to Lambda
    - Create aws_lambda_permission for API Gateway invocation
    - Output API endpoint URL and API ID
    - _Requirements: 8.1_

- [x] 7. Create iam module (modules/iam)
  - [x] 7.1 Create module structure
    - Create modules/iam/ with main.tf, variables.tf, outputs.tf
    - Define input variables: project_name, environment, dynamodb_table_arn, cloudfront_secret_arn
    - _Requirements: All_

  - [x] 7.2 Implement IAM resources
    - Create aws_iam_role for Lambda execution with assume role policy
    - Create aws_iam_policy_document for DynamoDB access (GetItem, UpdateItem, Query)
    - Create aws_iam_policy_document for Secrets Manager access (GetSecretValue)
    - Create aws_iam_policy_document for CloudWatch Logs
    - Create aws_iam_policy resources from policy documents
    - Attach policies to role with aws_iam_role_policy_attachment
    - Output Lambda role ARN and name
    - _Requirements: All_

- [x] 8. Wire modules together in root main.tf
  - Instantiate storage module
  - Instantiate content-delivery module (depends on storage outputs)
  - Instantiate database module
  - Instantiate iam module (depends on database and content-delivery outputs)
  - Instantiate compute module (depends on iam, database, content-delivery outputs)
  - Instantiate api-gateway module (depends on compute output)
  - Define root-level outputs aggregating module outputs
  - _Requirements: All_

- [x] 9. Create documentation and examples
  - Add README.md in infra/ with module architecture diagram
  - Document each module's purpose and inputs/outputs
  - Create deployment instructions (init, plan, apply)
  - Document how to update Lambda code after initial deployment
  - Add troubleshooting section
  - _Requirements: All_

## Phase 2: Lambda Application Development

- [x] 10. Set up Lambda application structure
  - Create app/ directory
  - Create subdirectories: handlers/, services/, repositories/, types/, utils/
  - Initialize package.json with project metadata
  - Configure TypeScript (tsconfig.json) with strict mode, ES2020 target, and output to dist/
  - Install runtime dependencies: @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb, @aws-sdk/client-secrets-manager, @aws-sdk/cloudfront-signer
  - Install dev dependencies: typescript, @types/node, @types/aws-lambda, jest, ts-jest, @types/jest, fast-check
  - Configure Jest (jest.config.js) for TypeScript
  - Create build script in package.json (tsc && zip)
  - _Requirements: All_

- [x] 11. Define TypeScript types and enums
  - Create types/index.ts with all type definitions
  - Define AccessRight, Product, AccessValidationResult interfaces
  - Define AccessRequest, AccessResponse, ErrorResponse types
  - Create enums: AccessType, ProductType, Intent
  - Define Config interface for environment variables
  - _Requirements: 8.1_

- [x] 12. Implement DynamoDB repository
  - [x] 12.1 Create DynamoDBRepository class
    - Initialize DynamoDB DocumentClient
    - Implement getAccessRight(userId, productId) method
    - Implement getProduct(creatorId, productId) method
    - Implement hasValidSubscription(userId, creatorId) using GSI query
    - Implement decrementDownloads(userId, productId) with atomic UpdateItem
    - Add error handling for all DynamoDB operations
    - _Requirements: 2.1, 2.2, 2.5, 3.1, 7.1, 7.3_

  - [x] 12.2 Write unit tests for repository
    - Test getAccessRight with existing and missing access rights
    - Test decrementDownloads with various counter values
    - Test decrementDownloads rejection when counter is 0
    - Test error handling for DynamoDB failures
    - Mock DynamoDB client responses
    - _Requirements: 2.1, 2.5, 7.5_

  - [x] 12.3 Write property test for atomic counter
    - **Property 7: Download counter updates are atomic**
    - Generate random concurrent download requests
    - Verify final counter equals initial minus successful requests
    - **Validates: Requirements 2.5**

- [x] 13. Implement access validation service
  - [x] 13.1 Create AccessValidator class
    - Implement validateAccess(userId, productId, intent) orchestration method
    - Implement checkDirectAccessRight helper
    - Implement checkSubscriptionAccess helper
    - Implement validateIntentForAccessType business rules
    - Return structured AccessValidationResult
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.4, 3.5, 4.3_

  - [x] 13.2 Write property tests for access validation
    - **Property 1: Purchase access allows unlimited streaming** - _Requirements 1.1, 1.5_
    - **Property 3: Streaming preserves download counter** - _Requirements 1.3_
    - **Property 5: Download with remaining quota succeeds** - _Requirements 2.1, 2.2_
    - **Property 8: Subscription fallback when no direct access** - _Requirements 3.1_
    - **Property 9: Subscription allows only streaming** - _Requirements 3.2, 3.3_
    - **Property 10: Products respect subscription flag** - _Requirements 3.4_
    - **Property 11: Static content excludes subscriptions** - _Requirements 3.5, 4.1, 4.2_
    - **Property 12: Dynamic content allows subscriptions** - _Requirements 4.3_

  - [x] 13.3 Write unit tests for edge cases
    - Test validation with downloads_remaining = 0
    - Test validation with expired subscription
    - Test validation with missing product
    - Test error message formatting
    - _Requirements: 2.3, 3.4, 6.1_

- [x] 14. Implement CloudFront signed URL generator
  - [x] 14.1 Create SignedUrlGenerator class
    - Load CloudFront private key from Secrets Manager
    - Implement generateSignedUrl(s3Key, intent, filename) method
    - Implement buildCustomPolicy with Content-Disposition header override
    - Implement getContentDisposition helper (inline vs attachment)
    - Set expiration to 15 minutes from generation time
    - Use @aws-sdk/cloudfront-signer for URL signing
    - _Requirements: 1.2, 1.4, 2.4, 5.1, 5.2, 5.3_

  - [x] 14.2 Write property tests for URL generation
    - **Property 2: Stream URLs have inline Content-Disposition** - _Requirements 1.2_
    - **Property 4: All signed URLs expire in 15 minutes** - _Requirements 1.4, 5.2, 5.3_
    - **Property 6: Download URLs have attachment Content-Disposition** - _Requirements 2.4_
    - **Property 13: All signed URLs use CloudFront signing** - _Requirements 5.1_

  - [x] 14.3 Write unit tests for URL generation
    - Test URL generation with STREAM intent
    - Test URL generation with DOWNLOAD intent
    - Test policy structure and expiration calculation
    - Test error handling for signing failures
    - Mock Secrets Manager responses
    - _Requirements: 1.2, 1.4, 2.4, 5.1_

- [x] 15. Implement download counter manager
  - [x] 15.1 Create DownloadCounterManager class
    - Implement decrementDownloadCounter(userId, productId) method
    - Validate counter > 0 before attempting decrement
    - Use DynamoDB conditional update to prevent negative values
    - Return updated counter value
    - Handle conditional check failures gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 15.2 Write unit tests for counter manager
    - Test successful decrement with counter > 0
    - Test rejection when counter = 0
    - Test concurrent decrement scenarios
    - Test error handling
    - _Requirements: 2.2, 2.3, 2.5_

- [x] 16. Implement main Lambda handler
  - [x] 16.1 Create handler function
    - Parse API Gateway event and extract request body
    - Validate required parameters (product_id, user_id, intent)
    - Validate intent is STREAM or DOWNLOAD
    - Orchestrate: validation → counter decrement (if needed) → URL generation
    - Format success response with URL, expiration, access type, downloads remaining
    - Implement comprehensive error handling
    - Format error responses consistently
    - Add structured logging with context
    - _Requirements: 8.1, 8.4, 8.5_

  - [x] 16.2 Write property tests for handler
    - **Property 16: Valid requests parse successfully** - _Requirements 8.1_
    - **Property 14: Error responses have proper structure** - _Requirements 6.5_
    - **Property 15: DynamoDB errors propagate correctly** - _Requirements 7.5_

  - [x] 16.3 Write unit tests for handler edge cases
    - Test missing product_id parameter
    - Test missing user_id parameter
    - Test missing intent parameter
    - Test invalid intent value
    - Test malformed JSON body
    - Test all error response formats
    - _Requirements: 8.4, 8.5, 6.1, 6.2, 6.3, 6.4_

- [x] 17. Create integration tests
  - Set up DynamoDB Local for testing
  - Create test fixtures for users, products, and access rights
  - Test end-to-end flow: request → validation → URL generation
  - Test multiple sequential requests to verify state changes
  - Test actual CloudFront URL signing with test key pair
  - Clean up test data after each test
  - _Requirements: All_

- [x] 18. Checkpoint - Run all tests
  - Execute all unit tests and verify they pass
  - Execute all property-based tests (100+ iterations each)
  - Execute integration tests
  - Ensure all tests pass, ask the user if questions arise

## Phase 3: Deployment and Validation

- [x] 19. Build and package Lambda function
  - Run TypeScript compiler (tsc)
  - Copy node_modules to dist/ (production dependencies only)
  - Create lambda.zip with compiled code and dependencies
  - Verify package size is within Lambda limits
  - _Requirements: All_

- [x] 20. Deploy infrastructure with Terraform
  - Run terraform init in infra/
  - Run terraform plan and review changes
  - Run terraform apply to provision all resources
  - Verify all resources created successfully
  - Note outputs (API Gateway URL, CloudFront domain, etc.)
  - _Requirements: All_

- [x] 21. Final validation and testing
  - Test API endpoint with curl or Postman
  - Verify CloudFront signed URLs work correctly
  - Test stream intent with valid purchase
  - Test download intent with remaining quota
  - Test download limit enforcement
  - Test subscription-based access
  - Test error scenarios (no access, invalid parameters)
  - Verify CloudWatch logs are being generated
  - _Requirements: All_

- [ ] 22. Documentation and cleanup
  - Document API endpoint and usage examples
  - Document environment variables and configuration
  - Create deployment runbook
  - Document testing procedures
  - Add troubleshooting guide
  - _Requirements: All_
