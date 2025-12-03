import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserRepository } from '../repositories/UserRepository';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const userRepo = new UserRepository(tableName, region);

/**
 * GET /users/{userId}/content
 * Get user's content library
 */
export async function getUserContent(
  userId: string,
  options: { page?: string; limit?: string } = {}
): Promise<APIGatewayProxyResultV2> {
  try {
    const result = await userRepo.getUserContent(userId, options);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error getting user content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
