import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventV2WithAuth } from './types';
import { createUploadUrl, createContent } from './handlers/upload';
import { listContent, getContent } from './handlers/list';
import { updateContent } from './handlers/update';
import { deleteContent } from './handlers/delete';

/**
 * Main Lambda handler for content management service
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
    if (path === '/content/upload-url' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await createUploadUrl(userId, body);
    }

    if (path === '/content' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await createContent(userId, body);
    }

    if (path === '/content' && method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      return await listContent(userId, queryParams);
    }

    if (path.match(/^\/content\/[^/]+$/) && method === 'GET') {
      const contentId = event.pathParameters?.contentId;
      if (!contentId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing contentId parameter',
          }),
        };
      }
      return await getContent(userId, contentId);
    }

    if (path.match(/^\/content\/[^/]+$/) && method === 'PUT') {
      const contentId = event.pathParameters?.contentId;
      if (!contentId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing contentId parameter',
          }),
        };
      }
      const body = event.body ? JSON.parse(event.body) : {};
      return await updateContent(userId, contentId, body);
    }

    if (path.match(/^\/content\/[^/]+$/) && method === 'DELETE') {
      const contentId = event.pathParameters?.contentId;
      if (!contentId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing contentId parameter',
          }),
        };
      }
      return await deleteContent(userId, contentId);
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
