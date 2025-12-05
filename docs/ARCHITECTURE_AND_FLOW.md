# Architecture & Flow Documentation

This document provides a comprehensive overview of the Kakraba platform's infrastructure architecture and application flow.

## Table of Contents

- [System Architecture](#system-architecture)
- [Infrastructure Components](#infrastructure-components)
- [Application Flow](#application-flow)
- [Data Models](#data-models)
- [Security Architecture](#security-architecture)
- [Scalability & Performance](#scalability--performance)

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet Users                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTPS
             │
    ┌────────▼──────────────────────────────────────────────┐
    │              Route 53 DNS                              │
    │  kakraba.thekloudwiz.com                              │
    │  api-kakraba.thekloudwiz.com                          │
    └────────┬──────────────────────────────────────────────┘
             │
             ├─────────────────────┬─────────────────────────┐
             │                     │                         │
    ┌────────▼────────┐   ┌───────▼────────┐   ┌──────────▼────────┐
    │  Website CDN    │   │  Content CDN   │   │   API Gateway     │
    │  (CloudFront)   │   │  (CloudFront)  │   │   (HTTP API)      │
    │  Public         │   │  Private       │   │   + Cognito Auth  │
    └────────┬────────┘   └───────┬────────┘   └──────────┬────────┘
             │                     │                        │
    ┌────────▼────────┐   ┌───────▼────────┐   ┌──────────▼────────┐
    │  Website S3     │   │  Content S3    │   │  Lambda Functions │
    │  Static Apps    │   │  User Files    │   │  - User Mgmt      │
    │  - Landing      │   │  - Videos      │   │  - Content Mgmt   │
    │  - Creator      │   │  - Audio       │   │  - Product Mgmt   │
    │  - Fan Portal   │   │  - PDFs        │   │  - Payment        │
    └─────────────────┘   │  - Images      │   │  - Analytics      │
                          └────────────────┘   └──────────┬────────┘
                                                           │
                          ┌────────────────────────────────┼────────┐
                          │                                │        │
                 ┌────────▼────────┐            ┌─────────▼──────┐ │
                 │   DynamoDB      │            │    Cognito     │ │
                 │   Single Table  │            │   User Pools   │ │
                 │   - Users       │            └────────────────┘ │
                 │   - Content     │                               │
                 │   - Products    │            ┌─────────────────▼┐
                 │   - Access      │            │  Secrets Manager │
                 │   - Transactions│            │  - CF Private Key│
                 └─────────────────┘            │  - Stripe Keys   │
                                                └──────────────────┘
                          ┌────────────────────────────────────────┐
                          │         External Services              │
                          │  - Stripe (Payments)                   │
                          │  - CloudWatch (Monitoring)             │
                          │  - X-Ray (Tracing)                     │
                          └────────────────────────────────────────┘
```

## Infrastructure Components

### 1. Content Delivery Network (CDN)

#### Website CloudFront Distribution
- **Purpose:** Serves static web applications
- **Domain:** `kakraba.thekloudwiz.com`
- **Origin:** S3 bucket with static files
- **Access:** Public
- **Features:**
  - Path-based routing (`/`, `/creator`, `/fan`)
  - CloudFront Function for URI rewriting
  - Aggressive caching for static assets
  - Security headers (CSP, HSTS, X-Frame-Options)
  - Brotli compression

#### Content CloudFront Distribution
- **Purpose:** Serves user-uploaded content
- **Domain:** `d1rwanl0beslh.cloudfront.net`
- **Origin:** S3 bucket with user content
- **Access:** Private (signed URLs only)
- **Features:**
  - 15-minute URL expiration
  - Origin Access Identity (OAI) for S3 access
  - Access control via signed URLs
  - Optimized for large file delivery

### 2. API Gateway

- **Type:** HTTP API (lower latency, lower cost than REST API)
- **Domain:** `api-kakraba.thekloudwiz.com`
- **Authentication:** AWS Cognito JWT authorizer
- **Features:**
  - CORS configuration for frontend domains
  - Request validation
  - Rate limiting and throttling
  - CloudWatch logging
  - Custom domain with ACM certificate

### 3. Lambda Functions

All Lambda functions run on Node.js 20.x runtime with:
- X-Ray tracing enabled
- CloudWatch Logs integration
- VPC integration (if needed)
- Environment variables for configuration
- Reserved concurrency for critical functions

**Functions:**
1. **Access Control** - Generates signed URLs for content access
2. **User Management** - User profile and data operations
3. **Content Management** - Content upload and metadata management
4. **Product Management** - Product CRUD operations
5. **Payment Service** - Stripe integration and payment processing
6. **Analytics Service** - Metrics aggregation and reporting

### 4. Data Storage

#### DynamoDB
- **Design:** Single-table design pattern
- **Billing:** On-demand capacity mode
- **Features:**
  - Point-in-time recovery enabled
  - Encryption at rest
  - DynamoDB Streams for analytics
  - Global Secondary Indexes (GSI1, GSI2)

**Access Patterns:**
- Get user by ID
- Get user by email
- Get content by creator
- Get products by creator
- Get access rights by user
- Get transactions by user/creator
- Query analytics by date range

#### S3 Buckets

**Website Bucket:**
- Stores static web applications
- Versioning enabled
- Lifecycle policies for old versions
- CloudFront OAI access only

**Content Bucket:**
- Stores user-uploaded files
- Versioning enabled
- Server-side encryption (SSE-S3)
- Block public access enabled
- CloudFront OAI access only

**CloudFront Logs Bucket:**
- Stores access logs
- Lifecycle policy for log retention

### 5. Authentication & Authorization

#### AWS Cognito
- **User Pools:** Separate pools for dev/prod
- **Features:**
  - Email verification required
  - Password policy enforcement
  - MFA optional
  - Custom attributes (userType: CREATOR/FAN)
  - JWT token issuance
  - Token refresh capability

#### Authorization Flow
1. User authenticates with Cognito
2. Receives JWT access token
3. Frontend stores token in httpOnly cookie
4. API Gateway validates JWT on each request
5. Lambda functions extract user info from JWT

### 6. Payment Processing

#### Stripe Integration
- **Mode:** Test mode for dev, live mode for prod
- **Features:**
  - Payment Intents for one-time purchases
  - Subscriptions for recurring payments
  - Webhook handling for payment events
  - Customer management
  - Payment method storage

#### Payment Flow
1. Frontend creates payment intent via API
2. Stripe.js collects payment details
3. Frontend confirms payment with Stripe
4. Backend verifies payment and creates access right
5. Webhook handles async payment events

### 7. Monitoring & Observability

#### CloudWatch
- **Dashboards:**
  - Main dashboard (system health)
  - Business metrics dashboard
- **Alarms:**
  - Lambda errors, throttles, duration
  - API Gateway errors, latency
  - DynamoDB errors, throttles
  - CloudFront error rates
- **Logs:**
  - Lambda function logs
  - API Gateway access logs
  - 14-day retention

#### AWS X-Ray
- **Features:**
  - Service map visualization
  - Request tracing
  - Performance insights
  - Error analysis

## Application Flow

### Creator Journey

#### 1. Registration & Authentication
```
User → Landing Page → Creator Portal → Registration Form
  ↓
API Gateway → Lambda (User Management) → Cognito
  ↓
Email Verification → Login → JWT Token → Dashboard
```

#### 2. Content Upload
```
Creator → Upload Interface → Select File
  ↓
API: POST /content/upload-url
  ↓
Lambda validates → Generates presigned S3 URL
  ↓
Direct upload to S3 (bypasses Lambda)
  ↓
API: POST /content (confirm upload)
  ↓
Lambda creates DynamoDB record
```

#### 3. Product Creation
```
Creator → Product Form → Select Content + Set Price
  ↓
API: POST /products
  ↓
Lambda validates → Creates product in DynamoDB
  ↓
Product available for purchase
```

#### 4. Analytics Viewing
```
Creator → Analytics Dashboard
  ↓
API: GET /analytics/dashboard
  ↓
Lambda queries DynamoDB → Aggregates metrics
  ↓
Returns: revenue, subscribers, views, engagement
```

### Fan Journey

#### 1. Registration & Authentication
```
User → Landing Page → Fan Portal → Registration Form
  ↓
API Gateway → Lambda (User Management) → Cognito
  ↓
Email Verification → Login → JWT Token → Discovery Page
```

#### 2. Content Discovery
```
Fan → Browse/Search Interface
  ↓
API: GET /products?filters=...
  ↓
Lambda queries DynamoDB → Returns products
  ↓
Display: Product cards with preview images
```

#### 3. Purchase Flow
```
Fan → Select Product → Checkout
  ↓
API: POST /payments/create-intent
  ↓
Lambda → Stripe: Create Payment Intent
  ↓
Frontend: Stripe.js collects payment
  ↓
API: POST /payments/confirm
  ↓
Lambda verifies payment → Creates access right in DynamoDB
  ↓
Success: Redirect to library
```

#### 4. Content Access
```
Fan → My Library → Select Content → Click Stream/Download
  ↓
API: POST /access/generate-link
  ↓
Lambda:
  1. Verify access right in DynamoDB
  2. Check download quota (if download)
  3. Get S3 key from content record
  4. Generate CloudFront signed URL (15-min expiration)
  5. Return signed URL
  ↓
Browser uses signed URL → CloudFront validates → Serves content
```

### Detailed Request Flow

#### Content Access Request (Most Complex Flow)

```
┌──────────┐
│   Fan    │
└────┬─────┘
     │
     │ 1. Click "Stream Video"
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Fan Portal (React App from Website CloudFront)          │
│ - Retrieves JWT token from cookie                       │
│ - Makes API request                                     │
└────┬────────────────────────────────────────────────────┘
     │
     │ 2. POST /access/generate-link
     │    Headers: Authorization: Bearer <JWT>
     │    Body: {productId, userId, intent: "STREAM"}
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ API Gateway                                             │
│ - Validates JWT with Cognito                           │
│ - Extracts user info (userId, userType)                │
│ - Routes to Lambda                                      │
└────┬────────────────────────────────────────────────────┘
     │
     │ 3. Invoke Lambda with event
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Lambda (Access Control)                                 │
│ Step 1: Query DynamoDB for access right                │
│   PK: USER#<userId>                                     │
│   SK: ACCESS#<productId>                                │
│                                                          │
│ Step 2: Validate access                                 │
│   - Check if access right exists                        │
│   - Check if not expired                                │
│   - Check download quota (if DOWNLOAD intent)           │
│                                                          │
│ Step 3: Get content metadata                            │
│   Query DynamoDB for content record                     │
│   Get S3 key                                            │
│                                                          │
│ Step 4: Generate signed URL                             │
│   - Get CloudFront private key from Secrets Manager    │
│   - Create CloudFront signed URL                        │
│   - Set 15-minute expiration                            │
│   - Sign with key pair ID                               │
│                                                          │
│ Step 5: Update quota (if DOWNLOAD)                      │
│   Decrement downloadsRemaining in DynamoDB              │
│                                                          │
│ Step 6: Return response                                 │
│   {url, expiresAt, downloadsRemaining}                  │
└────┬────────────────────────────────────────────────────┘
     │
     │ 4. Return signed URL to frontend
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Fan Portal                                              │
│ - Receives signed URL                                   │
│ - If STREAM: Loads video player with URL               │
│ - If DOWNLOAD: Initiates download                      │
└────┬────────────────────────────────────────────────────┘
     │
     │ 5. Request content with signed URL
     │    GET https://d1rwanl0beslh.cloudfront.net/...?Signature=...
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Content CloudFront Distribution                         │
│ - Validates signature                                   │
│ - Checks expiration                                     │
│ - If valid: Fetch from S3 (or serve from cache)        │
│ - If invalid: Return 403 Forbidden                     │
└────┬────────────────────────────────────────────────────┘
     │
     │ 6. Fetch from S3 (if not cached)
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ Content S3 Bucket                                       │
│ - CloudFront uses OAI to access                        │
│ - Returns content file                                  │
└────┬────────────────────────────────────────────────────┘
     │
     │ 7. Stream content to user
     │
     ▼
┌──────────┐
│   Fan    │
│ (Playing)│
└──────────┘
```

## Data Models

### DynamoDB Single-Table Design

**Table Name:** `kakraba-{env}-creator-vault`

**Primary Key:**
- `PK` (Partition Key): String
- `SK` (Sort Key): String

**Global Secondary Indexes:**
- `GSI1`: `GSI1PK` (PK), `GSI1SK` (SK)
- `GSI2`: `GSI2PK` (PK), `GSI2SK` (SK)

### Entity Patterns

#### User Entity
```
PK: USER#<userId>
SK: PROFILE
Attributes: userId, email, displayName, bio, userType, createdAt
GSI1PK: USER
GSI1SK: <email>
```

#### Content Entity
```
PK: CREATOR#<creatorId>
SK: CONTENT#<contentId>
Attributes: contentId, title, description, contentType, s3Key, fileSize
GSI1PK: CONTENT
GSI1SK: <uploadedAt>
```

#### Product Entity
```
PK: CREATOR#<creatorId>
SK: PRODUCT#<productId>
Attributes: productId, title, price, contentIds, accessType, downloadQuota
GSI1PK: PRODUCT
GSI1SK: <createdAt>
```

#### Access Right Entity
```
PK: USER#<userId>
SK: ACCESS#<productId>
Attributes: productId, accessType, downloadsRemaining, purchaseDate, expiresAt
GSI1PK: SUBSCRIPTION#<userId>#<creatorId>
GSI1SK: <expiresAt>
```

#### Transaction Entity
```
PK: USER#<userId>
SK: TRANSACTION#<transactionId>
Attributes: transactionId, productId, amount, status, createdAt
GSI1PK: CREATOR#<creatorId>
GSI1SK: <createdAt>
```

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                               │
│ - HTTPS/TLS 1.3 only                                    │
│ - CloudFront with AWS Shield Standard                   │
│ - API Gateway throttling and rate limiting              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Authentication & Authorization                 │
│ - AWS Cognito for user authentication                   │
│ - JWT tokens with short expiration                      │
│ - Role-based access control (Creator/Fan)               │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Application Security                           │
│ - Input validation (Zod schemas)                        │
│ - File type and size validation                         │
│ - Malware scanning framework                            │
│ - XSS prevention (React escaping)                       │
│ - CSRF protection (SameSite cookies)                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Data Security                                  │
│ - Encryption at rest (S3, DynamoDB)                     │
│ - Encryption in transit (TLS)                           │
│ - Signed URLs with expiration                           │
│ - Private S3 buckets (no public access)                 │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Monitoring & Compliance                        │
│ - CloudWatch alarms for security events                 │
│ - X-Ray tracing for audit trails                        │
│ - GDPR compliance (data export/deletion)                │
│ - PCI DSS compliance (via Stripe)                       │
└─────────────────────────────────────────────────────────┘
```

### Content Access Security

1. **S3 Bucket:** Completely private, no public access
2. **CloudFront OAI:** Only CloudFront can access S3
3. **Signed URLs:** Generated by Lambda with private key
4. **Expiration:** URLs expire after 15 minutes
5. **Access Control:** Verified in DynamoDB before URL generation
6. **Download Quota:** Enforced at URL generation time

## Scalability & Performance

### Auto-Scaling Components

- **Lambda:** Automatic scaling up to account limits
- **API Gateway:** Handles millions of requests
- **DynamoDB:** On-demand capacity auto-scales
- **CloudFront:** Global edge network
- **S3:** Unlimited storage and throughput

### Performance Optimizations

1. **Frontend:**
   - Code splitting with React.lazy
   - Bundle optimization
   - Image optimization
   - Lazy loading

2. **CDN:**
   - Aggressive caching for static assets
   - Brotli compression
   - Edge locations worldwide
   - Cache policies optimized per content type

3. **API:**
   - Efficient DynamoDB queries with indexes
   - Lambda function optimization
   - Connection pooling
   - Response caching where appropriate

4. **Database:**
   - Single-table design reduces queries
   - GSIs for efficient access patterns
   - Batch operations where possible
   - DynamoDB Streams for async processing

### Performance Targets

- **Page Load Time:** < 2 seconds
- **API Latency:** < 200ms (p95)
- **Content Delivery:** < 1 second to first byte
- **Availability:** 99.9% uptime

## Disaster Recovery

### Backup Strategy

- **DynamoDB:** Point-in-time recovery enabled
- **S3:** Versioning enabled on all buckets
- **Terraform State:** Backed up regularly
- **Secrets:** Stored in AWS Secrets Manager

### Recovery Procedures

1. **Infrastructure:** Redeploy with Terraform
2. **Database:** Restore from point-in-time backup
3. **Content:** Restore from S3 versioning
4. **Configuration:** Restore from Secrets Manager

## Monitoring & Alerting

### CloudWatch Dashboards

1. **Main Dashboard:**
   - Lambda metrics (invocations, errors, duration)
   - API Gateway metrics (requests, errors, latency)
   - DynamoDB metrics (capacity, errors, throttles)
   - CloudFront metrics (requests, errors, bytes)

2. **Business Metrics:**
   - Revenue trends
   - User growth
   - Content uploads
   - Purchase conversions

### Alarms

- Lambda errors > 10 in 10 minutes
- API 5XX errors > 10 in 10 minutes
- API latency > 2 seconds
- DynamoDB throttles > 5 in 10 minutes
- CloudFront 5XX error rate > 5%

All alarms send notifications to SNS topic for email alerts.

---

For more information, see:
- [Cost Estimate](./COST_ESTIMATE.md)
- [Usage & Contributing](./USAGE_AND_CONTRIBUTING.md)
- [API Documentation](./API_DOCUMENTATION.md)
