import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import {
  DashboardMetrics,
  RevenueDataPoint,
  ContentPerformance,
  FanEngagement,
} from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const analyticsRepo = new AnalyticsRepository(tableName, region);

/**
 * Helper to get date range (defaults to last 30 days)
 */
function getDateRange(queryParams: Record<string, string>): { startDate: string; endDate: string } {
  const endDate = queryParams.endDate || new Date().toISOString();
  const startDate = queryParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return { startDate, endDate };
}

/**
 * GET /analytics/dashboard
 * Get dashboard metrics for creator
 */
export async function getDashboard(
  userId: string,
  queryParams: Record<string, string>
): Promise<APIGatewayProxyResultV2> {
  try {
    const { startDate, endDate } = getDateRange(queryParams);

    // Get transactions for revenue calculation
    const transactions = await analyticsRepo.getTransactionsByDateRange(userId, startDate, endDate);
    const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');
    
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Get active subscriptions
    const activeSubscriptions = await analyticsRepo.getActiveSubscriptions(userId);
    const activeSubscribers = activeSubscriptions.length;

    // Get unique fans in period
    const fans = await analyticsRepo.getUniqueFans(userId, startDate, endDate);
    const newFans = fans.size;

    // Calculate content views (mock for now - would need view tracking)
    const contentViews = completedTransactions.length * 3; // Rough estimate

    const metrics: DashboardMetrics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeSubscribers,
      contentViews,
      newFans,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(metrics),
    };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * GET /analytics/revenue
 * Get revenue analytics with time series
 */
export async function getRevenue(
  userId: string,
  queryParams: Record<string, string>
): Promise<APIGatewayProxyResultV2> {
  try {
    const { startDate, endDate } = getDateRange(queryParams);
    const granularity = (queryParams.granularity as 'daily' | 'weekly' | 'monthly') || 'daily';

    // Get all transactions in range
    const transactions = await analyticsRepo.getTransactionsByDateRange(userId, startDate, endDate);
    const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');

    // Aggregate by date
    const revenueByDate = new Map<string, { revenue: number; count: number }>();

    completedTransactions.forEach(tx => {
      const date = aggregateDate(tx.createdAt, granularity);
      const existing = revenueByDate.get(date) || { revenue: 0, count: 0 };
      revenueByDate.set(date, {
        revenue: existing.revenue + (tx.amount || 0),
        count: existing.count + 1,
      });
    });

    // Convert to array and sort
    const data: RevenueDataPoint[] = Array.from(revenueByDate.entries())
      .map(([date, stats]) => ({
        date,
        revenue: Math.round(stats.revenue * 100) / 100,
        transactions: stats.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const total = data.reduce((sum, point) => sum + point.revenue, 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        data,
        total: Math.round(total * 100) / 100,
        granularity,
      }),
    };
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * GET /analytics/content
 * Get content performance metrics
 */
export async function getContentPerformance(
  userId: string,
  queryParams: Record<string, string>
): Promise<APIGatewayProxyResultV2> {
  try {
    const { startDate, endDate } = getDateRange(queryParams);

    // Get all content for creator
    const content = await analyticsRepo.getCreatorContent(userId);

    // Get transactions to calculate revenue per content
    const transactions = await analyticsRepo.getTransactionsByDateRange(userId, startDate, endDate);
    const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');

    // Get products to map content to revenue
    const products = await analyticsRepo.getCreatorProducts(userId);
    const productMap = new Map(products.map(p => [p.productId, p]));

    // Calculate metrics per content
    const contentMetrics = new Map<string, { views: number; downloads: number; revenue: number }>();

    // Aggregate transaction data
    completedTransactions.forEach(tx => {
      const product = productMap.get(tx.productId);
      if (product && product.contentIds) {
        product.contentIds.forEach((contentId: string) => {
          const existing = contentMetrics.get(contentId) || { views: 0, downloads: 0, revenue: 0 };
          contentMetrics.set(contentId, {
            views: existing.views + 1, // Each purchase counts as a view
            downloads: existing.downloads + (product.downloadQuota || 0),
            revenue: existing.revenue + (tx.amount || 0) / product.contentIds.length, // Split revenue
          });
        });
      }
    });

    // Build response
    const contentPerformance: ContentPerformance[] = content.map(c => ({
      contentId: c.contentId,
      title: c.title || 'Untitled',
      views: contentMetrics.get(c.contentId)?.views || 0,
      downloads: contentMetrics.get(c.contentId)?.downloads || 0,
      revenue: Math.round((contentMetrics.get(c.contentId)?.revenue || 0) * 100) / 100,
      createdAt: c.uploadedAt || c.createdAt,
    }));

    // Sort by revenue descending
    contentPerformance.sort((a, b) => b.revenue - a.revenue);

    return {
      statusCode: 200,
      body: JSON.stringify({ content: contentPerformance }),
    };
  } catch (error) {
    console.error('Error getting content performance:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * GET /analytics/fans
 * Get fan engagement metrics
 */
export async function getFanEngagement(
  userId: string,
  queryParams: Record<string, string>
): Promise<APIGatewayProxyResultV2> {
  try {
    const { startDate, endDate } = getDateRange(queryParams);

    // Get all fans (lifetime)
    const allFans = await analyticsRepo.getUniqueFans(userId);
    const activeFans = allFans.size;

    // Get new fans in period
    const newFansInPeriod = await analyticsRepo.getUniqueFans(userId, startDate, endDate);
    const newFans = newFansInPeriod.size;

    // Get active subscriptions
    const activeSubscriptions = await analyticsRepo.getActiveSubscriptions(userId);
    
    // Calculate retention (active subs / total fans)
    const subscriptionRetention = activeFans > 0 ? activeSubscriptions.length / activeFans : 0;

    // Get transactions for revenue calculation
    const transactions = await analyticsRepo.getTransactionsByDateRange(userId, startDate, endDate);
    const completedTransactions = transactions.filter(tx => tx.status === 'COMPLETED');
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Calculate average revenue per fan
    const averageRevenuePerFan = activeFans > 0 ? totalRevenue / activeFans : 0;

    const engagement: FanEngagement = {
      activeFans,
      newFans,
      subscriptionRetention: Math.round(subscriptionRetention * 100) / 100,
      averageRevenuePerFan: Math.round(averageRevenuePerFan * 100) / 100,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(engagement),
    };
  } catch (error) {
    console.error('Error getting fan engagement:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * GET /analytics/export
 * Export analytics data as CSV
 */
export async function exportAnalytics(
  userId: string,
  queryParams: Record<string, string>
): Promise<APIGatewayProxyResultV2> {
  try {
    const { startDate, endDate } = getDateRange(queryParams);
    const type = queryParams.type as 'revenue' | 'content' | 'fans';

    if (!type || !['revenue', 'content', 'fans'].includes(type)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing or invalid type parameter. Must be: revenue, content, or fans',
        }),
      };
    }

    let csv = '';

    if (type === 'revenue') {
      const revenueResponse = await getRevenue(userId, queryParams) as { statusCode: number; body: string };
      const revenueData = JSON.parse(revenueResponse.body);
      
      csv = 'Date,Revenue,Transactions\n';
      revenueData.data.forEach((point: RevenueDataPoint) => {
        csv += `${point.date},${point.revenue},${point.transactions}\n`;
      });
    } else if (type === 'content') {
      const contentResponse = await getContentPerformance(userId, queryParams) as { statusCode: number; body: string };
      const contentData = JSON.parse(contentResponse.body);
      
      csv = 'Content ID,Title,Views,Downloads,Revenue,Created At\n';
      contentData.content.forEach((item: ContentPerformance) => {
        csv += `${item.contentId},"${item.title}",${item.views},${item.downloads},${item.revenue},${item.createdAt}\n`;
      });
    } else if (type === 'fans') {
      const fansResponse = await getFanEngagement(userId, queryParams) as { statusCode: number; body: string };
      const fansData = JSON.parse(fansResponse.body);
      
      csv = 'Metric,Value\n';
      csv += `Active Fans,${fansData.activeFans}\n`;
      csv += `New Fans,${fansData.newFans}\n`;
      csv += `Subscription Retention,${fansData.subscriptionRetention}\n`;
      csv += `Average Revenue Per Fan,${fansData.averageRevenuePerFan}\n`;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${type}-${Date.now()}.csv"`,
      },
      body: csv,
    };
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Helper to aggregate dates by granularity
 */
function aggregateDate(dateStr: string, granularity: 'daily' | 'weekly' | 'monthly'): string {
  const date = new Date(dateStr);
  
  if (granularity === 'daily') {
    return date.toISOString().split('T')[0];
  } else if (granularity === 'weekly') {
    // Get Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  } else {
    // Monthly
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
