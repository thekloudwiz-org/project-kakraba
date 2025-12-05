/**
 * File Upload Security Utilities
 * 
 * Implements file type validation and size limits for content uploads
 * Validates: Requirements 11.3
 */

// Allowed MIME types for content uploads
const ALLOWED_MIME_TYPES = {
  AUDIO: [
    'audio/mpeg',        // MP3
    'audio/mp4',         // M4A
    'audio/wav',         // WAV
    'audio/x-wav',       // WAV alternative
    'audio/flac',        // FLAC
    'audio/ogg',         // OGG
  ],
  VIDEO: [
    'video/mp4',         // MP4
    'video/mpeg',        // MPEG
    'video/quicktime',   // MOV
    'video/x-msvideo',   // AVI
    'video/webm',        // WebM
  ],
  PDF: [
    'application/pdf',   // PDF
  ],
  IMAGE: [
    'image/jpeg',        // JPEG
    'image/jpg',         // JPG
    'image/png',         // PNG
    'image/gif',         // GIF
    'image/webp',        // WebP
  ],
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  AUDIO: 500 * 1024 * 1024,  // 500 MB
  VIDEO: 2 * 1024 * 1024 * 1024,  // 2 GB
  PDF: 50 * 1024 * 1024,     // 50 MB
  IMAGE: 10 * 1024 * 1024,   // 10 MB
};

// Allowed file extensions
const ALLOWED_EXTENSIONS = {
  AUDIO: ['.mp3', '.m4a', '.wav', '.flac', '.ogg'],
  VIDEO: ['.mp4', '.mpeg', '.mov', '.avi', '.webm'],
  PDF: ['.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  contentType?: string;
}

/**
 * Validate file type based on MIME type and extension
 */
export function validateFileType(
  filename: string,
  mimeType: string,
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE'
): FileValidationResult {
  // Check MIME type
  const allowedMimeTypes = ALLOWED_MIME_TYPES[contentType];
  if (!allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${mimeType}. Allowed types for ${contentType}: ${allowedMimeTypes.join(', ')}`,
    };
  }

  // Check file extension
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const allowedExtensions = ALLOWED_EXTENSIONS[contentType];
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension: ${extension}. Allowed extensions for ${contentType}: ${allowedExtensions.join(', ')}`,
    };
  }

  return {
    valid: true,
    contentType,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(
  fileSize: number,
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE'
): FileValidationResult {
  const maxSize = FILE_SIZE_LIMITS[contentType];
  
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round(fileSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB for ${contentType}`,
    };
  }

  if (fileSize === 0) {
    return {
      valid: false,
      error: 'File size cannot be zero',
    };
  }

  return {
    valid: true,
  };
}

/**
 * Comprehensive file validation
 */
export function validateFile(
  filename: string,
  mimeType: string,
  fileSize: number,
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE'
): FileValidationResult {
  // Validate file type
  const typeValidation = validateFileType(filename, mimeType, contentType);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(fileSize, contentType);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return {
    valid: true,
    contentType,
  };
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  const basename = filename.split('/').pop() || filename;
  
  // Remove any special characters except alphanumeric, dash, underscore, and dot
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '.') {
    return `file_${Date.now()}`;
  }
  
  return sanitized;
}

/**
 * Generate safe S3 key for uploaded content
 */
export function generateS3Key(
  creatorId: string,
  contentId: string,
  filename: string
): string {
  // Sanitize all components to prevent path traversal
  const sanitizedCreatorId = sanitizeFilename(creatorId);
  const sanitizedContentId = sanitizeFilename(contentId);
  const sanitizedFilename = sanitizeFilename(filename);
  const timestamp = Date.now();
  
  return `content/${sanitizedCreatorId}/${sanitizedContentId}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Check if file extension matches MIME type
 */
export function extensionMatchesMimeType(
  filename: string,
  mimeType: string
): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  // Map extensions to expected MIME types
  const extensionMimeMap: Record<string, string[]> = {
    '.mp3': ['audio/mpeg'],
    '.m4a': ['audio/mp4'],
    '.wav': ['audio/wav', 'audio/x-wav'],
    '.flac': ['audio/flac'],
    '.ogg': ['audio/ogg'],
    '.mp4': ['video/mp4'],
    '.mpeg': ['video/mpeg'],
    '.mov': ['video/quicktime'],
    '.avi': ['video/x-msvideo'],
    '.webm': ['video/webm'],
    '.pdf': ['application/pdf'],
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    '.webp': ['image/webp'],
  };
  
  const expectedMimeTypes = extensionMimeMap[extension];
  if (!expectedMimeTypes) {
    return false;
  }
  
  return expectedMimeTypes.includes(mimeType);
}
