# Requirements Document

## Introduction

KaKraba is a multi-tenant serverless platform that enables creators to monetize their digital content through two distinct models: one-time purchases and subscriptions. The platform enforces strict access control rules based on content type and monetization model, with particular emphasis on differentiating between streaming and downloading capabilities. This requirements document focuses on the content access control system that manages user rights, validates access requests, and generates secure CloudFront URLs with appropriate response headers.

## Glossary

- **KaKraba Platform**: The multi-tenant serverless system built on AWS that hosts creator content
- **Content Access System**: The Lambda-based service that validates user rights and generates signed URLs
- **User**: A fan or consumer who purchases or subscribes to creator content
- **Creator**: A content producer who uploads and monetizes digital assets
- **Product**: A digital asset (audio, video, book, or art) uploaded by a creator
- **Access Right**: A DynamoDB entity representing a user's permission to access a specific product
- **One-Time Purchase**: A monetization model granting perpetual access with maximum 3 downloads and unlimited streaming
- **Subscription**: A monthly recurring monetization model granting unlimited streaming with no download capability
- **Static Content**: Books and art products that are excluded from subscription access
- **Dynamic Content**: Audio and video products that can be accessed via subscription or purchase
- **Stream Intent**: A user request to play or view content in-browser without downloading
- **Download Intent**: A user request to save content to local storage
- **Signed URL**: A time-limited CloudFront URL with cryptographic signature and response headers
- **Download Counter**: An atomic DynamoDB counter tracking remaining downloads for purchased products
- **CloudFront Signer**: AWS SDK utility for generating signed URLs with custom policy statements

## Requirements

### Requirement 1

**User Story:** As a user with a one-time purchase, I want to stream content unlimited times, so that I can enjoy my purchased content without restrictions.

#### Acceptance Criteria

1. WHEN a user requests stream access to a purchased product THEN the Content Access System SHALL validate the access right and generate a signed URL
2. WHEN generating a stream URL THEN the Content Access System SHALL set the Content-Disposition header to inline
3. WHEN a user streams purchased content THEN the Content Access System SHALL NOT decrement the download counter
4. WHEN generating a stream URL THEN the Content Access System SHALL set expiration to 15 minutes
5. WHEN a user has a valid purchase access right THEN the Content Access System SHALL allow unlimited stream requests

### Requirement 2

**User Story:** As a user with a one-time purchase, I want to download content up to 3 times, so that I can save my purchased content for offline use.

#### Acceptance Criteria

1. WHEN a user requests download access to a purchased product THEN the Content Access System SHALL check the downloads_remaining counter
2. WHEN downloads_remaining is greater than zero THEN the Content Access System SHALL decrement the counter atomically and generate a signed URL
3. WHEN downloads_remaining equals zero THEN the Content Access System SHALL return a 403 Forbidden error with message "Download limit reached"
4. WHEN generating a download URL THEN the Content Access System SHALL set the Content-Disposition header to attachment with the original filename
5. WHEN decrementing the download counter THEN the Content Access System SHALL use atomic update operations to prevent race conditions

### Requirement 3

**User Story:** As a subscriber, I want to stream dynamic content from creators I subscribe to, so that I can access their content library without individual purchases.

#### Acceptance Criteria

1. WHEN a user requests access to a product without a direct access right THEN the Content Access System SHALL check for valid subscription to the product creator
2. WHEN a user has a valid subscription and the product allows subscription access THEN the Content Access System SHALL permit stream intent only
3. WHEN a subscriber requests download intent for any product THEN the Content Access System SHALL return a 403 Forbidden error
4. WHEN a product has allow_subscription set to false THEN the Content Access System SHALL reject subscription-based access attempts
5. WHERE a product type is BOOK or ART THEN the Content Access System SHALL enforce allow_subscription as false

### Requirement 4

**User Story:** As a platform operator, I want to enforce content type restrictions on subscription access, so that static content remains purchase-only.

#### Acceptance Criteria

1. WHEN a product type is BOOK THEN the Content Access System SHALL prevent subscription-based access
2. WHEN a product type is ART THEN the Content Access System SHALL prevent subscription-based access
3. WHEN a product type is AUDIO or VIDEO THEN the Content Access System SHALL allow subscription-based access if allow_subscription is true
4. WHEN validating subscription access THEN the Content Access System SHALL verify both user subscription status and product allow_subscription flag
5. WHEN subscription access is denied due to content type THEN the Content Access System SHALL return a 403 Forbidden error with descriptive message

### Requirement 5

**User Story:** As a security-conscious platform operator, I want signed URLs to expire quickly and include appropriate headers, so that content cannot be easily shared or pirated.

#### Acceptance Criteria

1. WHEN generating any signed URL THEN the Content Access System SHALL use CloudFront private key signing
2. WHEN generating a stream URL THEN the Content Access System SHALL set expiration to 15 minutes from generation time
3. WHEN generating a download URL THEN the Content Access System SHALL set expiration to 15 minutes from generation time
4. WHEN signing a URL THEN the Content Access System SHALL include custom policy with Content-Disposition response header override
5. WHEN a signed URL expires THEN CloudFront SHALL reject access attempts with 403 Forbidden

### Requirement 6

**User Story:** As a user, I want clear error messages when access is denied, so that I understand why I cannot access content.

#### Acceptance Criteria

1. WHEN a user has no access right and no valid subscription THEN the Content Access System SHALL return a 403 Forbidden error with message "No access rights found"
2. WHEN download limit is reached THEN the Content Access System SHALL return a 403 Forbidden error with message "Download limit reached"
3. WHEN a subscriber attempts to download THEN the Content Access System SHALL return a 403 Forbidden error with message "Subscription does not allow downloads"
4. WHEN subscription access is attempted on static content THEN the Content Access System SHALL return a 403 Forbidden error with message "This content type requires purchase"
5. WHEN any validation error occurs THEN the Content Access System SHALL return appropriate HTTP status code and JSON error response

### Requirement 7

**User Story:** As a developer, I want the access control logic to query DynamoDB efficiently, so that the system performs well under load.

#### Acceptance Criteria

1. WHEN checking user access rights THEN the Content Access System SHALL use a single GetItem operation with PK and SK
2. WHEN no direct access right exists THEN the Content Access System SHALL perform a subscription validation query
3. WHEN updating download counter THEN the Content Access System SHALL use UpdateItem with atomic ADD operation
4. WHEN querying product metadata THEN the Content Access System SHALL retrieve allow_subscription and type attributes
5. WHEN multiple DynamoDB operations are required THEN the Content Access System SHALL execute them sequentially with proper error handling

### Requirement 8

**User Story:** As an API consumer, I want to send access requests with clear intent parameters, so that the system knows whether I want to stream or download.

#### Acceptance Criteria

1. WHEN the API receives a POST request to /access/generate-link THEN the Content Access System SHALL parse product_id, user_id, and intent from the request body
2. WHEN intent parameter is STREAM THEN the Content Access System SHALL validate streaming access rules
3. WHEN intent parameter is DOWNLOAD THEN the Content Access System SHALL validate download access rules and counter
4. WHEN intent parameter is missing or invalid THEN the Content Access System SHALL return a 400 Bad Request error
5. WHEN required parameters are missing THEN the Content Access System SHALL return a 400 Bad Request error with descriptive message
