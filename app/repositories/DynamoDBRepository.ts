import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { AccessRight, Product } from '../types';

export class DynamoDBRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region?: string) {
    const client = new DynamoDBClient({ region: region || process.env.AWS_REGION });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Get user's access right to a specific product
   * @param userId User ID
   * @param productId Product ID
   * @returns AccessRight or null if not found
   */
  async getAccessRight(userId: string, productId: string): Promise<AccessRight | null> {
    try {
      const response = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            PK: `USER#${userId}`,
            SK: `RIGHT#${productId}`
          }
        })
      );

      return (response.Item as AccessRight) || null;
    } catch (error) {
      console.error('Error getting access right:', error);
      throw new Error('Failed to retrieve access right from database');
    }
  }

  /**
   * Get product metadata
   * @param creatorId Creator ID
   * @param productId Product ID
   * @returns Product or null if not found
   */
  async getProduct(creatorId: string, productId: string): Promise<Product | null> {
    try {
      const response = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            PK: `CREATOR#${creatorId}`,
            SK: `PROD#${productId}`
          }
        })
      );

      return (response.Item as Product) || null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to retrieve product from database');
    }
  }

  /**
   * Check if user has a valid subscription to a creator
   * @param userId User ID
   * @param creatorId Creator ID
   * @returns true if user has valid subscription
   */
  async hasValidSubscription(userId: string, creatorId: string): Promise<boolean> {
    try {
      const response = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :creatorPK AND GSI1SK = :userSK',
          FilterExpression: 'access_type = :subscriptionType',
          ExpressionAttributeValues: {
            ':creatorPK': `CREATOR#${creatorId}`,
            ':userSK': `USER#${userId}`,
            ':subscriptionType': 'SUBSCRIPTION'
          },
          Limit: 1
        })
      );

      return (response.Items?.length ?? 0) > 0;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Gracefully degrade - treat as no subscription rather than failing
      return false;
    }
  }

  /**
   * Atomically decrement the download counter for a user's access right
   * @param userId User ID
   * @param productId Product ID
   * @returns Updated downloads_remaining count
   * @throws Error if counter is already 0 or update fails
   */
  async decrementDownloads(userId: string, productId: string): Promise<number> {
    try {
      const response = await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            PK: `USER#${userId}`,
            SK: `RIGHT#${productId}`
          },
          UpdateExpression: 'SET downloads_remaining = downloads_remaining - :decrement',
          ConditionExpression: 'downloads_remaining > :zero',
          ExpressionAttributeValues: {
            ':decrement': 1,
            ':zero': 0
          },
          ReturnValues: 'ALL_NEW'
        })
      );

      return response.Attributes?.downloads_remaining ?? 0;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Download limit reached');
      }
      console.error('Error decrementing downloads:', error);
      throw new Error('Failed to update download counter');
    }
  }
}
