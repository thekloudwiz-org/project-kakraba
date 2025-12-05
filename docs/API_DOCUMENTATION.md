# API Documentation

Complete API reference for the Kakraba platform.

## Base URL

```
Production: https://api-kakraba.thekloudwiz.com
Development: https://1olgwybpe4.execute-api.eu-central-1.amazonaws.com
```

## Authentication

All protected endpoints require a JWT token obtained from AWS Cognito.

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Expiration

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Use refresh token to obtain new access token

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe",
  "userType": "CREATOR" | "FAN",
  "bio": "Optional bio text"
}
```

**Response:** `201 Created`
```json
{
  "userId": "uuid",
  "message": "User registered successfully. Please verify your email."
}
```

**Errors:**
- `400` - Invalid input
- `409` - Email already exists

#### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "uuid",
  "userType": "CREATOR" | "FAN",
  "expiresIn": 3600
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Email not verified

### User Management

#### Get User Profile

```http
GET /users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "bio": "Content creator",
  "profileImageUrl": "https://...",
  "userType": "CREATOR",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### Update User Profile

```http
PUT /users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "bio": "Updated bio",
  "profileImageUrl": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "userId": "uuid",
  "displayName": "Jane Doe",
  "bio": "Updated bio",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Content Management

#### Get Upload URL

```http
POST /content/upload-url
```

**Headers:** `Authorization: Bearer <token>` (Creator only)

**Request Body:**
```json
{
  "filename": "video.mp4",
  "contentType": "video/mp4",
  "fileSize": 104857600
}
```

**Response:** `200 OK`
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "contentId": "uuid",
  "s3Key": "content/creator-id/content-id.mp4",
  "expiresAt": "2025-01-01T01:00:00Z"
}
```

**Errors:**
- `400` - Invalid file type or size
- `401` - Unauthorized
- `403` - Not a creator

#### Create Content Record

```http
POST /content
```

**Headers:** `Authorization: Bearer <token>` (Creator only)

**Request Body:**
```json
{
  "contentId": "uuid",
  "title": "My Video",
  "description": "Video description",
  "contentType": "VIDEO",
  "s3Key": "content/creator-id/content-id.mp4",
  "fileSize": 104857600,
  "duration": 3600,
  "thumbnailUrl": "https://..."
}
```

**Response:** `201 Created`
```json
{
  "contentId": "uuid",
  "creatorId": "uuid",
  "title": "My Video",
  "description": "Video description",
  "contentType": "VIDEO",
  "s3Key": "content/creator-id/content-id.mp4",
  "fileSize": 104857600,
  "duration": 3600,
  "thumbnailUrl": "https://...",
  "uploadedAt": "2025-01-01T00:00:00Z"
}
```

#### List Content

```http
GET /content?creatorId=<uuid>&contentType=VIDEO&page=1&limit=20
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `creatorId` (optional) - Filter by creator
- `contentType` (optional) - Filter by type (VIDEO, AUDIO, PDF, IMAGE)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "items": [
    {
      "contentId": "uuid",
      "creatorId": "uuid",
      "title": "My Video",
      "description": "Video description",
      "contentType": "VIDEO",
      "thumbnailUrl": "https://...",
      "duration": 3600,
      "uploadedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Get Content Details

```http
GET /content/{contentId}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "contentId": "uuid",
  "creatorId": "uuid",
  "title": "My Video",
  "description": "Video description",
  "contentType": "VIDEO",
  "s3Key": "content/creator-id/content-id.mp4",
  "fileSize": 104857600,
  "duration": 3600,
  "thumbnailUrl": "https://...",
  "uploadedAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### Update Content

```http
PUT /content/{contentId}
```

**Headers:** `Authorization: Bearer <token>` (Owner only)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "thumbnailUrl": "https://..."
}
```

**Response:** `200 OK`

#### Delete Content

```http
DELETE /content/{contentId}
```

**Headers:** `Authorization: Bearer <token>` (Owner only)

**Response:** `204 No Content`

### Product Management

#### Create Product

```http
POST /products
```

**Headers:** `Authorization: Bearer <token>` (Creator only)

**Request Body:**
```json
{
  "title": "My Product",
  "description": "Product description",
  "price": 9.99,
  "contentIds": ["uuid1", "uuid2"],
  "accessType": "PURCHASE" | "RENTAL",
  "downloadQuota": 5,
  "allowSubscription": true,
  "productType": "SINGLE" | "BUNDLE"
}
```

**Response:** `201 Created`
```json
{
  "productId": "uuid",
  "creatorId": "uuid",
  "title": "My Product",
  "description": "Product description",
  "price": 9.99,
  "currency": "USD",
  "contentIds": ["uuid1", "uuid2"],
  "accessType": "PURCHASE",
  "downloadQuota": 5,
  "allowSubscription": true,
  "productType": "BUNDLE",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### List Products

```http
GET /products?creatorId=<uuid>&minPrice=0&maxPrice=100&page=1&limit=20
```

**Query Parameters:**
- `creatorId` (optional) - Filter by creator
- `minPrice` (optional) - Minimum price
- `maxPrice` (optional) - Maximum price
- `productType` (optional) - SINGLE or BUNDLE
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:** `200 OK`
```json
{
  "items": [
    {
      "productId": "uuid",
      "creatorId": "uuid",
      "title": "My Product",
      "description": "Product description",
      "price": 9.99,
      "currency": "USD",
      "productType": "BUNDLE",
      "thumbnailUrl": "https://...",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Payment Processing

#### Create Payment Intent

```http
POST /payments/create-intent
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 999,
  "currency": "usd",
  "productId": "uuid"
}
```

#### Confirm Payment

```http
POST /payments/confirm
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "productId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "accessRight": {
    "userId": "uuid",
    "productId": "uuid",
    "accessType": "PURCHASE",
    "downloadsRemaining": 5,
    "purchaseDate": "2025-01-01T00:00:00Z"
  },
  "transaction": {
    "transactionId": "uuid",
    "amount": 9.99,
    "currency": "USD",
    "status": "COMPLETED",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Create Subscription

```http
POST /subscriptions/create
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "creatorId": "uuid",
  "paymentMethodId": "pm_xxx"
}
```

**Response:** `201 Created`
```json
{
  "subscriptionId": "uuid",
  "stripeSubscriptionId": "sub_xxx",
  "userId": "uuid",
  "creatorId": "uuid",
  "status": "ACTIVE",
  "currentPeriodStart": "2025-01-01T00:00:00Z",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### Cancel Subscription

```http
POST /subscriptions/{subscriptionId}/cancel
```

**Headers:** `Authorization: Bearer <token>` (Owner only)

**Response:** `200 OK`
```json
{
  "subscriptionId": "uuid",
  "status": "CANCELED",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "2025-02-01T00:00:00Z"
}
```

### Content Access

#### Generate Access Link

```http
POST /access/generate-link
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "uuid",
  "userId": "uuid",
  "intent": "STREAM" | "DOWNLOAD"
}
```

**Response:** `200 OK`
```json
{
  "url": "https://d1rwanl0beslh.cloudfront.net/content/...?Expires=...&Signature=...",
  "expiresAt": "2025-01-01T00:15:00Z",
  "accessType": "PURCHASE",
  "downloadsRemaining": 4
}
```

**Errors:**
- `403` - No access right
- `403` - Download quota exhausted
- `404` - Product not found

### Analytics

#### Get Dashboard Metrics

```http
GET /analytics/dashboard?startDate=2025-01-01&endDate=2025-01-31
```

**Headers:** `Authorization: Bearer <token>` (Creator only)

**Query Parameters:**
- `startDate` (optional) - Start date (ISO 8601)
- `endDate` (optional) - End date (ISO 8601)

**Response:** `200 OK`
```json
{
  "totalRevenue": 1234.56,
  "activeSubscribers": 42,
  "contentViews": 1500,
  "newFans": 25,
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

#### Get Revenue Analytics

```http
GET /analytics/revenue?startDate=2025-01-01&endDate=2025-01-31&granularity=daily
```

**Headers:** `Authorization: Bearer <token>` (Creator only)

**Query Parameters:**
- `startDate` (required) - Start date
- `endDate` (required) - End date
- `granularity` (optional) - daily, weekly, monthly (default: daily)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "date": "2025-01-01",
      "revenue": 45.99,
      "transactions": 5
    },
    {
      "date": "2025-01-02",
      "revenue": 89.97,
      "transactions": 9
    }
  ],
  "total": 1234.56,
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

#### Export Analytics

```http
GET /analytics/export?startDate=2025-01-01&endDate=2025-01-31&type=revenue
```

**Headers:** `Authorization: Bearer <token>` (Creator only)

**Query Parameters:**
- `startDate` (required) - Start date
- `endDate` (required) - End date
- `type` (required) - revenue, content, fans

**Response:** `200 OK`
```
Content-Type: text/csv
Content-Disposition: attachment; filename="analytics-revenue-2025-01.csv"

Date,Revenue,Transactions
2025-01-01,45.99,5
2025-01-02,89.97,9
...
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

- **Default:** 1000 requests per minute per user
- **Burst:** 2000 requests
- **Headers:**
  - `X-RateLimit-Limit` - Request limit
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Reset timestamp

## Webhooks

### Stripe Webhook

```http
POST /webhooks/stripe
```

**Headers:**
- `Stripe-Signature` - Webhook signature

**Events Handled:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-kakraba.thekloudwiz.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Get products
const getProducts = async (creatorId?: string) => {
  const response = await api.get('/products', {
    params: { creatorId }
  });
  return response.data;
};

// Generate access link
const generateAccessLink = async (productId: string, intent: 'STREAM' | 'DOWNLOAD') => {
  const response = await api.post('/access/generate-link', {
    productId,
    intent
  });
  return response.data;
};
```

### cURL Examples

```bash
# Login
curl -X POST https://api-kakraba.thekloudwiz.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get products
curl -X GET "https://api-kakraba.thekloudwiz.com/products?page=1&limit=20" \
  -H "Authorization: Bearer <token>"

# Create product
curl -X POST https://api-kakraba.thekloudwiz.com/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Product",
    "price": 9.99,
    "contentIds": ["uuid1"],
    "accessType": "PURCHASE"
  }'
```

## Postman Collection

Import our Postman collection for easy API testing:

[Download Postman Collection](./kakraba-api.postman_collection.json)

---

For more information, see:
- [Architecture & Flow](./ARCHITECTURE_AND_FLOW.md)
- [Usage & Contributing](./USAGE_AND_CONTRIBUTING.md)
