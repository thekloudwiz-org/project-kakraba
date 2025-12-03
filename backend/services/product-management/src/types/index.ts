// Product types
export interface Product {
  productId: string;
  creatorId: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD';
  contentIds: string[];
  accessType: 'PURCHASE' | 'RENTAL';
  downloadQuota?: number;
  allowSubscription: boolean;
  productType: 'SINGLE' | 'BUNDLE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// DynamoDB Product Entity
export interface ProductEntity {
  PK: string; // CREATOR#<creatorId>
  SK: string; // PRODUCT#<productId>
  productId: string;
  creatorId: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD';
  contentIds: string[];
  accessType: 'PURCHASE' | 'RENTAL';
  downloadQuota?: number;
  allowSubscription: boolean;
  productType: 'SINGLE' | 'BUNDLE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string; // PRODUCT
  GSI1SK: string; // createdAt
  GSI2PK: string; // PRODUCT
  GSI2SK: number; // price
}

// API Request/Response types
export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  contentIds: string[];
  accessType: 'PURCHASE' | 'RENTAL';
  downloadQuota?: number;
  allowSubscription: boolean;
  productType: 'SINGLE' | 'BUNDLE';
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  contentIds?: string[];
  accessType?: 'PURCHASE' | 'RENTAL';
  downloadQuota?: number;
  allowSubscription?: boolean;
  isActive?: boolean;
}

export interface ListProductsRequest {
  creatorId?: string;
  minPrice?: string;
  maxPrice?: string;
  productType?: string;
  page?: string;
  limit?: string;
}

export interface ListProductsResponse {
  items: Product[];
  nextToken?: string;
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

// Price validation
export const MIN_PRICE = 0.5; // $0.50 minimum
export const MAX_PRICE = 10000; // $10,000 maximum
