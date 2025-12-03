import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Transaction, AccessRight, Subscription } from '../types';

export class PaymentRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'eu-central-1') {
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Create transaction record
   */
  async createTransaction(transaction: Transaction): Promise<Transaction> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${transaction.userId}`,
          SK: `TRANSACTION#${transaction.transactionId}`,
          ...transaction,
          GSI1PK: `CREATOR#${transaction.creatorId}`,
          GSI1SK: transaction.createdAt,
        },
      })
    );

    return transaction;
  }

  /**
   * Create access right
   */
  async createAccessRight(accessRight: AccessRight): Promise<AccessRight> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${accessRight.userId}`,
          SK: `ACCESS#${accessRight.productId}`,
          ...accessRight,
          GSI1PK: `SUBSCRIPTION#${accessRight.userId}#${accessRight.creatorId}`,
          GSI1SK: accessRight.expiresAt || '9999-12-31T23:59:59.999Z',
        },
      })
    );

    return accessRight;
  }

  /**
   * Get product details (to get creator ID and price)
   */
  async getProduct(creatorId: string, productId: string): Promise<any> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `CREATOR#${creatorId}`,
          SK: `PRODUCT#${productId}`,
        },
      })
    );

    return result.Item || null;
  }

  /**
   * Create subscription
   */
  async createSubscription(subscription: Subscription): Promise<Subscription> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${subscription.userId}`,
          SK: `SUBSCRIPTION#${subscription.subscriptionId}`,
          ...subscription,
          GSI1PK: `CREATOR#${subscription.creatorId}`,
          GSI1SK: subscription.currentPeriodEnd,
        },
      })
    );

    return subscription;
  }

  /**
   * Get subscription
   */
  async getSubscription(userId: string, subscriptionId: string): Promise<Subscription | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `SUBSCRIPTION#${subscriptionId}`,
        },
      })
    );

    return result.Item as Subscription || null;
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscription: Subscription): Promise<Subscription> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${subscription.userId}`,
          SK: `SUBSCRIPTION#${subscription.subscriptionId}`,
          ...subscription,
          GSI1PK: `CREATOR#${subscription.creatorId}`,
          GSI1SK: subscription.currentPeriodEnd,
        },
      })
    );

    return subscription;
  }

  /**
   * Get all products for a creator (to find products for subscription)
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
   * Get product by ID (queries GSI1 to find product across all creators)
   */
  async getProductById(productId: string): Promise<any> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk',
        FilterExpression: 'productId = :productId',
        ExpressionAttributeValues: {
          ':pk': 'PRODUCT',
          ':productId': productId,
        },
        Limit: 1,
      })
    );

    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }
}
