import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type
 */
export function validateFileType(
  contentType: string,
  mimeType: string
): ValidationResult {
  const allowedTypes = ALLOWED_CONTENT_TYPES[contentType as keyof typeof ALLOWED_CONTENT_TYPES];

  if (!allowedTypes) {
    return {
      valid: false,
      error: `Invalid content type: ${contentType}. Must be one of: AUDIO, VIDEO, PDF, IMAGE`,
    };
  }

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${mimeType} for content type ${contentType}. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number): ValidationResult {
  if (fileSize <= 0) {
    return {
      valid: false,
      error: 'File size must be greater than 0',
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get content type from MIME type
 */
export function getContentTypeFromMime(mimeType: string): string | null {
  for (const [contentType, mimeTypes] of Object.entries(ALLOWED_CONTENT_TYPES)) {
    if (mimeTypes.includes(mimeType)) {
      return contentType;
    }
  }
  return null;
}

/**
 * Generate S3 key for content
 */
export function generateS3Key(creatorId: string, contentId: string, filename: string): string {
  const extension = filename.split('.').pop() || '';
  return `content/${creatorId}/${contentId}.${extension}`;
}
