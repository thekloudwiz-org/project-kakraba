import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBRepository } from '../repositories/DynamoDBRepository';
import { randomUUID } from 'crypto';

export interface ContentMetadata {
  contentId: string;
  userId: string;
  title: string;
  description: string;
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';
  s3Key: string;
  fileSize: number;
  uploadedAt: string;
  thumbnailUrl?: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: string;
  fileSize: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  contentId: string;
  s3Key: string;
}

export class ContentService {
  private s3Client: S3Client;
  private repository: DynamoDBRepository;
  private bucketName: string;

  constructor(bucketName: string, repository: DynamoDBRepository) {
    this.s3Client = new S3Client({});
    this.repository = repository;
    this.bucketName = bucketName;
  }

  /**
   * Generate presigned URL for S3 upload
   */
  async getUploadUrl(
    userId: string,
    request: UploadUrlRequest
  ): Promise<UploadUrlResponse> {
    // Generate unique content ID
    const contentId = randomUUID();

    // Create S3 key: user-content/{userId}/{contentId}/{filename}
    const s3Key = `user-content/${userId}/${contentId}/${request.filename}`;

    // Create presigned POST URL for S3 upload
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: request.contentType,
      ContentLength: request.fileSize,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return {
      uploadUrl,
      contentId,
      s3Key,
    };
  }

  /**
   * Create content metadata record
   */
  async createContent(
    userId: string,
    metadata: Omit<ContentMetadata, 'userId' | 'uploadedAt'>
  ): Promise<ContentMetadata> {
    const content: ContentMetadata = {
      ...metadata,
      userId,
      uploadedAt: new Date().toISOString(),
    };

    // Store in DynamoDB
    await this.repository.createContent(content);

    return content;
  }

  /**
   * List user's content
   */
  async listContent(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      contentType?: string;
    }
  ): Promise<{
    items: ContentMetadata[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 12;

    const result = await this.repository.listUserContent(userId, {
      limit,
      contentType: options?.contentType,
    });

    // Simple pagination (for MVP)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = result.items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: result.items.length,
      page,
      limit,
    };
  }

  /**
   * Get single content item
   */
  async getContent(
    userId: string,
    contentId: string
  ): Promise<ContentMetadata | null> {
    return await this.repository.getContent(userId, contentId);
  }

  /**
   * Update content metadata
   */
  async updateContent(
    userId: string,
    contentId: string,
    updates: Partial<Pick<ContentMetadata, 'title' | 'description' | 'thumbnailUrl'>>
  ): Promise<ContentMetadata> {
    const updated = await this.repository.updateContent(userId, contentId, updates);
    return updated;
  }

  /**
   * Delete content
   */
  async deleteContent(
    userId: string,
    contentId: string
  ): Promise<void> {
    // Get content metadata to find S3 key
    const content = await this.repository.getContent(userId, contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: content.s3Key,
    });
    await this.s3Client.send(deleteCommand);

    // Delete from DynamoDB
    await this.repository.deleteContent(userId, contentId);
  }
}
