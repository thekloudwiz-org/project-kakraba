// Payment types
export interface PaymentIntent {
  paymentIntentId: string;
  productId: string;
  userId: string;
  amount: number;
  currency: 'USD';
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  createdAt: string;
}

export interface Transaction {
  transactionId: string;
  userId: string;
  creatorId: string;
  productId: string;
  amount: number;
  currency: 'USD';
  paymentMethod: 'CARD' | 'MOCK';
  stripePaymentIntentId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionType: 'PURCHASE' | 'SUBSCRIPTION';
  createdAt: string;
}

export interface AccessRight {
  userId: string;
  productId: string;
  creatorId: string;
  accessType: 'PURCHASE' | 'SUBSCRIPTION';
  downloadsRemaining?: number;
  purchaseDate: string;
  expiresAt?: string;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  creatorId: string;
  stripeSubscriptionId?: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface CreatePaymentIntentRequest {
  productId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  productId: string;
  // For mock mode
  mockSuccess?: boolean;
}

export interface ConfirmPaymentResponse {
  accessRight: AccessRight;
  transaction: Transaction;
}

export interface CreateSubscriptionRequest {
  creatorId: string;
  paymentMethodId?: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
}

// Lambda event types
export interface APIGatewayProxyEventV2WithAuth {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers: { [key: string]: string };
  requestContext: {
    accountId: string;
    apiId: string;
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
    authorizer?: {
      jwt: {
        claims: {
          sub: string;
          email: string;
          'cognito:username': string;
          [key: string]: string;
        };
      };
    };
  };
  body?: string;
  pathParameters?: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
  isBase64Encoded: boolean;
}

// Config
export interface Config {
  tableName: string;
  region: string;
  mockMode: boolean;
}
