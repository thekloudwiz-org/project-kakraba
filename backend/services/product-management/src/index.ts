import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventV2WithAuth } from './types';
import { createProduct } from './handlers/create';
import { listProducts, getProduct } from './handlers/list';
import { updateProduct } from './handlers/update';
import { deleteProduct } from './handlers/delete';

/**
 * Main Lambda handler for product management service
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
    if (path === '/products' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await createProduct(userId, body);
    }

    if (path === '/products' && method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      return await listProducts(userId, queryParams);
    }

    if (path.match(/^\/products\/[^/]+$/) && method === 'GET') {
      const productId = event.pathParameters?.productId;
      if (!productId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing productId parameter',
          }),
        };
      }
      return await getProduct(userId, productId);
    }

    if (path.match(/^\/products\/[^/]+$/) && method === 'PUT') {
      const productId = event.pathParameters?.productId;
      if (!productId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing productId parameter',
          }),
        };
      }
      const body = event.body ? JSON.parse(event.body) : {};
      return await updateProduct(userId, productId, body);
    }

    if (path.match(/^\/products\/[^/]+$/) && method === 'DELETE') {
      const productId = event.pathParameters?.productId;
      if (!productId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing productId parameter',
          }),
        };
      }
      return await deleteProduct(userId, productId);
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
