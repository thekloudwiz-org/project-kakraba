import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ContentRepository } from '../repositories/ContentRepository';
import { ListContentRequest } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const contentRepo = new ContentRepository(tableName, region);

/**
 * GET /content
 * List content items with pagination and filters
 */
export async function listContent(
  userId: string,
  queryParams: ListContentRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const { creatorId, contentType, page, limit } = queryParams;

    // Use creatorId from query params if provided, otherwise use authenticated user
    const targetCreatorId = creatorId || userId;

    const result = await contentRepo.listContent(targetCreatorId, {
      page,
      limit,
      contentType,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error listing content:', error);
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
 * GET /content/{contentId}
 * Get content details
 */
export async function getContent(
  userId: string,
  contentId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    // For now, we assume the user is the creator
    // In a real implementation, we'd need to check if the user has access
    const content = await contentRepo.getContent(userId, contentId);

    if (!content) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Content not found',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(content),
    };
  } catch (error) {
    console.error('Error getting content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
