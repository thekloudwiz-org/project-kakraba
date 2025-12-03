import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventV2WithAuth } from './types';
import { getUserProfile, updateUserProfile } from './handlers/profile';
import { getUserContent } from './handlers/content';
import { getUserPurchases } from './handlers/purchases';
import { getUserSubscriptions } from './handlers/subscriptions';

/**
 * Main Lambda handler for user management service
 * Routes requests to appropriate handlers based on HTTP method and path
 */
export const handler = async (
  event: APIGatewayProxyEventV2WithAuth
): Promise<APIGatewayProxyResultV2> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const { http } = event.requestContext;
    const method = http.method;
    const path = http.path;

    // Extract userId from JWT claims
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

    // Route to appropriate handler
    if (path === '/users/profile' && method === 'GET') {
      return await getUserProfile(userId);
    }

    if (path === '/users/profile' && method === 'PUT') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await updateUserProfile(userId, body);
    }

    if (path.match(/^\/users\/[^/]+\/content$/) && method === 'GET') {
      const pathUserId = event.pathParameters?.userId;
      const page = event.queryStringParameters?.page;
      const limit = event.queryStringParameters?.limit;
      return await getUserContent(pathUserId || userId, { page, limit });
    }

    if (path.match(/^\/users\/[^/]+\/purchases$/) && method === 'GET') {
      const pathUserId = event.pathParameters?.userId;
      const page = event.queryStringParameters?.page;
      const limit = event.queryStringParameters?.limit;
      return await getUserPurchases(pathUserId || userId, { page, limit });
    }

    if (path.match(/^\/users\/[^/]+\/subscriptions$/) && method === 'GET') {
      const pathUserId = event.pathParameters?.userId;
      return await getUserSubscriptions(pathUserId || userId);
    }

    // Route not found
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
