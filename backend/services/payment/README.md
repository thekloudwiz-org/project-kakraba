# Payment Service

Payment service for the Kakraba platform, supporting both mock mode for development and Stripe integration for production.

## Features

- **Mock Mode (Default)**: Simulates payment processing without actual Stripe API calls
- **Stripe Integration**: Full Stripe payment processing for production
- **Payment Intents**: Create and confirm payment intents
- **Subscriptions**: Create and manage recurring subscriptions
- **Access Rights**: Automatically create access rights on successful payment
- **Transaction Records**: Track all payment transactions

## Environment Variables

### Required
- `TABLE_NAME`: DynamoDB table name (default: CreatorVault)
- `AWS_REGION`: AWS region (default: eu-central-1)

### Optional
- `MOCK_MODE`: Set to `false` to enable Stripe integration (default: `true`)
- `STRIPE_SECRET_NAME`: Secrets Manager secret name for Stripe API key (default: `kakraba/stripe/api-key`)
- `STRIPE_WEBHOOK_SECRET_NAME`: Secrets Manager secret name for webhook secret (default: `kakraba/stripe/webhook-secret`)

## Mock Mode (Development)

By default, the service runs in mock mode, which simulates payment processing without making actual Stripe API calls.

### Mock Endpoints

**POST /payments/create-intent**
```json
{
  "productId": "product-123"
}
```

Response:
```json
{
  "clientSecret": "pi_mock_xxx_secret_xxx",
  "paymentIntentId": "pi_mock_xxx",
  "amount": 99.99,
  "mockMode": true
}
```

**POST /payments/confirm**
```json
{
  "paymentIntentId": "pi_mock_xxx",
  "productId": "product-123",
  "mockSuccess": true
}
```

Response:
```json
{
  "accessRight": { ... },
  "transaction": { ... },
  "mockMode": true,
  "message": "Mock payment confirmed successfully"
}
```

**POST /subscriptions/create**
```json
{
  "creatorId": "creator-123",
  "paymentMethodId": "pm_mock_xxx"
}
```

**POST /subscriptions/{subscriptionId}/cancel**

## Production Mode (Stripe Integration)

To enable Stripe integration:

1. Set `MOCK_MODE=false` environment variable
2. Store Stripe API key in AWS Secrets Manager:
   ```json
   {
     "apiKey": "sk_live_xxx"
   }
   ```
3. Store webhook secret in Secrets Manager:
   ```json
   {
     "webhookSecret": "whsec_xxx"
   }
   ```

## API Endpoints

### Payment Endpoints

- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment and create access right

### Subscription Endpoints

- `POST /subscriptions/create` - Create subscription
- `POST /subscriptions/{subscriptionId}/cancel` - Cancel subscription

### Webhook Endpoints

- `POST /webhooks/stripe` - Handle Stripe webhook events

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Package for deployment
npm run package
```

## Testing

The service includes comprehensive tests for both mock and production modes. Run tests with:

```bash
npm test
```

## Deployment

The service is deployed as an AWS Lambda function and integrated with API Gateway. See the main infrastructure documentation for deployment details.

## Mock Mode (Default)

By default, the service runs in **MOCK MODE** which simulates payment processing without actual Stripe API calls. This allows you to develop and test the full payment flow without Stripe credentials.

### Environment Variables

- `MOCK_MODE=true` (default) - Use mock payment processing
- `MOCK_MODE=false` - Use real Stripe integration (requires Stripe API keys)
- `TABLE_NAME` - DynamoDB table name
- `AWS_REGION` - AWS region (default: eu-central-1)

### Mock Mode Features

**Create Payment Intent:**
```bash
POST /payments/create-intent
{
  "productId": "product-123"
}

Response:
{
  "clientSecret": "pi_mock_xxx_secret_yyy",
  "paymentIntentId": "pi_mock_xxx",
  "amount": 99.99,
  "mockMode": true
}
```

**Confirm Payment:**
```bash
POST /payments/confirm
{
  "paymentIntentId": "pi_mock_xxx",
  "productId": "product-123",
  "mockSuccess": true  // Set to false to simulate payment failure
}

Response:
{
  "accessRight": { ... },
  "transaction": { ... },
  "mockMode": true,
  "message": "Mock payment confirmed successfully"
}
```

**Create Subscription:**
```bash
POST /subscriptions/create
{
  "creatorId": "creator-123",
  "paymentMethodId": "pm_mock_xxx"  // Optional in mock mode
}

Response:
{
  "subscriptionId": "sub-xxx",
  "status": "ACTIVE",
  "mockMode": true,
  "message": "Mock subscription created successfully"
}
```

**Cancel Subscription:**
```bash
POST /subscriptions/{subscriptionId}/cancel

Response:
{
  "subscriptionId": "sub-xxx",
  "status": "CANCELED",
  "cancelAtPeriodEnd": true,
  "mockMode": true,
  "message": "Mock subscription canceled successfully. Access maintained until period end."
}
```

### Testing Payment Failures

To test payment failure scenarios in mock mode:

```json
{
  "paymentIntentId": "pi_mock_xxx",
  "productId": "product-123",
  "mockSuccess": false
}
```

## Production Mode

To enable real Stripe integration:

1. Set `MOCK_MODE=false`
2. Configure Stripe API keys in AWS Secrets Manager
3. Update handlers to use Stripe SDK
4. Configure webhook endpoint with Stripe

## Development Workflow

1. Start with mock mode for rapid development
2. Test all payment flows without Stripe credentials
3. Switch to Stripe test mode when ready
4. Finally, enable production mode with live Stripe keys
