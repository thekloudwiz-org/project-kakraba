import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ContentRepository } from '../repositories/ContentRepository';
import { S3Service } from '../utils/s3';

const tableName = process.env.TABLE_NAME || '';
const contentBucket = process.env.CONTENT_BUCKET || '';
const region = process.env.AWS_REGION || 'eu-central-1';

const contentRepo = new ContentRepository(tableName, region);
const s3Service = new S3Service(contentBucket, region);

/**
 * DELETE /content/{contentId}
 * Delete content item
 */
export async function deleteContent(
  userId: string,
  contentId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    // First, get the content to retrieve the S3 key
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

    // Verify the user is the owner
    if (content.creatorId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'Forbidden',
          message: 'You do not have permission to delete this content',
        }),
      };
    }

    // Delete from DynamoDB
    await contentRepo.deleteContent(userId, contentId);

    // Delete from S3 (async, don't wait for completion)
    s3Service.deleteObject(content.s3Key).catch((error) => {
      console.error('Error deleting S3 object:', error);
      // Log but don't fail the request
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Content deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
