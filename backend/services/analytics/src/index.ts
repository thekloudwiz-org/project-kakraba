import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventV2WithAuth } from './types';
import {
  getDashboard,
  getRevenue,
  getContentPerformance,
  getFanEngagement,
  exportAnalytics,
} from './handlers/analytics';

/**
 * Main Lambda handler for analytics service
 * Routes requests to appropriate handlers
 */
export const handler = async (
  event: APIGatewayProxyEventV2WithAuth
): Promise<APIGatewayProxyResultV2> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const { http } = event.requestContext;
    const method = http.method;
    const path = http.path;

    const userId = event.requestContext.authorizer?.jwt.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Missing user authentication',
        }),
      };
    }

    // Extract query parameters
    const queryParams = event.queryStringParameters || {};

    // Route to appropriate handler
    if (path === '/analytics/dashboard' && method === 'GET') {
      return await getDashboard(userId, queryParams);
    }

    if (path === '/analytics/revenue' && method === 'GET') {
      return await getRevenue(userId, queryParams);
    }

    if (path === '/analytics/content' && method === 'GET') {
      return await getContentPerformance(userId, queryParams);
    }

    if (path === '/analytics/fans' && method === 'GET') {
      return await getFanEngagement(userId, queryParams);
    }

    if (path === '/analytics/export' && method === 'GET') {
      return await exportAnalytics(userId, queryParams);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Not Found',
        message: `Route ${method} ${path} not found`,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
