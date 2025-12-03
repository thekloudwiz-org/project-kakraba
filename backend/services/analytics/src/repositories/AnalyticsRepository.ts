import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { AnalyticsEntity, ContentPerformance } from '../types';

export class AnalyticsRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'eu-central-1') {
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Get analytics data for a date range
   */
  async getAnalyticsByDateRange(
    creatorId: string,
    startDate: string,
    endDate: string
  ): Promise<AnalyticsEntity[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK BETWEEN :start AND :end',
        ExpressionAttributeValues: {
          ':pk': `ANALYTICS#${creatorId}`,
          ':start': startDate,
          ':end': endDate,
        },
      })
    );

    return (result.Items || []) as AnalyticsEntity[];
  }

  /**
   * Get all transactions for a creator in a date range
   */
  async getTransactionsByDateRange(
    creatorId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK BETWEEN :start AND :end',
        FilterExpression: 'begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CREATOR#${creatorId}`,
          ':start': startDate,
          ':end': endDate,
          ':sk': 'TRANSACTION#',
        },
      })
    );

    return result.Items || [];
  }

  /**
   * Get all content for a creator
   */
  async getCreatorContent(creatorId: string): Promise<any[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CREATOR#${creatorId}`,
          ':sk': 'CONTENT#',
        },
      })
    );

    return result.Items || [];
  }

  /**
   * Get active subscriptions for a creator
   */
  async getActiveSubscriptions(creatorId: string): Promise<any[]> {
    const now = new Date().toISOString();
    
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK > :now',
        FilterExpression: 'begins_with(SK, :sk) AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':pk': `CREATOR#${creatorId}`,
          ':now': now,
          ':sk': 'SUBSCRIPTION#',
          ':status': 'ACTIVE',
        },
      })
    );

    return result.Items || [];
  }

  /**
   * Get all products for a creator
   */
  async getCreatorProducts(creatorId: string): Promise<any[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CREATOR#${creatorId}`,
          ':sk': 'PRODUCT#',
        },
      })
    );

    return result.Items || [];
  }

  /**
   * Count unique fans (users who have purchased or subscribed)
   */
  async getUniqueFans(creatorId: string, startDate?: string, endDate?: string): Promise<Set<string>> {
    const transactions = startDate && endDate
      ? await this.getTransactionsByDateRange(creatorId, startDate, endDate)
      : await this.getAllTransactions(creatorId);

    const fanIds = new Set<string>();
    transactions.forEach(tx => {
      if (tx.userId) {
        fanIds.add(tx.userId);
      }
    });

    return fanIds;
  }

  /**
   * Get all transactions for a creator (no date filter)
   */
  private async getAllTransactions(creatorId: string): Promise<any[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        FilterExpression: 'begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CREATOR#${creatorId}`,
          ':sk': 'TRANSACTION#',
        },
      })
    );

    return result.Items || [];
  }
}
