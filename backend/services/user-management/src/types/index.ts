// User types
export interface User {
  userId: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  userType: 'CREATOR' | 'FAN';
  createdAt: string;
  updatedAt: string;
}

// DynamoDB User Entity
export interface UserEntity {
  PK: string; // USER#<userId>
  SK: string; // PROFILE
  userId: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  userType: 'CREATOR' | 'FAN';
  createdAt: string;
  updatedAt: string;
  GSI1PK: string; // USER
  GSI1SK: string; // email
}

// API Request/Response types
export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface GetUserContentResponse {
  items: ContentItem[];
  nextToken?: string;
}

export interface ContentItem {
  contentId: string;
  title: string;
  description: string;
  contentType: string;
  uploadedAt: string;
}

export interface GetUserPurchasesResponse {
  items: Transaction[];
  nextToken?: string;
}

export interface Transaction {
  transactionId: string;
  productId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface GetUserSubscriptionsResponse {
  items: Subscription[];
}

export interface Subscription {
  subscriptionId: string;
  creatorId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
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
}
