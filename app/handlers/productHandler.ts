import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class ProductHandler {
  constructor(private tableName: string) {}

  async handle(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    const method = event.requestContext.http.method;
    const path = event.rawPath;

    try {
      // Extract user ID from Cognito authorizer (JWT claims in V2 format)
      const userId = (event.requestContext as any).authorizer?.jwt?.claims?.sub as string;
      
      if (!userId) {
        return this.errorResponse(401, 'Unauthorized', 'User not authenticated');
      }

      // POST /products - Create product
      if (method === 'POST' && path === '/products') {
        return await this.createProduct(event, userId);
      }

      // GET /products - List products
      if (method === 'GET' && path === '/products') {
        return await this.listProducts(event, userId);
      }

      // GET /products/{productId} - Get product
      if (method === 'GET' && path.match(/^\/products\/[^/]+$/)) {
        const productId = path.split('/')[2];
        return await this.getProduct(productId, userId);
      }

      // PUT /products/{productId} - Update product
      if (method === 'PUT' && path.match(/^\/products\/[^/]+$/)) {
        const productId = path.split('/')[2];
        return await this.updateProduct(event, productId, userId);
      }

      // DELETE /products/{productId} - Delete product
      if (method === 'DELETE' && path.match(/^\/products\/[^/]+$/)) {
        const productId = path.split('/')[2];
        return await this.deleteProduct(productId, userId);
      }

      return this.errorResponse(404, 'NotFound', 'Endpoint not found');
    } catch (error: any) {
      console.error('Error in product handler:', error);
      return this.errorResponse(500, 'InternalServerError', error.message);
    }
  }

  private async createProduct(event: APIGatewayProxyEventV2, userId: string): Promise<APIGatewayProxyResultV2> {
    const body = JSON.parse(event.body || '{}');
    
    const productId = `prod-${uuidv4()}`;
    const now = new Date().toISOString();

    const product = {
      PK: `USER#${userId}`,
      SK: `PRODUCT#${productId}`,
      productId,
      creatorId: userId,
      title: body.title,
      description: body.description,
      price: body.price,
      contentIds: body.contentIds || [],
      accessType: body.accessType || 'PURCHASE',
      downloadQuota: body.downloadQuota || 0,
      allowSubscription: body.allowSubscription || false,
      productType: body.productType || 'SINGLE',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: product,
    }));

    return this.successResponse(product);
  }

  private async listProducts(_event: APIGatewayProxyEventV2, userId: string): Promise<APIGatewayProxyResultV2> {
    const result = await docClient.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'PRODUCT#',
      },
    }));

    const products = result.Items || [];
    
    return this.successResponse({
      items: products,
      total: products.length,
    });
  }

  private async getProduct(productId: string, userId: string): Promise<APIGatewayProxyResultV2> {
    const result = await docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: `PRODUCT#${productId}`,
      },
    }));

    if (!result.Item) {
      return this.errorResponse(404, 'NotFound', 'Product not found');
    }

    return this.successResponse(result.Item);
  }

  private async updateProduct(event: APIGatewayProxyEventV2, productId: string, userId: string): Promise<APIGatewayProxyResultV2> {
    const body = JSON.parse(event.body || '{}');
    const now = new Date().toISOString();

    const updateExpression: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    if (body.title !== undefined) {
      updateExpression.push('#title = :title');
      expressionAttributeNames['#title'] = 'title';
      expressionAttributeValues[':title'] = body.title;
    }

    if (body.description !== undefined) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = body.description;
    }

    if (body.price !== undefined) {
      updateExpression.push('price = :price');
      expressionAttributeValues[':price'] = body.price;
    }

    if (body.isActive !== undefined) {
      updateExpression.push('isActive = :isActive');
      expressionAttributeValues[':isActive'] = body.isActive;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = now;

    await docClient.send(new UpdateCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: `PRODUCT#${productId}`,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ...(Object.keys(expressionAttributeNames).length > 0 && { ExpressionAttributeNames: expressionAttributeNames }),
    }));

    return this.successResponse({ message: 'Product updated successfully' });
  }

  private async deleteProduct(productId: string, userId: string): Promise<APIGatewayProxyResultV2> {
    await docClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: {
        PK: `USER#${userId}`,
        SK: `PRODUCT#${productId}`,
      },
    }));

    return this.successResponse({ message: 'Product deleted successfully' });
  }

  private successResponse(data: any): APIGatewayProxyResultV2 {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  }

  private errorResponse(statusCode: number, error: string, message: string): APIGatewayProxyResultV2 {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error, message }),
    };
  }
}
