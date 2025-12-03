// Enums
export enum AccessType {
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum ProductType {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  BOOK = 'BOOK',
  ART = 'ART'
}

export enum Intent {
  STREAM = 'STREAM',
  DOWNLOAD = 'DOWNLOAD'
}

// DynamoDB Entities
export interface AccessRight {
  PK: string; // USER#<user_id>
  SK: string; // RIGHT#<product_id>
  access_type: AccessType;
  downloads_remaining: number;
  purchase_date: string; // ISO 8601
  creator_id: string;
  GSI1PK?: string; // CREATOR#<creator_id>
  GSI1SK?: string; // USER#<user_id>
}

export interface Product {
  PK: string; // CREATOR#<creator_id>
  SK: string; // PROD#<product_id>
  type: ProductType;
  allow_subscription: boolean;
  price_one_time: number;
  s3_key_source: string;
  title: string;
  created_at: string;
}

// API Request/Response Types
export interface AccessRequest {
  product_id: string;
  user_id: string;
  intent: Intent;
}

export interface AccessResponse {
  url: string;
  expires_at: string;
  access_type: AccessType;
  downloads_remaining?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

// Service Types
export interface AccessValidationResult {
  allowed: boolean;
  accessType?: AccessType;
  downloadsRemaining?: number;
  errorMessage?: string;
  s3Key?: string;
  filename?: string;
}

// Configuration
export interface Config {
  tableName: string;
  cloudfrontDomain: string;
  cloudfrontKeyPairId: string;
  cloudfrontPrivateKeySecretArn: string;
  nodeEnv: string;
}

// Signed URL Options
export interface SignedUrlOptions {
  s3Key: string;
  intent: Intent;
  filename: string;
  expirationMinutes: number;
}
