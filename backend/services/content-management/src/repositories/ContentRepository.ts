import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { Content, ContentEntity, UpdateContentRequest } from '../types';

export class ContentRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'eu-central-1') {
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Create content record
   */
  async createContent(content: Content): Promise<Content> {
    const entity: ContentEntity = {
      PK: `CREATOR#${content.creatorId}`,
      SK: `CONTENT#${content.contentId}`,
      contentId: content.contentId,
      creatorId: content.creatorId,
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      s3Key: content.s3Key,
      s3Bucket: content.s3Bucket,
      fileSize: content.fileSize,
      duration: content.duration,
      thumbnailUrl: content.thumbnailUrl,
      uploadedAt: content.uploadedAt,
      updatedAt: content.updatedAt,
      GSI1PK: 'CONTENT',
      GSI1SK: content.uploadedAt,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: entity,
      })
    );

    return content;
  }

  /**
   * Get content by ID
   */
  async getContent(creatorId: string, contentId: string): Promise<Content | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `CREATOR#${creatorId}`,
          SK: `CONTENT#${contentId}`,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.entityToContent(result.Item as ContentEntity);
  }

  /**
   * List content items
   */
  async listContent(
    creatorId: string,
    options: { page?: string; limit?: string; contentType?: string } = {}
  ): Promise<{ items: Content[]; nextToken?: string }> {
    const limit = parseInt(options.limit || '20', 10);

    const params: any = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CREATOR#${creatorId}`,
        ':sk': 'CONTENT#',
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
      ExclusiveStartKey: options.page ? JSON.parse(options.page) : undefined,
    };

    // Add content type filter if specified
    if (options.contentType) {
      params.FilterExpression = 'contentType = :contentType';
      params.ExpressionAttributeValues[':contentType'] = options.contentType;
    }

    const result = await this.docClient.send(new QueryCommand(params));

    return {
      items: (result.Items || []).map((item) =>
        this.entityToContent(item as ContentEntity)
      ),
      nextToken: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : undefined,
    };
  }

  /**
   * Update content metadata
   */
  async updateContent(
    creatorId: string,
    contentId: string,
    updates: UpdateContentRequest
  ): Promise<Content> {
    // First get the existing content
    const existing = await this.getContent(creatorId, contentId);
    if (!existing) {
      throw new Error('Content not found');
    }

    // Merge updates
    const updated: ContentEntity = {
      PK: `CREATOR#${creatorId}`,
      SK: `CONTENT#${contentId}`,
      contentId,
      creatorId,
      title: updates.title ?? existing.title,
      description: updates.description ?? existing.description,
      contentType: existing.contentType,
      s3Key: existing.s3Key,
      s3Bucket: existing.s3Bucket,
      fileSize: existing.fileSize,
      duration: existing.duration,
      thumbnailUrl: updates.thumbnailUrl ?? existing.thumbnailUrl,
      uploadedAt: existing.uploadedAt,
      updatedAt: new Date().toISOString(),
      GSI1PK: 'CONTENT',
      GSI1SK: existing.uploadedAt,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      })
    );

    return this.entityToContent(updated);
  }

  /**
   * Delete content
   */
  async deleteContent(creatorId: string, contentId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `CREATOR#${creatorId}`,
          SK: `CONTENT#${contentId}`,
        },
      })
    );
  }

  /**
   * Convert DynamoDB entity to Content object
   */
  private entityToContent(entity: ContentEntity): Content {
    return {
      contentId: entity.contentId,
      creatorId: entity.creatorId,
      title: entity.title,
      description: entity.description,
      contentType: entity.contentType,
      s3Key: entity.s3Key,
      s3Bucket: entity.s3Bucket,
      fileSize: entity.fileSize,
      duration: entity.duration,
      thumbnailUrl: entity.thumbnailUrl,
      uploadedAt: entity.uploadedAt,
      updatedAt: entity.updatedAt,
    };
  }
}
