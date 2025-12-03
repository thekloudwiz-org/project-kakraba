import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { User, UserEntity, UpdateProfileRequest } from '../types';

export class UserRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'eu-central-1') {
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Get user profile by userId
   */
  async getUserProfile(userId: string): Promise<User | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.entityToUser(result.Item as UserEntity);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: UpdateProfileRequest
  ): Promise<User> {
    // First get the existing profile
    const existing = await this.getUserProfile(userId);
    if (!existing) {
      throw new Error('User not found');
    }

    // Merge updates
    const updated: UserEntity = {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      userId,
      email: existing.email,
      displayName: updates.displayName ?? existing.displayName,
      bio: updates.bio ?? existing.bio,
      profileImageUrl: updates.profileImageUrl ?? existing.profileImageUrl,
      userType: existing.userType,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      GSI1PK: 'USER',
      GSI1SK: existing.email,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      })
    );

    return this.entityToUser(updated);
  }

  /**
   * Get user's content items
   */
  async getUserContent(
    userId: string,
    options: { page?: string; limit?: string } = {}
  ): Promise<{ items: any[]; nextToken?: string }> {
    const limit = parseInt(options.limit || '20', 10);

    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CREATOR#${userId}`,
          ':sk': 'CONTENT#',
        },
        Limit: limit,
        ExclusiveStartKey: options.page ? JSON.parse(options.page) : undefined,
      })
    );

    return {
      items: result.Items || [],
      nextToken: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : undefined,
    };
  }

  /**
   * Get user's purchase history
   */
  async getUserPurchases(
    userId: string,
    options: { page?: string; limit?: string } = {}
  ): Promise<{ items: any[]; nextToken?: string }> {
    const limit = parseInt(options.limit || '20', 10);

    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'TRANSACTION#',
        },
        Limit: limit,
        ScanIndexForward: false, // Most recent first
        ExclusiveStartKey: options.page ? JSON.parse(options.page) : undefined,
      })
    );

    return {
      items: result.Items || [],
      nextToken: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : undefined,
    };
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<any[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'SUBSCRIPTION#',
        },
      })
    );

    return result.Items || [];
  }

  /**
   * Convert DynamoDB entity to User object
   */
  private entityToUser(entity: UserEntity): User {
    return {
      userId: entity.userId,
      email: entity.email,
      displayName: entity.displayName,
      bio: entity.bio,
      profileImageUrl: entity.profileImageUrl,
      userType: entity.userType,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
