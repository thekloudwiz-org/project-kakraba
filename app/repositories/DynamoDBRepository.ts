import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  PutCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';
import { AccessRight, Product } from '../types';
import { ContentMetadata } from '../services/ContentService';

export class DynamoDBRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region?: string) {
    const client = new DynamoDBClient({ region: region || process.env.AWS_REGION });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Remove DynamoDB-specific fields from items
   * Strips PK, SK, and GSI keys to return clean domain objects
   */
  private cleanDynamoDBItem<T>(item: Record<string, unknown> | undefined): T | null {
    if (!item) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { PK, SK, GSI1PK, GSI1SK, ...cleanItem } = item;
    return cleanItem as T;
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
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        throw new Error('Download limit reached');
      }
      console.error('Error decrementing downloads:', error);
      throw new Error('Failed to update download counter');
    }
  }

  /**
   * Create content metadata record
   */
  async createContent(content: ContentMetadata): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: {
            PK: `USER#${content.userId}`,
            SK: `CONTENT#${content.contentId}`,
            contentId: content.contentId,
            userId: content.userId,
            title: content.title,
            description: content.description,
            contentType: content.contentType,
            s3Key: content.s3Key,
            fileSize: content.fileSize,
            uploadedAt: content.uploadedAt,
            thumbnailUrl: content.thumbnailUrl,
          },
        })
      );
    } catch (error) {
      console.error('Error creating content:', error);
      throw new Error('Failed to create content record');
    }
  }

  /**
   * Get content metadata
   */
  async getContent(userId: string, contentId: string): Promise<ContentMetadata | null> {
    try {
      const response = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: {
            PK: `USER#${userId}`,
            SK: `CONTENT#${contentId}`,
          },
        })
      );

      return this.cleanDynamoDBItem<ContentMetadata>(response.Item);
    } catch (error) {
      console.error('Error getting content:', error);
      throw new Error('Failed to retrieve content');
    }
  }

  /**
   * List user's content
   */
  async listUserContent(
    userId: string,
    options?: { limit?: number; contentType?: string }
  ): Promise<{ items: ContentMetadata[] }> {
    try {
      const params: {
        TableName: string;
        KeyConditionExpression: string;
        ExpressionAttributeValues: Record<string, string>;
        ScanIndexForward: boolean;
        FilterExpression?: string;
      } = {
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :userPK AND begins_with(SK, :contentPrefix)',
        ExpressionAttributeValues: {
          ':userPK': `USER#${userId}`,
          ':contentPrefix': 'CONTENT#',
        },
        ScanIndexForward: false, // Sort by SK descending (newest first)
      };

      if (options?.contentType) {
        params.FilterExpression = 'contentType = :contentType';
        params.ExpressionAttributeValues[':contentType'] = options.contentType;
      }

      const response = await this.docClient.send(new QueryCommand(params));

      return {
        items: (response.Items || []).map(item => this.cleanDynamoDBItem<ContentMetadata>(item)).filter((item): item is ContentMetadata => item !== null),
      };
    } catch (error) {
      console.error('Error listing content:', error);
      throw new Error('Failed to list content');
    }
  }

  /**
   * Update content metadata
   */
  async updateContent(
    userId: string,
    contentId: string,
    updates: Partial<Pick<ContentMetadata, 'title' | 'description' | 'thumbnailUrl'>>
  ): Promise<ContentMetadata> {
    try {
      const updateExpressions: string[] = [];
      const expressionAttributeValues: Record<string, unknown> = {};
      const expressionAttributeNames: Record<string, string> = {};

      if (updates.title !== undefined) {
        updateExpressions.push('#title = :title');
        expressionAttributeNames['#title'] = 'title';
        expressionAttributeValues[':title'] = updates.title;
      }

      if (updates.description !== undefined) {
        updateExpressions.push('#description = :description');
        expressionAttributeNames['#description'] = 'description';
        expressionAttributeValues[':description'] = updates.description;
      }

      if (updates.thumbnailUrl !== undefined) {
        updateExpressions.push('thumbnailUrl = :thumbnailUrl');
        expressionAttributeValues[':thumbnailUrl'] = updates.thumbnailUrl;
      }

      if (updateExpressions.length === 0) {
        throw new Error('No updates provided');
      }

      const response = await this.docClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: {
            PK: `USER#${userId}`,
            SK: `CONTENT#${contentId}`,
          },
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        })
      );

      return response.Attributes as ContentMetadata;
    } catch (error) {
      console.error('Error updating content:', error);
      throw new Error('Failed to update content');
    }
  }

  /**
   * Delete content metadata
   */
  async deleteContent(userId: string, contentId: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: {
            PK: `USER#${userId}`,
            SK: `CONTENT#${contentId}`,
          },
        })
      );
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new Error('Failed to delete content');
    }
  }
}
