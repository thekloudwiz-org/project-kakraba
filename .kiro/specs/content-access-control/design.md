# Design Document

## Overview

The Content Access Control system is a Lambda-based service that enforces KaKraba's monetization and access rules. It validates user permissions against DynamoDB access rights, differentiates between streaming and downloading intents, manages download quotas through atomic counters, and generates time-limited CloudFront signed URLs with appropriate Content-Disposition headers. The system integrates with Amazon Cognito for authentication, API Gateway for request routing, DynamoDB for access rights storage, and CloudFront for secure content delivery.

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │
│ (Web/Mobile)│
└──────┬──────┘
       │ POST /access/generate-link
       │ { product_id, user_id, intent }
       ▼
┌─────────────────────┐
│  API Gateway        │
│  (HTTP API)         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Lambda: AccessControlHandler       │
│  ┌───────────────────────────────┐  │
│  │ 1. Validate Request           │  │
│  │ 2. Check Direct Access Right  │  │
│  │ 3. Check Subscription (if no  │  │
│  │    direct right)              │  │
│  │ 4. Validate Intent Rules      │  │
│  │ 5. Update Download Counter    │  │
│  │    (if download intent)       │  │
│  │ 6. Generate Signed URL        │  │
│  └───────────────────────────────┘  │
└──────┬──────────────┬───────────────┘
       │              │
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│  DynamoDB   │  │  CloudFront  │
│ CreatorVault│  │   + S3       │
└─────────────┘  └──────────────┘
```

### Data Flow

1. **Request Validation**: Parse and validate incoming request parameters
2. **Access Right Lookup**: Query DynamoDB for user's direct access right to the product
3. **Subscription Fallback**: If no direct right exists, check for valid subscription
4. **Intent Validation**: Apply business rules based on access type and intent
5. **Counter Management**: For download intent with purchase access, atomically decrement counter
6. **URL Generation**: Create CloudFront signed URL with appropriate headers and expiration
7. **Response**: Return signed URL or error message to client

## Components and Interfaces

### 1. AccessControlHandler (Lambda Function)

**Entry Point**: `handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>`

**Responsibilities**:
- Parse and validate request body
- Orchestrate access validation logic
- Generate signed URLs
- Format responses

**Dependencies**:
- DynamoDBClient (AWS SDK v3)
- CloudFrontClient (AWS SDK v3)
- Environment variables: TABLE_NAME, CLOUDFRONT_DOMAIN, CLOUDFRONT_KEY_PAIR_ID, CLOUDFRONT_PRIVATE_KEY

### 2. AccessValidator

**Interface**:
```typescript
interface AccessValidationResult {
  allowed: boolean;
  accessType?: 'PURCHASE' | 'SUBSCRIPTION';
  downloadsRemaining?: number;
  errorMessage?: string;
}

class AccessValidator {
  async validateAccess(
    userId: string,
    productId: string,
    intent: 'STREAM' | 'DOWNLOAD'
  ): Promise<AccessValidationResult>
}
```

**Responsibilities**:
- Query DynamoDB for access rights
- Check subscription validity
- Apply business rules for intent validation
- Return structured validation result

### 3. DownloadCounterManager

**Interface**:
```typescript
class DownloadCounterManager {
  async decrementDownloadCounter(
    userId: string,
    productId: string
  ): Promise<{ success: boolean; remaining: number }>
}
```

**Responsibilities**:
- Atomically decrement downloads_remaining counter
- Handle race conditions through DynamoDB conditional updates
- Return updated counter value

### 4. SignedUrlGenerator

**Interface**:
```typescript
interface SignedUrlOptions {
  s3Key: string;
  intent: 'STREAM' | 'DOWNLOAD';
  filename: string;
  expirationMinutes: number;
}

class SignedUrlGenerator {
  generateSignedUrl(options: SignedUrlOptions): string
}
```

**Responsibilities**:
- Create CloudFront signed URLs using private key
- Set Content-Disposition header based on intent
- Configure expiration time
- Apply custom policy statements

### 5. DynamoDBRepository

**Interface**:
```typescript
interface AccessRight {
  PK: string;
  SK: string;
  access_type: 'PURCHASE' | 'SUBSCRIPTION';
  downloads_remaining: number;
  purchase_date: string;
}

interface Product {
  PK: string;
  SK: string;
  type: 'AUDIO' | 'VIDEO' | 'BOOK' | 'ART';
  allow_subscription: boolean;
  price_one_time: number;
  s3_key_source: string;
}

class DynamoDBRepository {
  async getAccessRight(userId: string, productId: string): Promise<AccessRight | null>
  async getProduct(creatorId: string, productId: string): Promise<Product | null>
  async hasValidSubscription(userId: string, creatorId: string): Promise<boolean>
  async decrementDownloads(userId: string, productId: string): Promise<number>
}
```

**Responsibilities**:
- Execute DynamoDB queries and updates
- Map DynamoDB items to domain objects
- Handle DynamoDB errors

## Data Models

### DynamoDB Entities

#### Access Right Entity
```typescript
{
  PK: "USER#<user_id>",
  SK: "RIGHT#<product_id>",
  access_type: "PURCHASE" | "SUBSCRIPTION",
  downloads_remaining: number,  // 3 for PURCHASE, 0 for SUBSCRIPTION
  purchase_date: string,        // ISO 8601 format
  creator_id: string,           // For subscription lookups
  GSI1PK: "CREATOR#<creator_id>", // For querying user's subscriptions
  GSI1SK: "USER#<user_id>"
}
```

#### Product Entity
```typescript
{
  PK: "CREATOR#<creator_id>",
  SK: "PROD#<product_id>",
  type: "AUDIO" | "VIDEO" | "BOOK" | "ART",
  allow_subscription: boolean,  // false for BOOK/ART
  price_one_time: number,
  s3_key_source: string,
  title: string,
  created_at: string
}
```

### API Request/Response Models

#### Request Body
```typescript
{
  product_id: string,
  user_id: string,
  intent: "STREAM" | "DOWNLOAD"
}
```

#### Success Response (200)
```typescript
{
  url: string,
  expires_at: string,
  access_type: "PURCHASE" | "SUBSCRIPTION",
  downloads_remaining?: number  // Only for PURCHASE access
}
```

#### Error Response (400/403)
```typescript
{
  error: string,
  message: string
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Purchase access allows unlimited streaming
*For any* user with a valid purchase access right to a product, stream requests should always succeed and generate a signed URL.
**Validates: Requirements 1.1, 1.5**

### Property 2: Stream URLs have inline Content-Disposition
*For any* stream request that generates a signed URL, the URL policy should include Content-Disposition header set to inline.
**Validates: Requirements 1.2**

### Property 3: Streaming preserves download counter
*For any* user with purchase access, making a stream request should not change the downloads_remaining counter value.
**Validates: Requirements 1.3**

### Property 4: All signed URLs expire in 15 minutes
*For any* generated signed URL (stream or download), the expiration time should be exactly 15 minutes from the generation timestamp.
**Validates: Requirements 1.4, 5.2, 5.3**

### Property 5: Download with remaining quota succeeds
*For any* user with purchase access where downloads_remaining > 0, a download request should decrement the counter by 1 and generate a signed URL.
**Validates: Requirements 2.1, 2.2**

### Property 6: Download URLs have attachment Content-Disposition
*For any* download request that generates a signed URL, the URL policy should include Content-Disposition header set to attachment with the original filename.
**Validates: Requirements 2.4**

### Property 7: Download counter updates are atomic
*For any* two concurrent download requests for the same user and product, the final downloads_remaining value should equal the initial value minus the number of successful requests (no lost updates).
**Validates: Requirements 2.5**

### Property 8: Subscription fallback when no direct access
*For any* user without a direct access right to a product, the system should check for a valid subscription to the product's creator before denying access.
**Validates: Requirements 3.1**

### Property 9: Subscription allows only streaming
*For any* user with valid subscription access to a product, stream requests should succeed but download requests should fail with 403 Forbidden.
**Validates: Requirements 3.2, 3.3**

### Property 10: Products respect subscription flag
*For any* product with allow_subscription set to false, subscription-based access attempts should be rejected with 403 Forbidden.
**Validates: Requirements 3.4**

### Property 11: Static content excludes subscriptions
*For any* product with type BOOK or ART, the allow_subscription flag should be false and subscription access should be rejected.
**Validates: Requirements 3.5, 4.1, 4.2**

### Property 12: Dynamic content allows subscriptions
*For any* product with type AUDIO or VIDEO where allow_subscription is true, users with valid subscriptions should be able to stream the content.
**Validates: Requirements 4.3**

### Property 13: All signed URLs use CloudFront signing
*For any* generated URL, it should contain a valid CloudFront signature created with the configured private key.
**Validates: Requirements 5.1**

### Property 14: Error responses have proper structure
*For any* validation error, the response should have an appropriate HTTP status code (400 or 403) and a JSON body with error and message fields.
**Validates: Requirements 6.5**

### Property 15: DynamoDB errors propagate correctly
*For any* DynamoDB operation failure, the error should be caught and transformed into an appropriate HTTP error response without exposing internal details.
**Validates: Requirements 7.5**

### Property 16: Valid requests parse successfully
*For any* request with product_id, user_id, and valid intent (STREAM or DOWNLOAD), the system should successfully parse all parameters.
**Validates: Requirements 8.1**

## Error Handling

### Error Categories

1. **Client Errors (400 Bad Request)**
   - Missing required parameters (product_id, user_id, intent)
   - Invalid intent value (not STREAM or DOWNLOAD)
   - Malformed request body

2. **Authorization Errors (403 Forbidden)**
   - No access rights found
   - Download limit reached (downloads_remaining = 0)
   - Subscription does not allow downloads
   - Static content requires purchase
   - Product does not allow subscription access

3. **Server Errors (500 Internal Server Error)**
   - DynamoDB operation failures
   - CloudFront signing failures
   - Unexpected exceptions

### Error Response Format

All errors follow a consistent JSON structure:
```typescript
{
  error: string,      // Error type (e.g., "AccessDenied", "InvalidRequest")
  message: string     // Human-readable description
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all inputs at the handler entry point before any business logic
2. **Graceful Degradation**: If subscription check fails, treat as no subscription rather than failing the request
3. **Atomic Operations**: Use DynamoDB conditional updates to prevent race conditions on counter decrements
4. **Logging**: Log all errors with context (user_id, product_id, intent) for debugging
5. **No Sensitive Data**: Never expose internal implementation details or stack traces in error responses

## Testing Strategy

### Unit Testing

The system will use **Jest** as the testing framework for TypeScript/Node.js Lambda functions.

Unit tests will cover:
- **Request parsing and validation**: Verify correct parsing of valid requests and rejection of invalid inputs
- **Error response formatting**: Ensure all error responses follow the correct JSON structure
- **Edge cases**: Test boundary conditions like downloads_remaining = 0, expired subscriptions, missing products
- **DynamoDB repository methods**: Test individual repository methods with mocked DynamoDB client
- **URL generation logic**: Verify signed URL structure and policy content

Example unit test cases:
- Parse valid request with all required fields
- Reject request with missing product_id
- Reject request with invalid intent value
- Format 403 error with correct structure
- Handle DynamoDB GetItem returning null (no access right found)

### Property-Based Testing

The system will use **fast-check** as the property-based testing library for TypeScript.

Property-based testing requirements:
- Each property test MUST run a minimum of 100 iterations
- Each property test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `// Feature: content-access-control, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

Property tests will verify:
- **Universal access rules**: Generate random users, products, and access rights to verify rules hold across all inputs
- **Counter invariants**: Verify download counter never goes negative and decrements correctly
- **URL expiration consistency**: Generate random requests and verify all URLs expire in exactly 15 minutes
- **Content-Disposition headers**: Verify stream URLs always have inline and download URLs always have attachment
- **Subscription vs purchase logic**: Generate random access scenarios and verify correct behavior
- **Static vs dynamic content rules**: Generate random products and verify subscription rules based on type
- **Concurrent access**: Generate concurrent download requests and verify atomic counter updates
- **Error consistency**: Generate invalid inputs and verify consistent error responses

Example property test:
```typescript
// Feature: content-access-control, Property 3: Streaming preserves download counter
test('streaming does not decrement download counter', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        userId: fc.uuid(),
        productId: fc.uuid(),
        downloadsRemaining: fc.integer({ min: 0, max: 3 })
      }),
      async ({ userId, productId, downloadsRemaining }) => {
        // Setup: Create purchase access right with counter
        await setupAccessRight(userId, productId, 'PURCHASE', downloadsRemaining);
        
        // Action: Make stream request
        await handler({ body: JSON.stringify({ 
          user_id: userId, 
          product_id: productId, 
          intent: 'STREAM' 
        })});
        
        // Verify: Counter unchanged
        const accessRight = await getAccessRight(userId, productId);
        expect(accessRight.downloads_remaining).toBe(downloadsRemaining);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- End-to-end flow from API Gateway event to signed URL generation
- Actual DynamoDB operations against DynamoDB Local
- CloudFront URL signing with test key pair
- Multiple sequential requests to verify state changes

### Test Data Strategy

- **Generators**: Create smart generators for users, products, and access rights that respect business constraints
- **Fixtures**: Maintain test fixtures for common scenarios (new purchase, exhausted downloads, active subscription)
- **Cleanup**: Ensure tests clean up DynamoDB test data after execution
- **Isolation**: Each test should be independent and not rely on state from other tests
