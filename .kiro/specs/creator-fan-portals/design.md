# Design Document

## Overview

The Creator-Fan Portals system is a modern web application built with React and TypeScript, providing two distinct single-page applications (SPAs): a Creator Portal for content management and a Fan Portal for content discovery and consumption. The application leverages the existing content access control backend API and extends it with additional services for user management, payment processing, and analytics. The architecture follows a serverless approach using AWS services for scalability, security, and cost-effectiveness.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                          │
│  (Static Asset Distribution + Custom Domain + SSL/TLS)         │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             │                                │
    ┌────────▼────────┐              ┌───────▼────────┐
    │  Creator Portal │              │   Fan Portal   │
    │   (React SPA)   │              │  (React SPA)   │
    │   S3 + CloudFront│              │ S3 + CloudFront│
    └────────┬────────┘              └───────┬────────┘
             │                                │
             └────────────┬───────────────────┘
                          │
                 ┌────────▼─────────┐
                 │   API Gateway    │
                 │ (Custom Domain)  │
                 └────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐
   │ Access   │    │   User     │   │  Payment   │
   │ Control  │    │ Management │   │  Service   │
   │ Lambda   │    │  Lambda    │   │  Lambda    │
   └────┬─────┘    └─────┬──────┘   └─────┬──────┘
        │                │                 │
        │         ┌──────▼──────┐          │
        │         │  Cognito    │          │
        │         │ User Pools  │          │
        │         └─────────────┘          │
        │                                  │
        └──────────┬───────────────────────┘
                   │
            ┌──────▼───────┐
            │  DynamoDB    │
            │   Tables     │
            └──────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling and development server
- React Router for client-side routing
- TanStack Query (React Query) for server state management
- Zustand for client state management
- AWS Amplify for Cognito authentication
- Stripe.js for payment processing
- Tailwind CSS for styling
- Radix UI for accessible component primitives
- React Hook Form for form management
- Zod for schema validation

**Backend:**
- AWS Lambda (Node.js 20.x runtime)
- API Gateway HTTP API
- DynamoDB for data persistence
- Cognito for authentication
- S3 for content and static asset storage
- CloudFront for content delivery
- Secrets Manager for sensitive configuration
- Stripe API for payment processing

**Infrastructure:**
- Terraform for infrastructure as code
- GitHub Actions for CI/CD
- CloudWatch for logging and monitoring

## Components and Interfaces

### Frontend Components

#### Landing Page Components

**1. Hero Section**
- `HeroSection`: Main hero with platform branding and tagline
- `CTAButtons`: Two prominent buttons for Creator and Fan portals
- `ValueProposition`: Brief description of platform benefits

**2. Feature Sections**
- `CreatorFeatures`: Section highlighting creator benefits with hero message "Your Fans Are Waiting - Upload Your Content Now"
- `FanFeatures`: Section highlighting fan benefits with hero message "Own It How You Want It - Discover Amazing Creators and Get Started"
- `FeatureCard`: Reusable card for displaying individual features
- `TestimonialSection`: Social proof from creators and fans

**3. Footer Section**
- `LandingFooter`: Footer with links to about, contact, terms, and privacy

#### Creator Portal Components

**1. Authentication Components**
- `LoginForm`: Email/password login with Cognito integration
- `RegisterForm`: New creator registration with email verification
- `PasswordResetForm`: Forgot password flow
- `EmailVerification`: Email verification confirmation page

**2. Dashboard Components**
- `DashboardOverview`: Key metrics cards (revenue, subscribers, views)
- `RevenueChart`: Time-series chart for revenue analytics
- `ContentPerformanceTable`: Table showing content metrics
- `RecentActivity`: List of recent transactions and events

**3. Content Management Components**
- `ContentUploader`: Drag-and-drop file upload with progress
- `ContentLibrary`: Grid/list view of all content items
- `ContentEditor`: Form for editing content metadata
- `ContentPreview`: Preview modal for content items

**4. Product Management Components**
- `ProductCreator`: Multi-step form for creating products
- `ProductCatalog`: Grid view of all products
- `ProductEditor`: Form for editing product details
- `PricingConfigurator`: UI for setting pricing and access rules

**5. Analytics Components**
- `AnalyticsDashboard`: Comprehensive analytics view
- `MetricsCard`: Reusable card for displaying single metrics
- `ChartContainer`: Wrapper for chart visualizations
- `ExportButton`: Button to export analytics data

#### Fan Portal Components

**1. Authentication Components**
- `LoginForm`: Email/password login
- `RegisterForm`: New fan registration
- `PasswordResetForm`: Forgot password flow

**2. Discovery Components**
- `DiscoveryFeed`: Grid of featured and trending content
- `SearchBar`: Search input with autocomplete
- `FilterPanel`: Sidebar with filter options
- `CreatorCard`: Card displaying creator information
- `ProductCard`: Card displaying product information

**3. Content Consumption Components**
- `MediaPlayer`: Video/audio player with controls
- `DownloadButton`: Button to initiate content download
- `ContentLibrary`: Grid of accessible content
- `AccessIndicator`: Badge showing access type and quota

**4. Purchase Components**
- `CheckoutForm`: Payment form with Stripe Elements
- `PurchaseConfirmation`: Success page after purchase
- `PurchaseHistory`: Table of past transactions
- `SubscriptionCard`: Card displaying subscription details

**5. Profile Components**
- `ProfileEditor`: Form for editing profile information
- `SubscriptionManager`: UI for managing subscriptions
- `NotificationSettings`: Form for notification preferences

### Shared Components

**1. Layout Components**
- `AppShell`: Main layout with header, sidebar, and content area
- `Header`: Top navigation bar with user menu
- `Sidebar`: Side navigation menu
- `Footer`: Footer with links and copyright

**2. UI Components**
- `Button`: Styled button with variants
- `Input`: Form input with validation
- `Select`: Dropdown select component
- `Modal`: Accessible modal dialog
- `Toast`: Notification toast component
- `Card`: Container card component
- `Badge`: Status badge component
- `Spinner`: Loading spinner
- `ErrorBoundary`: Error boundary for graceful error handling

### Backend Services

#### 1. Access Control Service (Existing)
- **Endpoint**: `POST /access/generate-link`
- **Function**: Generate signed URLs for content access
- **Input**: `{ product_id, user_id, intent }`
- **Output**: `{ url, expires_at, access_type, downloads_remaining }`

#### 2. User Management Service (New)
- **Endpoints**:
  - `GET /users/profile` - Get user profile
  - `PUT /users/profile` - Update user profile
  - `GET /users/{userId}/content` - Get user's content library
  - `GET /users/{userId}/purchases` - Get purchase history
  - `GET /users/{userId}/subscriptions` - Get active subscriptions

#### 3. Content Management Service (New)
- **Endpoints**:
  - `POST /content/upload-url` - Get presigned S3 upload URL
  - `POST /content` - Create content record after upload
  - `GET /content` - List content items (with pagination)
  - `GET /content/{contentId}` - Get content details
  - `PUT /content/{contentId}` - Update content metadata
  - `DELETE /content/{contentId}` - Delete content item

#### 4. Product Management Service (New)
- **Endpoints**:
  - `POST /products` - Create new product
  - `GET /products` - List products (with filters)
  - `GET /products/{productId}` - Get product details
  - `PUT /products/{productId}` - Update product
  - `DELETE /products/{productId}` - Delete product

#### 5. Payment Service (New)
- **Endpoints**:
  - `POST /payments/create-intent` - Create Stripe payment intent
  - `POST /payments/confirm` - Confirm payment and create access right
  - `POST /subscriptions/create` - Create subscription
  - `POST /subscriptions/{subscriptionId}/cancel` - Cancel subscription
  - `POST /webhooks/stripe` - Handle Stripe webhooks

#### 6. Analytics Service (New)
- **Endpoints**:
  - `GET /analytics/dashboard` - Get dashboard metrics
  - `GET /analytics/revenue` - Get revenue analytics
  - `GET /analytics/content` - Get content performance
  - `GET /analytics/fans` - Get fan engagement metrics
  - `GET /analytics/export` - Export analytics data

## Data Models

### DynamoDB Table Design

The application uses a single-table design pattern with the following access patterns:

**Table Name**: `CreatorVault`

**Primary Key**:
- `PK` (Partition Key): String
- `SK` (Sort Key): String

**Global Secondary Indexes**:
- `GSI1`: `GSI1PK` (Partition Key), `GSI1SK` (Sort Key)
- `GSI2`: `GSI2PK` (Partition Key), `GSI2SK` (Sort Key)

### Entity Types

#### User Entity
```typescript
{
  PK: "USER#<userId>",
  SK: "PROFILE",
  userId: string,
  email: string,
  displayName: string,
  bio?: string,
  profileImageUrl?: string,
  userType: "CREATOR" | "FAN",
  createdAt: string,
  updatedAt: string,
  
  // GSI1 for querying users by email
  GSI1PK: "USER",
  GSI1SK: email
}
```

#### Content Entity
```typescript
{
  PK: "CREATOR#<creatorId>",
  SK: "CONTENT#<contentId>",
  contentId: string,
  creatorId: string,
  title: string,
  description: string,
  contentType: "AUDIO" | "VIDEO" | "PDF" | "IMAGE",
  s3Key: string,
  s3Bucket: string,
  fileSize: number,
  duration?: number,
  thumbnailUrl?: string,
  uploadedAt: string,
  updatedAt: string,
  
  // GSI1 for querying all content
  GSI1PK: "CONTENT",
  GSI1SK: uploadedAt
}
```

#### Product Entity
```typescript
{
  PK: "CREATOR#<creatorId>",
  SK: "PRODUCT#<productId>",
  productId: string,
  creatorId: string,
  title: string,
  description: string,
  price: number,
  currency: "USD",
  contentIds: string[],
  accessType: "PURCHASE" | "RENTAL",
  downloadQuota?: number,
  allowSubscription: boolean,
  productType: "SINGLE" | "BUNDLE",
  isActive: boolean,
  createdAt: string,
  updatedAt: string,
  
  // GSI1 for querying all products
  GSI1PK: "PRODUCT",
  GSI1SK: createdAt,
  
  // GSI2 for querying products by price
  GSI2PK: "PRODUCT",
  GSI2SK: price
}
```

#### Access Right Entity (Existing)
```typescript
{
  PK: "USER#<userId>",
  SK: "ACCESS#<productId>",
  userId: string,
  productId: string,
  creatorId: string,
  accessType: "PURCHASE" | "SUBSCRIPTION",
  downloadsRemaining?: number,
  purchaseDate: string,
  expiresAt?: string,
  
  // GSI1 for subscription queries
  GSI1PK: "SUBSCRIPTION#<userId>#<creatorId>",
  GSI1SK: expiresAt
}
```

#### Transaction Entity
```typescript
{
  PK: "USER#<userId>",
  SK: "TRANSACTION#<transactionId>",
  transactionId: string,
  userId: string,
  creatorId: string,
  productId: string,
  amount: number,
  currency: "USD",
  paymentMethod: "CARD",
  stripePaymentIntentId: string,
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
  transactionType: "PURCHASE" | "SUBSCRIPTION",
  createdAt: string,
  
  // GSI1 for querying transactions by creator
  GSI1PK: "CREATOR#<creatorId>",
  GSI1SK: createdAt
}
```

#### Subscription Entity
```typescript
{
  PK: "USER#<userId>",
  SK: "SUBSCRIPTION#<subscriptionId>",
  subscriptionId: string,
  userId: string,
  creatorId: string,
  stripeSubscriptionId: string,
  status: "ACTIVE" | "CANCELED" | "PAST_DUE",
  currentPeriodStart: string,
  currentPeriodEnd: string,
  cancelAtPeriodEnd: boolean,
  createdAt: string,
  updatedAt: string,
  
  // GSI1 for querying subscriptions by creator
  GSI1PK: "CREATOR#<creatorId>",
  GSI1SK: currentPeriodEnd
}
```

#### Analytics Entity
```typescript
{
  PK: "ANALYTICS#<creatorId>",
  SK: "DAILY#<date>",
  creatorId: string,
  date: string,
  revenue: number,
  newFans: number,
  activeSubscribers: number,
  contentViews: number,
  contentDownloads: number,
  
  // GSI1 for time-range queries
  GSI1PK: "ANALYTICS#<creatorId>",
  GSI1SK: date
}
```

## Error Handling

### Frontend Error Handling

**1. Network Errors**
- Display toast notification with retry option
- Implement exponential backoff for retries
- Show offline indicator when network is unavailable

**2. Authentication Errors**
- Redirect to login page on 401 Unauthorized
- Refresh tokens automatically before expiration
- Clear session and redirect on token refresh failure

**3. Validation Errors**
- Display inline error messages on form fields
- Highlight invalid fields with red border
- Prevent form submission until all errors are resolved

**4. Payment Errors**
- Display specific error messages from Stripe
- Allow users to retry with different payment method
- Log payment failures for support investigation

**5. Content Upload Errors**
- Display upload progress with error state
- Allow retry for failed uploads
- Validate file type and size before upload

### Backend Error Handling

**1. Lambda Error Responses**
```typescript
{
  statusCode: number,
  body: {
    error: string,
    message: string,
    details?: any
  }
}
```

**2. Error Types**
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server error

**3. Error Logging**
- Log all errors to CloudWatch with context
- Include request ID for tracing
- Sanitize sensitive data before logging

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
- Test React components with React Testing Library
- Test custom hooks with @testing-library/react-hooks
- Test utility functions with Jest
- Test form validation with Zod schemas
- Mock API calls with MSW (Mock Service Worker)
- Target 80% code coverage

**Backend Unit Tests:**
- Test Lambda handlers with mocked AWS SDK
- Test business logic functions in isolation
- Test DynamoDB repository methods
- Test Stripe integration with test mode
- Mock external dependencies
- Target 80% code coverage

### Integration Testing

**Frontend Integration Tests:**
- Test user flows with Playwright or Cypress
- Test authentication flow end-to-end
- Test content upload and management flow
- Test purchase and payment flow
- Test content access and consumption flow

**Backend Integration Tests:**
- Test API endpoints with real DynamoDB Local
- Test Cognito integration with test user pool
- Test S3 upload with LocalStack
- Test Stripe webhooks with Stripe CLI

### Property-Based Testing

Property-based tests will be implemented for critical business logic using fast-check library.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Landing Page Properties

**Property 0: Creator button redirects to creator portal**
*For any* click on the "I'm a Creator" button, the system should redirect to create-kakraba.thekloudwiz.com.
**Validates: Requirements 0.3**

**Property 0.1: Fan button redirects to fan portal**
*For any* click on the "I'm a Fan" button, the system should redirect to fan-kakraba.thekloudwiz.com.
**Validates: Requirements 0.4**

### Authentication and User Management Properties

**Property 1: Valid registration creates Cognito account**
*For any* valid registration data (email, password, display name), submitting the registration form should result in a Cognito user account being created and redirection to email verification.
**Validates: Requirements 1.2, 5.2**

**Property 2: Valid credentials establish session**
*For any* valid user credentials, successful authentication should establish a session with a valid JWT token stored securely.
**Validates: Requirements 1.4, 5.4**

**Property 3: Profile updates persist to database**
*For any* profile update (display name, bio, profile image), saving changes should persist the data to DynamoDB and return a success confirmation.
**Validates: Requirements 1.6, 5.6**

**Property 4: Password reset initiates Cognito flow**
*For any* registered user email, requesting password reset should initiate the Cognito password reset flow and send a verification email.
**Validates: Requirements 1.7**

### Content Management Properties

**Property 5: File validation before upload**
*For any* file selected for upload, the system should validate file type and size before initiating S3 upload, rejecting invalid files.
**Validates: Requirements 2.2**

**Property 6: Upload generates unique content ID**
*For any* completed file upload, the system should generate a unique content ID that differs from all existing content IDs.
**Validates: Requirements 2.3**

**Property 7: Upload creates complete database record**
*For any* completed upload, the system should create a DynamoDB record containing all required metadata fields (title, description, file type, S3 key).
**Validates: Requirements 2.4**

**Property 8: Content library displays all items**
*For any* creator's content library, the display should include all uploaded content items with their thumbnails, titles, and upload dates.
**Validates: Requirements 2.5**

**Property 9: Content metadata updates persist**
*For any* content metadata update, the changes should persist to DynamoDB and the display should refresh to show updated information.
**Validates: Requirements 2.7**

**Property 10: Content deletion removes all references**
*For any* content item deletion, the system should remove the DynamoDB record and mark the S3 object for deletion.
**Validates: Requirements 2.8**

### Product Management Properties

**Property 11: Content selection supports single and multiple**
*For any* product creation, the system should allow selection of either a single content item or multiple content items for bundles.
**Validates: Requirements 3.2**

**Property 12: Price validation enforces limits**
*For any* product price input, the system should validate that the price is within minimum and maximum allowed values.
**Validates: Requirements 3.3**

**Property 13: Subscription flag configures access**
*For any* product with subscription access enabled, the product should be marked as eligible for subscription-based access in the database.
**Validates: Requirements 3.5**

**Property 14: Product save creates complete record**
*For any* product configuration, saving should create a DynamoDB record with all configuration details (pricing, access rules, content IDs).
**Validates: Requirements 3.6**

**Property 15: Product catalog displays all products**
*For any* creator's product catalog, the display should include all products with their pricing, access type, and sales metrics.
**Validates: Requirements 3.7**

**Property 16: Product edits maintain version history**
*For any* product edit, the system should update the DynamoDB record and maintain a version history of changes.
**Validates: Requirements 3.8**

### Analytics Properties

**Property 17: Revenue analytics display trends**
*For any* revenue data, the analytics view should display charts showing trends over time with daily, weekly, and monthly aggregations.
**Validates: Requirements 4.2**

**Property 18: Content performance shows all metrics**
*For any* content item, the performance view should display views, downloads, and revenue generated.
**Validates: Requirements 4.3**

**Property 19: Fan engagement displays statistics**
*For any* creator, the engagement view should display active fans, new fans, and subscription retention statistics.
**Validates: Requirements 4.4**

**Property 20: Time range filters all analytics**
*For any* time range selection, all analytics data should be filtered to show only data within the selected period.
**Validates: Requirements 4.5**

**Property 21: Analytics export generates CSV**
*For any* analytics export request, the system should generate a CSV file containing all detailed metrics.
**Validates: Requirements 4.6**

### Content Discovery Properties

**Property 22: Search returns matching results**
*For any* search query, the system should query DynamoDB and return all products and creators that match the search terms.
**Validates: Requirements 6.2**

**Property 23: Filters apply correctly**
*For any* combination of filters (content type, price range, creator), the system should return only products matching all selected filters.
**Validates: Requirements 6.3**

**Property 24: Creator profile displays complete information**
*For any* creator profile view, the system should display the creator's bio, content library, and subscription options.
**Validates: Requirements 6.4**

**Property 25: Product view displays all details**
*For any* product view, the system should display product details, pricing, preview content, and purchase options.
**Validates: Requirements 6.5**

**Property 26: Reviews display for all products**
*For any* product with reviews, the system should display ratings and reviews from other fans.
**Validates: Requirements 6.6**

### Payment and Purchase Properties

**Property 27: Checkout displays product details**
*For any* product selected for purchase, the checkout page should display complete product details and a payment form.
**Validates: Requirements 7.1**

**Property 28: Payment validation processes correctly**
*For any* payment information submitted, the system should validate card details and process payment via Stripe.
**Validates: Requirements 7.2**

**Property 29: Successful payment creates access right**
*For any* successful payment, the system should create an access right record in DynamoDB and display a purchase confirmation.
**Validates: Requirements 7.3**

**Property 30: Failed payment allows retry**
*For any* failed payment, the system should display an error message and allow the user to retry with different payment information.
**Validates: Requirements 7.4**

**Property 31: Subscription purchase creates recurring schedule**
*For any* subscription purchase, the system should create a recurring payment schedule via Stripe and grant immediate access.
**Validates: Requirements 7.5**

**Property 32: Purchase history displays all transactions**
*For any* fan, the purchase history should display all transactions with dates, amounts, and product details.
**Validates: Requirements 7.6**

### Content Access Properties

**Property 33: Library displays all accessible content**
*For any* fan, their library should display all content items they have access to via purchase or subscription.
**Validates: Requirements 8.1**

**Property 34: Stream request returns signed URL**
*For any* content item selected for streaming, the system should call the access control API with STREAM intent and receive a signed URL.
**Validates: Requirements 8.2**

**Property 35: Streaming URL loads in player**
*For any* streaming URL received, the system should embed a media player and load the content for playback.
**Validates: Requirements 8.3**

**Property 36: Download request returns signed URL**
*For any* content item selected for download, the system should call the access control API with DOWNLOAD intent and receive a signed URL.
**Validates: Requirements 8.4**

**Property 37: Download URL initiates file download**
*For any* download URL received, the system should initiate file download with the appropriate filename.
**Validates: Requirements 8.5**

**Property 38: Download quota prevents exhausted downloads**
*For any* download attempt, the system should display remaining download quota and prevent downloads when quota is exhausted.
**Validates: Requirements 8.6**

**Property 39: Streaming preserves download quota**
*For any* streaming action, the system should not decrement the download quota.
**Validates: Requirements 8.7**

### Subscription Management Properties

**Property 40: Subscription view displays all active subscriptions**
*For any* fan, the subscription view should display all active subscriptions with creator names, renewal dates, and pricing.
**Validates: Requirements 9.1**

**Property 41: Subscription cancellation maintains access**
*For any* subscription cancellation, the system should update Stripe to stop recurring payments and maintain access until the current period ends.
**Validates: Requirements 9.2**

**Property 42: Subscription renewal extends access**
*For any* subscription renewal, the system should process payment via Stripe and extend the access period.
**Validates: Requirements 9.3**

**Property 43: Failed renewal notifies fan**
*For any* failed subscription payment, the system should notify the fan and provide options to update payment information.
**Validates: Requirements 9.4**

**Property 44: Payment method update persists to Stripe**
*For any* subscription payment method update, the system should update the payment method in Stripe.
**Validates: Requirements 9.5**

### Accessibility Properties

**Property 45: Keyboard navigation works on all pages**
*For any* page in the application, users should be able to navigate all interactive elements using only the keyboard with visible focus indicators.
**Validates: Requirements 10.2**

**Property 46: ARIA labels exist for interactive elements**
*For any* interactive element, the system should provide appropriate ARIA labels and semantic HTML for screen reader compatibility.
**Validates: Requirements 10.3**

**Property 47: Form errors provide clear feedback**
*For any* invalid form input, the system should provide clear error messages and validation feedback.
**Validates: Requirements 10.5**

### Security Properties

**Property 48: Authentication uses secure token storage**
*For any* successful authentication, the system should store JWT tokens in httpOnly cookies with secure flags.
**Validates: Requirements 11.2**

**Property 49: File uploads validate and scan**
*For any* content upload, the system should validate file types and scan for malware before storing in S3.
**Validates: Requirements 11.3**

**Property 50: Content URLs expire in 15 minutes**
*For any* content access, the system should generate signed URLs that expire exactly 15 minutes from generation time.
**Validates: Requirements 11.4**

**Property 51: Session expiration triggers logout**
*For any* expired session, the system should automatically log out the user and redirect to the login page.
**Validates: Requirements 11.5**

**Property 52: Data deletion removes all personal data**
*For any* data deletion request, the system should remove all personal data associated with the user from all storage systems.
**Validates: Requirements 11.6**

### Performance Properties

**Property 53: DynamoDB queries use indexes**
*For any* DynamoDB query, the system should use appropriate indexes to ensure efficient data retrieval.
**Validates: Requirements 12.3**


## API Specifications

### Authentication Endpoints

**POST /auth/register**
- **Description**: Register a new user (creator or fan)
- **Request Body**:
```typescript
{
  email: string,
  password: string,
  displayName: string,
  userType: "CREATOR" | "FAN",
  bio?: string
}
```
- **Response**: `{ userId: string, message: string }`
- **Errors**: 400 (invalid input), 409 (email exists)

**POST /auth/login**
- **Description**: Authenticate user and return JWT token
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, userId: string, userType: string }`
- **Errors**: 401 (invalid credentials)

**POST /auth/verify-email**
- **Description**: Verify user email with confirmation code
- **Request Body**: `{ email: string, code: string }`
- **Response**: `{ message: string }`
- **Errors**: 400 (invalid code)

**POST /auth/reset-password**
- **Description**: Initiate password reset flow
- **Request Body**: `{ email: string }`
- **Response**: `{ message: string }`
- **Errors**: 404 (user not found)

### User Management Endpoints

**GET /users/profile**
- **Description**: Get current user's profile
- **Authorization**: Required (JWT)
- **Response**: User profile object
- **Errors**: 401 (unauthorized)

**PUT /users/profile**
- **Description**: Update user profile
- **Authorization**: Required (JWT)
- **Request Body**: Partial user profile object
- **Response**: Updated user profile
- **Errors**: 400 (invalid input), 401 (unauthorized)

**GET /users/{userId}/content**
- **Description**: Get user's content library
- **Authorization**: Required (JWT)
- **Query Parameters**: `page`, `limit`, `contentType`
- **Response**: Paginated list of content items
- **Errors**: 401 (unauthorized), 403 (forbidden)

**GET /users/{userId}/purchases**
- **Description**: Get user's purchase history
- **Authorization**: Required (JWT)
- **Query Parameters**: `page`, `limit`
- **Response**: Paginated list of transactions
- **Errors**: 401 (unauthorized), 403 (forbidden)

**GET /users/{userId}/subscriptions**
- **Description**: Get user's active subscriptions
- **Authorization**: Required (JWT)
- **Response**: List of subscription objects
- **Errors**: 401 (unauthorized), 403 (forbidden)

### Content Management Endpoints

**POST /content/upload-url**
- **Description**: Get presigned S3 URL for content upload
- **Authorization**: Required (JWT, creator only)
- **Request Body**: `{ filename: string, contentType: string, fileSize: number }`
- **Response**: `{ uploadUrl: string, contentId: string, s3Key: string }`
- **Errors**: 400 (invalid file), 401 (unauthorized), 403 (not creator)

**POST /content**
- **Description**: Create content record after successful upload
- **Authorization**: Required (JWT, creator only)
- **Request Body**:
```typescript
{
  contentId: string,
  title: string,
  description: string,
  contentType: string,
  s3Key: string,
  fileSize: number,
  duration?: number,
  thumbnailUrl?: string
}
```
- **Response**: Content object
- **Errors**: 400 (invalid input), 401 (unauthorized)

**GET /content**
- **Description**: List content items with filters
- **Authorization**: Required (JWT)
- **Query Parameters**: `creatorId`, `contentType`, `page`, `limit`
- **Response**: Paginated list of content items
- **Errors**: 401 (unauthorized)

**GET /content/{contentId}**
- **Description**: Get content details
- **Authorization**: Required (JWT)
- **Response**: Content object
- **Errors**: 401 (unauthorized), 404 (not found)

**PUT /content/{contentId}**
- **Description**: Update content metadata
- **Authorization**: Required (JWT, owner only)
- **Request Body**: Partial content object
- **Response**: Updated content object
- **Errors**: 400 (invalid input), 401 (unauthorized), 403 (forbidden)

**DELETE /content/{contentId}**
- **Description**: Delete content item
- **Authorization**: Required (JWT, owner only)
- **Response**: `{ message: string }`
- **Errors**: 401 (unauthorized), 403 (forbidden), 404 (not found)

### Product Management Endpoints

**POST /products**
- **Description**: Create new product
- **Authorization**: Required (JWT, creator only)
- **Request Body**:
```typescript
{
  title: string,
  description: string,
  price: number,
  contentIds: string[],
  accessType: "PURCHASE" | "RENTAL",
  downloadQuota?: number,
  allowSubscription: boolean,
  productType: "SINGLE" | "BUNDLE"
}
```
- **Response**: Product object
- **Errors**: 400 (invalid input), 401 (unauthorized)

**GET /products**
- **Description**: List products with filters
- **Authorization**: Optional (JWT)
- **Query Parameters**: `creatorId`, `minPrice`, `maxPrice`, `productType`, `page`, `limit`
- **Response**: Paginated list of products
- **Errors**: None

**GET /products/{productId}**
- **Description**: Get product details
- **Authorization**: Optional (JWT)
- **Response**: Product object with content details
- **Errors**: 404 (not found)

**PUT /products/{productId}**
- **Description**: Update product
- **Authorization**: Required (JWT, owner only)
- **Request Body**: Partial product object
- **Response**: Updated product object
- **Errors**: 400 (invalid input), 401 (unauthorized), 403 (forbidden)

**DELETE /products/{productId}**
- **Description**: Delete product
- **Authorization**: Required (JWT, owner only)
- **Response**: `{ message: string }`
- **Errors**: 401 (unauthorized), 403 (forbidden), 404 (not found)

### Payment Endpoints

**POST /payments/create-intent**
- **Description**: Create Stripe payment intent for product purchase
- **Authorization**: Required (JWT)
- **Request Body**: `{ productId: string }`
- **Response**: `{ clientSecret: string, amount: number }`
- **Errors**: 400 (invalid product), 401 (unauthorized)

**POST /payments/confirm**
- **Description**: Confirm payment and create access right
- **Authorization**: Required (JWT)
- **Request Body**: `{ paymentIntentId: string, productId: string }`
- **Response**: `{ accessRight: object, transaction: object }`
- **Errors**: 400 (payment failed), 401 (unauthorized)

**POST /subscriptions/create**
- **Description**: Create subscription for creator
- **Authorization**: Required (JWT)
- **Request Body**: `{ creatorId: string, paymentMethodId: string }`
- **Response**: Subscription object
- **Errors**: 400 (invalid input), 401 (unauthorized)

**POST /subscriptions/{subscriptionId}/cancel**
- **Description**: Cancel subscription
- **Authorization**: Required (JWT, owner only)
- **Response**: Updated subscription object
- **Errors**: 401 (unauthorized), 403 (forbidden), 404 (not found)

**POST /webhooks/stripe**
- **Description**: Handle Stripe webhook events
- **Authorization**: Stripe signature verification
- **Request Body**: Stripe event object
- **Response**: `{ received: true }`
- **Errors**: 400 (invalid signature)

### Analytics Endpoints

**GET /analytics/dashboard**
- **Description**: Get dashboard metrics for creator
- **Authorization**: Required (JWT, creator only)
- **Query Parameters**: `startDate`, `endDate`
- **Response**:
```typescript
{
  totalRevenue: number,
  activeSubscribers: number,
  contentViews: number,
  newFans: number
}
```
- **Errors**: 401 (unauthorized), 403 (not creator)

**GET /analytics/revenue**
- **Description**: Get revenue analytics with time series
- **Authorization**: Required (JWT, creator only)
- **Query Parameters**: `startDate`, `endDate`, `granularity` (daily/weekly/monthly)
- **Response**: Array of revenue data points
- **Errors**: 401 (unauthorized), 403 (not creator)

**GET /analytics/content**
- **Description**: Get content performance metrics
- **Authorization**: Required (JWT, creator only)
- **Query Parameters**: `startDate`, `endDate`
- **Response**: Array of content performance objects
- **Errors**: 401 (unauthorized), 403 (not creator)

**GET /analytics/fans**
- **Description**: Get fan engagement metrics
- **Authorization**: Required (JWT, creator only)
- **Query Parameters**: `startDate`, `endDate`
- **Response**: Fan engagement statistics
- **Errors**: 401 (unauthorized), 403 (not creator)

**GET /analytics/export**
- **Description**: Export analytics data as CSV
- **Authorization**: Required (JWT, creator only)
- **Query Parameters**: `startDate`, `endDate`, `type` (revenue/content/fans)
- **Response**: CSV file download
- **Errors**: 401 (unauthorized), 403 (not creator)

## Infrastructure Architecture

### Frontend Hosting

**S3 + CloudFront Setup:**
- Three separate S3 buckets for Landing Page, Creator Portal, and Fan Portal
- CloudFront distributions for each site with custom domains
- SSL/TLS certificates via ACM for all three domains
- Automatic cache invalidation on deployment
- Gzip compression for static assets
- Security headers (CSP, HSTS, X-Frame-Options)

**Custom Domains:**
- Landing Page: `kakraba.thekloudwiz.com`
- Creator Portal: `create-kakraba.thekloudwiz.com`
- Fan Portal: `fan-kakraba.thekloudwiz.com`

### Backend Services

**API Gateway:**
- HTTP API with custom domain: `api.kakraba.com`
- Cognito authorizer for protected endpoints
- CORS configuration for frontend domains
- Request validation
- Rate limiting and throttling

**Lambda Functions:**
- Node.js 20.x runtime
- Environment variables for configuration
- VPC integration if needed for RDS
- X-Ray tracing enabled
- CloudWatch Logs for monitoring
- Reserved concurrency for critical functions

**DynamoDB:**
- Single table design with GSIs
- On-demand billing mode
- Point-in-time recovery enabled
- Encryption at rest
- DynamoDB Streams for analytics

**S3 Buckets:**
- Content bucket with versioning
- Lifecycle policies for old versions
- Server-side encryption (SSE-S3)
- Block public access
- CloudFront OAI for access control

**Cognito:**
- User pool for authentication
- User pool client for each portal
- Password policy enforcement
- MFA optional
- Email verification required
- Custom attributes for user type

**Secrets Manager:**
- CloudFront private key
- Stripe API keys
- Database credentials (if needed)
- Automatic rotation where applicable

### CI/CD Pipeline

**GitHub Actions Workflow:**
1. **Build Stage:**
   - Install dependencies
   - Run linting and type checking
   - Run unit tests
   - Build frontend applications
   - Build Lambda functions

2. **Test Stage:**
   - Run integration tests
   - Run property-based tests
   - Generate coverage reports

3. **Deploy Stage:**
   - Deploy infrastructure with Terraform
   - Upload Lambda packages
   - Upload frontend builds to S3
   - Invalidate CloudFront caches
   - Run smoke tests

### Monitoring and Observability

**CloudWatch:**
- Lambda function logs and metrics
- API Gateway access logs
- Custom metrics for business KPIs
- Alarms for error rates and latency

**X-Ray:**
- Distributed tracing for API requests
- Service map visualization
- Performance insights

**CloudWatch Dashboards:**
- Real-time metrics dashboard
- Error tracking dashboard
- Business metrics dashboard

## Security Considerations

### Authentication and Authorization

- JWT tokens with short expiration (1 hour)
- Refresh tokens with longer expiration (7 days)
- Token rotation on refresh
- Secure token storage in httpOnly cookies
- CSRF protection with SameSite cookies
- Role-based access control (creator vs fan)

### Data Protection

- Encryption in transit (TLS 1.3)
- Encryption at rest (S3, DynamoDB)
- Signed URLs for content access
- Input validation and sanitization
- SQL injection prevention (using DynamoDB)
- XSS prevention (React escaping)

### Payment Security

- PCI DSS compliance via Stripe
- No storage of card details
- Stripe Elements for secure input
- Webhook signature verification
- Idempotency keys for payments

### Content Security

- File type validation
- File size limits
- Malware scanning (ClamAV or AWS GuardDuty)
- Content moderation (manual or automated)
- DMCA compliance procedures

## Deployment Strategy

### Environment Setup

**Development Environment:**
- Local development with Vite dev server
- DynamoDB Local for testing
- LocalStack for AWS services
- Stripe test mode

**Staging Environment:**
- Full AWS infrastructure
- Separate Cognito user pool
- Stripe test mode
- Automated deployments from `develop` branch

**Production Environment:**
- Full AWS infrastructure
- Production Cognito user pool
- Stripe live mode
- Manual approval for deployments from `main` branch

### Deployment Process

1. **Infrastructure Deployment:**
   - Run Terraform plan
   - Review changes
   - Apply infrastructure changes
   - Verify resources created

2. **Backend Deployment:**
   - Build Lambda packages
   - Upload to S3
   - Update Lambda function code
   - Run smoke tests

3. **Frontend Deployment:**
   - Build React applications
   - Upload to S3
   - Invalidate CloudFront cache
   - Verify deployment

4. **Database Migrations:**
   - Run migration scripts if needed
   - Verify data integrity
   - Rollback plan ready

### Rollback Strategy

- Keep previous Lambda versions
- S3 versioning for frontend builds
- Terraform state backups
- Database backups before migrations
- Blue-green deployment for zero downtime

## Testing Strategy (Continued)

### Unit Testing Framework

**Frontend:**
- Jest as test runner
- React Testing Library for component tests
- MSW for API mocking
- fast-check for property-based tests
- Coverage threshold: 80%

**Backend:**
- Jest as test runner
- AWS SDK mocks
- DynamoDB Local for integration tests
- fast-check for property-based tests
- Coverage threshold: 80%

### Property-Based Testing Configuration

- Minimum 100 iterations per property test
- Shrinking enabled for failure cases
- Seed-based reproducibility
- Custom generators for domain objects
- Property test tagging format: `**Feature: creator-fan-portals, Property {number}: {property_text}**`

### End-to-End Testing

**Playwright Tests:**
- User registration and login flows
- Content upload and management flows
- Product creation and purchase flows
- Content access and consumption flows
- Subscription management flows
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing

### Performance Testing

**Load Testing:**
- Artillery or k6 for load testing
- Test scenarios for peak traffic
- Concurrent user simulations
- API endpoint stress testing
- Database query performance

**Frontend Performance:**
- Lighthouse CI for performance metrics
- Core Web Vitals monitoring
- Bundle size analysis
- Lazy loading verification

## Future Enhancements

### Phase 2 Features

- Social features (comments, likes, shares)
- Creator collaboration tools
- Advanced analytics with ML insights
- Mobile applications (iOS, Android)
- Live streaming support
- Community forums
- Referral program
- Affiliate marketing

### Technical Improvements

- GraphQL API option
- Real-time notifications with WebSockets
- Progressive Web App (PWA) support
- Offline mode for downloaded content
- Advanced caching strategies
- Multi-region deployment
- CDN optimization
- Image and video optimization

