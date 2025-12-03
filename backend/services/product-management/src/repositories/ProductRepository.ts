import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { Product, ProductEntity, UpdateProductRequest } from '../types';

export class ProductRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(tableName: string, region: string = 'eu-central-1') {
    const client = new DynamoDBClient({ region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  /**
   * Create product
   */
  async createProduct(product: Product): Promise<Product> {
    const entity: ProductEntity = {
      PK: `CREATOR#${product.creatorId}`,
      SK: `PRODUCT#${product.productId}`,
      productId: product.productId,
      creatorId: product.creatorId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      contentIds: product.contentIds,
      accessType: product.accessType,
      downloadQuota: product.downloadQuota,
      allowSubscription: product.allowSubscription,
      productType: product.productType,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      GSI1PK: 'PRODUCT',
      GSI1SK: product.createdAt,
      GSI2PK: 'PRODUCT',
      GSI2SK: product.price,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: entity,
      })
    );

    return product;
  }

  /**
   * Get product by ID
   */
  async getProduct(creatorId: string, productId: string): Promise<Product | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `CREATOR#${creatorId}`,
          SK: `PRODUCT#${productId}`,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.entityToProduct(result.Item as ProductEntity);
  }

  /**
   * List products
   */
  async listProducts(
    creatorId: string,
    options: { page?: string; limit?: string; productType?: string; minPrice?: number; maxPrice?: number } = {}
  ): Promise<{ items: Product[]; nextToken?: string }> {
    const limit = parseInt(options.limit || '20', 10);

    const params: any = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CREATOR#${creatorId}`,
        ':sk': 'PRODUCT#',
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
      ExclusiveStartKey: options.page ? JSON.parse(options.page) : undefined,
    };

    // Add filters
    const filterExpressions: string[] = [];
    
    if (options.productType) {
      filterExpressions.push('productType = :productType');
      params.ExpressionAttributeValues[':productType'] = options.productType;
    }

    if (options.minPrice !== undefined) {
      filterExpressions.push('price >= :minPrice');
      params.ExpressionAttributeValues[':minPrice'] = options.minPrice;
    }

    if (options.maxPrice !== undefined) {
      filterExpressions.push('price <= :maxPrice');
      params.ExpressionAttributeValues[':maxPrice'] = options.maxPrice;
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
    }

    const result = await this.docClient.send(new QueryCommand(params));

    return {
      items: (result.Items || []).map((item) =>
        this.entityToProduct(item as ProductEntity)
      ),
      nextToken: result.LastEvaluatedKey
        ? JSON.stringify(result.LastEvaluatedKey)
        : undefined,
    };
  }

  /**
   * Update product
   */
  async updateProduct(
    creatorId: string,
    productId: string,
    updates: UpdateProductRequest
  ): Promise<Product> {
    // First get the existing product
    const existing = await this.getProduct(creatorId, productId);
    if (!existing) {
      throw new Error('Product not found');
    }

    // Merge updates
    const updated: ProductEntity = {
      PK: `CREATOR#${creatorId}`,
      SK: `PRODUCT#${productId}`,
      productId,
      creatorId,
      title: updates.title ?? existing.title,
      description: updates.description ?? existing.description,
      price: updates.price ?? existing.price,
      currency: existing.currency,
      contentIds: updates.contentIds ?? existing.contentIds,
      accessType: updates.accessType ?? existing.accessType,
      downloadQuota: updates.downloadQuota ?? existing.downloadQuota,
      allowSubscription: updates.allowSubscription ?? existing.allowSubscription,
      productType: existing.productType,
      isActive: updates.isActive ?? existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      GSI1PK: 'PRODUCT',
      GSI1SK: existing.createdAt,
      GSI2PK: 'PRODUCT',
      GSI2SK: updates.price ?? existing.price,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      })
    );

    return this.entityToProduct(updated);
  }

  /**
   * Delete product
   */
  async deleteProduct(creatorId: string, productId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `CREATOR#${creatorId}`,
          SK: `PRODUCT#${productId}`,
        },
      })
    );
  }

  /**
   * Convert DynamoDB entity to Product object
   */
  private entityToProduct(entity: ProductEntity): Product {
    return {
      productId: entity.productId,
      creatorId: entity.creatorId,
      title: entity.title,
      description: entity.description,
      price: entity.price,
      currency: entity.currency,
      contentIds: entity.contentIds,
      accessType: entity.accessType,
      downloadQuota: entity.downloadQuota,
      allowSubscription: entity.allowSubscription,
      productType: entity.productType,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
