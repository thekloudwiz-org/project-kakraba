import { getApiClient } from '../utils/api-client';
import type {
  User,
  UpdateProfileRequest,
  Content,
  UploadUrlRequest,
  UploadUrlResponse,
  CreateContentRequest,
  UpdateContentRequest,
  ListContentParams,
  PaginatedResponse,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsParams,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  CreateSubscriptionRequest,
  Subscription,
  Transaction,
  DashboardMetrics,
  RevenueDataPoint,
  ContentPerformance,
  FanEngagement,
  AnalyticsParams,
  ExportParams,
  GenerateLinkRequest,
  GenerateLinkResponse,
} from '../types/api';

/**
 * User Management API
 */
export const userApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<User> => {
    return getApiClient().get<User>('/users/profile');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    return getApiClient().put<User>('/users/profile', data);
  },

  /**
   * Get user's content library
   */
  getContent: async (userId: string, params?: ListContentParams): Promise<PaginatedResponse<Content>> => {
    return getApiClient().get<PaginatedResponse<Content>>(`/users/${userId}/content`, { params });
  },

  /**
   * Get user's purchase history
   */
  getPurchases: async (userId: string, page?: number, limit?: number): Promise<PaginatedResponse<Transaction>> => {
    return getApiClient().get<PaginatedResponse<Transaction>>(`/users/${userId}/purchases`, {
      params: { page, limit },
    });
  },

  /**
   * Get user's active subscriptions
   */
  getSubscriptions: async (userId: string): Promise<Subscription[]> => {
    return getApiClient().get<Subscription[]>(`/users/${userId}/subscriptions`);
  },

  /**
   * Get presigned URL for avatar upload
   */
  getAvatarUploadUrl: async (): Promise<{ url: string; fileUrl: string }> => {
    return getApiClient().post<{ url: string; fileUrl: string }>('/users/avatar/upload-url');
  },
};

/**
 * Content Management API
 */
export const contentApi = {
  /**
   * Get presigned S3 upload URL
   */
  getUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    return getApiClient().post<UploadUrlResponse>('/content/upload-url', data);
  },

  /**
   * Create content record after upload
   */
  createContent: async (data: CreateContentRequest): Promise<Content> => {
    return getApiClient().post<Content>('/content', data);
  },

  /**
   * List content items with filters
   */
  listContent: async (params?: ListContentParams): Promise<PaginatedResponse<Content>> => {
    return getApiClient().get<PaginatedResponse<Content>>('/content', { params });
  },

  /**
   * Get content details
   */
  getContent: async (contentId: string): Promise<Content> => {
    return getApiClient().get<Content>(`/content/${contentId}`);
  },

  /**
   * Update content metadata
   */
  updateContent: async (contentId: string, data: UpdateContentRequest): Promise<Content> => {
    return getApiClient().put<Content>(`/content/${contentId}`, data);
  },

  /**
   * Delete content item
   */
  deleteContent: async (contentId: string): Promise<{ message: string }> => {
    return getApiClient().delete<{ message: string }>(`/content/${contentId}`);
  },

  /**
   * Get featured content
   */
  getFeaturedContent: async () => {
    return getApiClient().get('/content/featured');
  },

  /**
   * Search content
   */
  searchContent: async (params: any) => {
    return getApiClient().get('/content/search', { params });
  },

  /**
   * Get stream URL for content
   */
  getStreamUrl: async (contentId: string) => {
    return getApiClient().get(`/content/${contentId}/stream-url`);
  },

  /**
   * Get download URL for content
   */
  getDownloadUrl: async (contentId: string) => {
    return getApiClient().post(`/content/${contentId}/download-url`);
  },

  /**
   * Upload file to S3 using presigned URL
   */
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },
};

/**
 * Product Management API
 */
export const productApi = {
  /**
   * Create new product
   */
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    return getApiClient().post<Product>('/products', data);
  },

  /**
   * List products with filters
   */
  listProducts: async (params?: ListProductsParams): Promise<PaginatedResponse<Product>> => {
    return getApiClient().get<PaginatedResponse<Product>>('/products', { params });
  },

  /**
   * Get product details
   */
  getProduct: async (productId: string): Promise<Product> => {
    return getApiClient().get<Product>(`/products/${productId}`);
  },

  /**
   * Update product
   */
  updateProduct: async (productId: string, data: UpdateProductRequest): Promise<Product> => {
    return getApiClient().put<Product>(`/products/${productId}`, data);
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId: string): Promise<{ message: string }> => {
    return getApiClient().delete<{ message: string }>(`/products/${productId}`);
  },
};

/**
 * Payment API
 */
export const paymentApi = {
  /**
   * Create Stripe payment intent
   */
  createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    return getApiClient().post<CreatePaymentIntentResponse>('/payments/create-intent', data);
  },

  /**
   * Confirm payment and create access right
   */
  confirmPayment: async (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
    return getApiClient().post<ConfirmPaymentResponse>('/payments/confirm', data);
  },

  /**
   * Create subscription
   */
  createSubscription: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    return getApiClient().post<Subscription>('/subscriptions/create', data);
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    return getApiClient().post<Subscription>(`/subscriptions/${subscriptionId}/cancel`);
  },
};

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get dashboard metrics
   */
  getDashboard: async (params?: AnalyticsParams): Promise<DashboardMetrics> => {
    return getApiClient().get<DashboardMetrics>('/analytics/dashboard', { params });
  },

  /**
   * Get revenue analytics
   */
  getRevenue: async (params?: AnalyticsParams): Promise<RevenueDataPoint[]> => {
    return getApiClient().get<RevenueDataPoint[]>('/analytics/revenue', { params });
  },

  /**
   * Get content performance
   */
  getContentPerformance: async (params?: AnalyticsParams): Promise<ContentPerformance[]> => {
    return getApiClient().get<ContentPerformance[]>('/analytics/content', { params });
  },

  /**
   * Get fan engagement metrics
   */
  getFanEngagement: async (params?: AnalyticsParams): Promise<FanEngagement> => {
    return getApiClient().get<FanEngagement>('/analytics/fans', { params });
  },

  /**
   * Export analytics data as CSV
   */
  exportAnalytics: async (params: ExportParams): Promise<Blob> => {
    const response = await fetch(
      `${getApiClient()['client'].defaults.baseURL}/analytics/export?${new URLSearchParams(params as any)}`,
      {
        headers: {
          Authorization: `Bearer ${getApiClient()['getToken']?.()}`,
        },
      }
    );
    return response.blob();
  },
};

/**
 * Access Control API
 */
export const accessApi = {
  /**
   * Generate signed URL for content access
   */
  generateLink: async (data: GenerateLinkRequest): Promise<GenerateLinkResponse> => {
    return getApiClient().post<GenerateLinkResponse>('/access/generate-link', data);
  },
};

// Creators API
const creatorsApi = {
  searchCreators: async (params: any) => {
    return getApiClient().get('/creators/search', { params });
  },
  getCreatorProfile: async (userId: string) => {
    return getApiClient().get(`/creators/${userId}`);
  },
  getCreatorContent: async (userId: string) => {
    return getApiClient().get(`/creators/${userId}/content`);
  },
  getCreatorProducts: async (userId: string) => {
    return getApiClient().get(`/creators/${userId}/products`);
  },
};

// Purchase API
const purchaseApi = {
  purchaseContent: async (contentId: string, paymentData: any) => {
    return getApiClient().post(`/purchases/content/${contentId}`, paymentData);
  },
  purchaseProduct: async (productId: string, paymentData: any) => {
    return getApiClient().post(`/purchases/product/${productId}`, paymentData);
  },
  getPurchaseHistory: async (params: any) => {
    return getApiClient().get('/purchases/history', { params });
  },
};

// Subscription API
const subscriptionApi = {
  subscribe: async (creatorId: string, paymentData: any) => {
    return getApiClient().post(`/subscriptions/${creatorId}`, paymentData);
  },
  getSubscriptions: async (params: any) => {
    return getApiClient().get('/subscriptions', { params });
  },
  getPlanDetails: async (planId: string) => {
    return getApiClient().get(`/subscriptions/plans/${planId}`);
  },
  cancelSubscription: async (subscriptionId: string) => {
    return getApiClient().post(`/subscriptions/${subscriptionId}/cancel`);
  },
  reactivateSubscription: async (subscriptionId: string) => {
    return getApiClient().post(`/subscriptions/${subscriptionId}/reactivate`);
  },
  updatePaymentMethod: async (subscriptionId: string, paymentMethodId: string) => {
    return getApiClient().put(`/subscriptions/${subscriptionId}/payment-method`, { paymentMethodId });
  },
};

// Library API
const libraryApi = {
  getAccessibleContent: async (params: any) => {
    return getApiClient().get('/library/content', { params });
  },
};

// Search API
const searchApi = {
  getSuggestions: async (query: string) => {
    return getApiClient().get('/search/suggestions', { params: { q: query } });
  },
};

// Export all APIs
export const api = {
  user: userApi,
  content: contentApi,
  product: productApi,
  payment: paymentApi,
  analytics: analyticsApi,
  access: accessApi,
  creators: creatorsApi,
  purchase: purchaseApi,
  subscription: subscriptionApi,
  library: libraryApi,
  search: searchApi,
};
