import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserRepository } from '../repositories/UserRepository';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const userRepo = new UserRepository(tableName, region);

/**
 * GET /users/{userId}/subscriptions
 * Get user's active subscriptions
 */
export async function getUserSubscriptions(
  userId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    const subscriptions = await userRepo.getUserSubscriptions(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ items: subscriptions }),
    };
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
