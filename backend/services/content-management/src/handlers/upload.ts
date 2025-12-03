import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { ContentRepository } from '../repositories/ContentRepository';
import { S3Service } from '../utils/s3';
import {
  validateFileType,
  validateFileSize,
  generateS3Key,
  getContentTypeFromMime,
} from '../utils/fileValidation';
import { CreateUploadUrlRequest, CreateContentRequest, Content } from '../types';

const tableName = process.env.TABLE_NAME || '';
const contentBucket = process.env.CONTENT_BUCKET || '';
const region = process.env.AWS_REGION || 'eu-central-1';

const contentRepo = new ContentRepository(tableName, region);
const s3Service = new S3Service(contentBucket, region);

/**
 * POST /content/upload-url
 * Generate presigned S3 URL for content upload
 */
export async function createUploadUrl(
  userId: string,
  request: CreateUploadUrlRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const { filename, contentType: mimeType, fileSize } = request;

    // Validate input
    if (!filename || !mimeType || !fileSize) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing required fields: filename, contentType, fileSize',
        }),
      };
    }

    // Validate file size
    const sizeValidation = validateFileSize(fileSize);
    if (!sizeValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: sizeValidation.error,
        }),
      };
    }

    // Get content type from MIME type
    const contentType = getContentTypeFromMime(mimeType);
    if (!contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: `Unsupported MIME type: ${mimeType}`,
        }),
      };
    }

    // Validate file type
    const typeValidation = validateFileType(contentType, mimeType);
    if (!typeValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: typeValidation.error,
        }),
      };
    }

    // Generate unique content ID
    const contentId = uuidv4();

    // Generate S3 key
    const s3Key = generateS3Key(userId, contentId, filename);

    // Generate presigned URL
    const uploadUrl = await s3Service.generateUploadUrl(s3Key, mimeType);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl,
        contentId,
        s3Key,
      }),
    };
  } catch (error) {
    console.error('Error creating upload URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * POST /content
 * Create content record after successful upload
 */
export async function createContent(
  userId: string,
  request: CreateContentRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const {
      contentId,
      title,
      description,
      contentType,
      s3Key,
      fileSize,
      duration,
      thumbnailUrl,
    } = request;

    // Validate required fields
    if (!contentId || !title || !description || !contentType || !s3Key || !fileSize) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message:
            'Missing required fields: contentId, title, description, contentType, s3Key, fileSize',
        }),
      };
    }

    // Validate content type
    if (!['AUDIO', 'VIDEO', 'PDF', 'IMAGE'].includes(contentType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid content type. Must be one of: AUDIO, VIDEO, PDF, IMAGE',
        }),
      };
    }

    // Create content object
    const content: Content = {
      contentId,
      creatorId: userId,
      title,
      description,
      contentType: contentType as 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE',
      s3Key,
      s3Bucket: contentBucket,
      fileSize,
      duration,
      thumbnailUrl,
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    const savedContent = await contentRepo.createContent(content);

    return {
      statusCode: 201,
      body: JSON.stringify(savedContent),
    };
  } catch (error) {
    console.error('Error creating content:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
