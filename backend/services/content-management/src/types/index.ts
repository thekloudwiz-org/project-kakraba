// Content types
export interface Content {
  contentId: string;
  creatorId: string;
  title: string;
  description: string;
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';
  s3Key: string;
  s3Bucket: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
  uploadedAt: string;
  updatedAt: string;
}

// DynamoDB Content Entity
export interface ContentEntity {
  PK: string; // CREATOR#<creatorId>
  SK: string; // CONTENT#<contentId>
  contentId: string;
  creatorId: string;
  title: string;
  description: string;
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';
  s3Key: string;
  s3Bucket: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
  uploadedAt: string;
  updatedAt: string;
  GSI1PK: string; // CONTENT
  GSI1SK: string; // uploadedAt
}

// API Request/Response types
export interface CreateUploadUrlRequest {
  filename: string;
  contentType: string;
  fileSize: number;
}

export interface CreateUploadUrlResponse {
  uploadUrl: string;
  contentId: string;
  s3Key: string;
}

export interface CreateContentRequest {
  contentId: string;
  title: string;
  description: string;
  contentType: string;
  s3Key: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface UpdateContentRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface ListContentRequest {
  creatorId?: string;
  contentType?: string;
  page?: string;
  limit?: string;
}

export interface ListContentResponse {
  items: Content[];
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
  contentBucket: string;
  region: string;
}

// File validation
export const ALLOWED_CONTENT_TYPES = {
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
