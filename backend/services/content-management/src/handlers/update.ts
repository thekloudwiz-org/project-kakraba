import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ContentRepository } from '../repositories/ContentRepository';
import { UpdateContentRequest } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const contentRepo = new ContentRepository(tableName, region);

/**
 * PUT /content/{contentId}
 * Update content metadata
 */
export async function updateContent(
  userId: string,
  contentId: string,
  updates: UpdateContentRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    // Validate that at least one field is provided
    if (!updates.title && !updates.description && !updates.thumbnailUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'At least one field must be provided for update',
        }),
      };
    }

    const content = await contentRepo.updateContent(userId, contentId, updates);

    return {
      statusCode: 200,
      body: JSON.stringify(content),
    };
  } catch (error) {
    console.error('Error updating content:', error);

    if (error instanceof Error && error.message === 'Content not found') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Content not found',
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
