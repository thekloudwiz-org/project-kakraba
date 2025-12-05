import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private maxRetries: number;
  private getToken: (() => string | null) | null = null;

  constructor(config: ApiClientConfig) {
    this.maxRetries = config.maxRetries || 3;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set the token getter function for authentication
   */
  setTokenGetter(getToken: () => string | null) {
    this.getToken = getToken;
  }

  private setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.getToken) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
          // Trigger logout/redirect logic
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          return Promise.reject(this.formatError(error));
        }

        // Retry logic with exponential backoff
        if (this.shouldRetry(error) && originalRequest) {
          originalRequest._retryCount = originalRequest._retryCount || 0;

          if (originalRequest._retryCount < this.maxRetries) {
            originalRequest._retryCount++;
            originalRequest._retry = true;

            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
            await this.sleep(delay);

            return this.client(originalRequest);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    if (!error.response) {
      return true; // Network error
    }

    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      return {
        message: data?.message || data?.error || 'An error occurred',
        statusCode: error.response.status,
        details: data?.details,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Error setting up request
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Create singleton instance
let apiClientInstance: ApiClient | null = null;

export function createApiClient(config: ApiClientConfig): ApiClient {
  apiClientInstance = new ApiClient(config);
  return apiClientInstance;
}

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call createApiClient first.');
  }
  return apiClientInstance;
}

export { ApiClient };
