// User types
export interface User {
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  userType: 'CREATOR' | 'FAN';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
}

// Content types
export type ContentType = 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';

export interface Content {
  contentId: string;
  creatorId: string;
  title: string;
  description: string;
  contentType: ContentType;
  s3Key: string;
  s3Bucket: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
  fileSize: number;
}

export interface UploadUrlResponse {
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

export interface ListContentParams {
  creatorId?: string;
  contentType?: ContentType;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Product types
export type AccessType = 'PURCHASE' | 'RENTAL';
export type ProductType = 'SINGLE' | 'BUNDLE';

export interface Product {
  productId: string;
  creatorId: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD';
  contentIds: string[];
  accessType: AccessType;
  downloadQuota?: number;
  allowSubscription: boolean;
  productType: ProductType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional UI fields
  thumbnailUrl?: string;
  previewImages?: string[];
  contentTypes?: string[];
  purchaseCount?: number;
  rating?: number;
  reviewCount?: number;
  isSubscriptionContent?: boolean;
  subscriptionPrice?: number;
  includedContent?: any[];
  creatorName?: string;
  creatorAvatar?: string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  contentIds: string[];
  accessType: AccessType;
  downloadQuota?: number;
  allowSubscription: boolean;
  productType: ProductType;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  price?: number;
  contentIds?: string[];
  accessType?: AccessType;
  downloadQuota?: number;
  allowSubscription?: boolean;
  isActive?: boolean;
}

export interface ListProductsParams {
  creatorId?: string;
  minPrice?: number;
  maxPrice?: number;
  productType?: ProductType;
  page?: number;
  limit?: number;
}

// Payment types
export interface CreatePaymentIntentRequest {
  productId: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  amount: number;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  productId: string;
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

export interface Transaction {
  transactionId: string;
  userId: string;
  creatorId: string;
  productId: string;
  amount: number;
  currency: 'USD';
  paymentMethod: 'CARD';
  stripePaymentIntentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionType: 'PURCHASE' | 'SUBSCRIPTION';
  createdAt: string;
}

export interface ConfirmPaymentResponse {
  accessRight: AccessRight;
  transaction: Transaction;
}

export interface CreateSubscriptionRequest {
  creatorId: string;
  paymentMethodId: string;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  creatorId: string;
  stripeSubscriptionId: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface DashboardMetrics {
  totalRevenue: number;
  activeSubscribers: number;
  contentViews: number;
  newFans: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  views: number;
  downloads: number;
  revenue: number;
}

export interface FanEngagement {
  totalFans: number;
  activeFans: number;
  newFans: number;
  engagementRate: number;
  avgRevenuePerFan: number;
  retentionRate: number;
  subscriptionRetention: number;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface ExportParams {
  startDate?: string;
  endDate?: string;
  type: 'revenue' | 'content' | 'fans';
}

// Access Control types
export interface GenerateLinkRequest {
  product_id: string;
  user_id: string;
  intent: 'STREAM' | 'DOWNLOAD';
}

export interface GenerateLinkResponse {
  url: string;
  expires_at: string;
  access_type: 'PURCHASE' | 'SUBSCRIPTION';
  downloads_remaining?: number;
}
