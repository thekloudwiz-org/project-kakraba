import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ContentService } from '../services/ContentService';
import { DynamoDBRepository } from '../repositories/DynamoDBRepository';

/**
 * Content Management Handler
 * Handles CRUD operations for user content
 */
export class ContentHandler {
  private contentService: ContentService;

  constructor(bucketName: string, tableName: string) {
    const repository = new DynamoDBRepository(tableName);
    this.contentService = new ContentService(bucketName, repository);
  }

  /**
   * Route content requests to appropriate handler
   */
  async handle(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
    console.log('Content handler received event:', JSON.stringify(event, null, 2));

    try {
      // Extract user ID from JWT claims
      // @ts-expect-error - AWS Lambda types don't properly type the JWT authorizer
      const userId = event.requestContext.authorizer?.jwt?.claims?.sub as string;
      if (!userId) {
        return this.errorResponse(401, 'Unauthorized', 'User ID not found in token');
      }

      const method = event.requestContext.http.method;
      const path = event.rawPath;

      // Route to appropriate handler
      if (method === 'POST' && path === '/content/upload-url') {
        return await this.getUploadUrl(event, userId);
      }

      if (method === 'POST' && path === '/content') {
        return await this.createContent(event, userId);
      }

      if (method === 'GET' && path === '/content') {
        return await this.listContent(event, userId);
      }

      if (method === 'GET' && path.startsWith('/content/')) {
        return await this.getContent(event, userId);
      }

      if (method === 'PUT' && path.startsWith('/content/')) {
        return await this.updateContent(event, userId);
      }

      if (method === 'DELETE' && path.startsWith('/content/')) {
        return await this.deleteContent(event, userId);
      }

      return this.errorResponse(404, 'NotFound', 'Endpoint not found');
    } catch (error: any) {
      console.error('Error in content handler:', error);
      return this.errorResponse(500, 'InternalServerError', error.message || 'Internal server error');
    }
  }

  /**
   * Generate S3 upload URL
   */
  private async getUploadUrl(
    event: APIGatewayProxyEventV2,
    userId: string
  ): Promise<APIGatewayProxyResultV2> {
    const body = JSON.parse(event.body || '{}');

    if (!body.filename || !body.contentType || !body.fileSize) {
      return this.errorResponse(400, 'BadRequest', 'Missing required fields: filename, contentType, fileSize');
    }

    const result = await this.contentService.getUploadUrl(userId, {
      filename: body.filename,
      contentType: body.contentType,
      fileSize: body.fileSize,
    });

    return this.successResponse(result);
  }

  /**
   * Create content metadata record
   */
  private async createContent(
    event: APIGatewayProxyEventV2,
    userId: string
  ): Promise<APIGatewayProxyResultV2> {
    const body = JSON.parse(event.body || '{}');

    if (!body.contentId || !body.title || !body.contentType || !body.s3Key || !body.fileSize) {
      return this.errorResponse(400, 'BadRequest', 'Missing required fields');
    }

    const content = await this.contentService.createContent(userId, {
      contentId: body.contentId,
      title: body.title,
      description: body.description || '',
      contentType: body.contentType,
      s3Key: body.s3Key,
      fileSize: body.fileSize,
      thumbnailUrl: body.thumbnailUrl,
    });

    return this.successResponse(content, 201);
  }

  /**
   * List user's content
   */
  private async listContent(
    event: APIGatewayProxyEventV2,
    userId: string
  ): Promise<APIGatewayProxyResultV2> {
    const params = event.queryStringParameters || {};
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 12;
    const contentType = params.contentType;

    const result = await this.contentService.listContent(userId, {
      page,
      limit,
      contentType,
    });

    return this.successResponse(result);
  }

  /**
   * Get single content item
   */
  private async getContent(
    event: APIGatewayProxyEventV2,
    userId: string
  ): Promise<APIGatewayProxyResultV2> {
    const contentId = event.pathParameters?.contentId;
    if (!contentId) {
      return this.errorResponse(400, 'BadRequest', 'Content ID required');
    }

    const content = await this.contentService.getContent(userId, contentId);
    if (!content) {
      return this.errorResponse(404, 'NotFound', 'Content not found');
    }

    return this.successResponse(content);
  }

  /**
   * Update content metadata
   */
  private async updateContent(
    event: APIGatewayProxyEventV2,
    userId: string
  ): Promise<APIGatewayProxyResultV2> {
    const contentId = event.pathParameters?.contentId;
    if (!contentId) {
      return this.errorResponse(400, 'BadRequest', 'Content ID required');
    }

    const body = JSON.parse(event.body || '{}');
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.thumbnailUrl !== undefined) updates.thumbnailUrl = body.thumbnailUrl;

    if (Object.keys(updates).length === 0) {
      return this.errorResponse(400, 'BadRequest', 'No updates provided');
    }

    const content = await this.contentService.updateContent(userId, contentId, updates);
    return this.successResponse(content);
  }

  /**
   * Delete content
   */
  private async deleteContent(
    event: APIGatewayProxyEventV2,
    userId: string
  ): Promise<APIGatewayProxyResultV2> {
    const contentId = event.pathParameters?.contentId;
    if (!contentId) {
      return this.errorResponse(400, 'BadRequest', 'Content ID required');
    }

    await this.contentService.deleteContent(userId, contentId);
    return this.successResponse({ message: 'Content deleted successfully' });
  }

  /**
   * Build success response
   */
  private successResponse(data: any, statusCode = 200): APIGatewayProxyResultV2 {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  }

  /**
   * Build error response
   */
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
