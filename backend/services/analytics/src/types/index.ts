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
  transactions: number;
}

export interface ContentPerformance {
  contentId: string;
  title: string;
  views: number;
  downloads: number;
  revenue: number;
  createdAt: string;
}

export interface FanEngagement {
  activeFans: number;
  newFans: number;
  subscriptionRetention: number;
  averageRevenuePerFan: number;
}

export interface AnalyticsEntity {
  creatorId: string;
  date: string;
  revenue: number;
  newFans: number;
  activeSubscribers: number;
  contentViews: number;
  contentDownloads: number;
}

// API Request/Response types
export interface GetDashboardRequest {
  startDate?: string;
  endDate?: string;
}

export interface GetRevenueRequest {
  startDate?: string;
  endDate?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export interface GetContentPerformanceRequest {
  startDate?: string;
  endDate?: string;
}

export interface GetFanEngagementRequest {
  startDate?: string;
  endDate?: string;
}

export interface ExportAnalyticsRequest {
  startDate?: string;
  endDate?: string;
  type: 'revenue' | 'content' | 'fans';
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
  queryStringParameters?: { [key: string]: string };
  isBase64Encoded: boolean;
}
