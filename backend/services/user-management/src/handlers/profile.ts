import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { UserRepository } from '../repositories/UserRepository';
import { UpdateProfileRequest } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const userRepo = new UserRepository(tableName, region);

/**
 * GET /users/profile
 * Get current user's profile
 */
export async function getUserProfile(
  userId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    const user = await userRepo.getUserProfile(userId);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'User profile not found',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
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
 * PUT /users/profile
 * Update current user's profile
 */
export async function updateUserProfile(
  userId: string,
  updates: UpdateProfileRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    // Validate input
    if (
      !updates.displayName &&
      !updates.bio &&
      !updates.profileImageUrl
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'At least one field must be provided for update',
        }),
      };
    }

    const user = await userRepo.updateUserProfile(userId, updates);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error instanceof Error && error.message === 'User not found') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'User profile not found',
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
