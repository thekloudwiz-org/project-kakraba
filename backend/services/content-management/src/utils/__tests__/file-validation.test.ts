/**
 * File Validation Tests
 * 
 * Tests file type and size validation
 */

import {
  validateFileType,
  validateFileSize,
  validateFile,
  sanitizeFilename,
  generateS3Key,
  extensionMatchesMimeType,
} from '../file-validation';

describe('File Validation', () => {
  describe('validateFileType', () => {
    it('should accept valid audio file', () => {
      const result = validateFileType('song.mp3', 'audio/mpeg', 'AUDIO');
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe('AUDIO');
    });

    it('should accept valid video file', () => {
      const result = validateFileType('video.mp4', 'video/mp4', 'VIDEO');
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe('VIDEO');
    });

    it('should accept valid PDF file', () => {
      const result = validateFileType('document.pdf', 'application/pdf', 'PDF');
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe('PDF');
    });

    it('should accept valid image file', () => {
      const result = validateFileType('image.jpg', 'image/jpeg', 'IMAGE');
      expect(result.valid).toBe(true);
      expect(result.contentType).toBe('IMAGE');
    });

    it('should reject invalid MIME type', () => {
      const result = validateFileType('file.exe', 'application/x-msdownload', 'AUDIO');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid MIME type');
    });

    it('should reject invalid file extension', () => {
      const result = validateFileType('file.txt', 'audio/mpeg', 'AUDIO');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file extension');
    });
  });

  describe('validateFileSize', () => {
    it('should accept file within size limit', () => {
      const result = validateFileSize(10 * 1024 * 1024, 'AUDIO'); // 10 MB
      expect(result.valid).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      const result = validateFileSize(600 * 1024 * 1024, 'AUDIO'); // 600 MB
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should reject zero-size file', () => {
      const result = validateFileSize(0, 'AUDIO');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be zero');
    });

    it('should enforce different limits for different content types', () => {
      // Video should allow larger files than audio
      const audioResult = validateFileSize(1 * 1024 * 1024 * 1024, 'AUDIO'); // 1 GB
      const videoResult = validateFileSize(1 * 1024 * 1024 * 1024, 'VIDEO'); // 1 GB
      
      expect(audioResult.valid).toBe(false);
      expect(videoResult.valid).toBe(true);
    });
  });

  describe('validateFile', () => {
    it('should accept valid file', () => {
      const result = validateFile('song.mp3', 'audio/mpeg', 10 * 1024 * 1024, 'AUDIO');
      expect(result.valid).toBe(true);
    });

    it('should reject file with invalid type', () => {
      const result = validateFile('file.exe', 'application/x-msdownload', 1024, 'AUDIO');
      expect(result.valid).toBe(false);
    });

    it('should reject file with invalid size', () => {
      const result = validateFile('song.mp3', 'audio/mpeg', 600 * 1024 * 1024, 'AUDIO');
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path components', () => {
      const result = sanitizeFilename('../../../etc/passwd');
      expect(result).not.toContain('/');
      expect(result).not.toContain('..');
    });

    it('should remove special characters', () => {
      const result = sanitizeFilename('file<>:"|?*.txt');
      expect(result).toMatch(/^[a-zA-Z0-9._-]+$/);
    });

    it('should preserve valid characters', () => {
      const result = sanitizeFilename('my-file_123.mp3');
      expect(result).toBe('my-file_123.mp3');
    });

    it('should handle empty filename', () => {
      const result = sanitizeFilename('');
      expect(result).toMatch(/^file_\d+$/);
    });
  });

  describe('generateS3Key', () => {
    it('should generate valid S3 key', () => {
      const key = generateS3Key('creator123', 'content456', 'song.mp3');
      expect(key).toMatch(/^content\/creator123\/content456\/\d+_song\.mp3$/);
    });

    it('should sanitize filename in S3 key', () => {
      const key = generateS3Key('creator123', 'content456', '../../../etc/passwd');
      expect(key).not.toContain('..');
      expect(key).not.toContain('/etc/');
    });
  });

  describe('extensionMatchesMimeType', () => {
    it('should match valid extension and MIME type', () => {
      expect(extensionMatchesMimeType('file.mp3', 'audio/mpeg')).toBe(true);
      expect(extensionMatchesMimeType('file.mp4', 'video/mp4')).toBe(true);
      expect(extensionMatchesMimeType('file.pdf', 'application/pdf')).toBe(true);
      expect(extensionMatchesMimeType('file.jpg', 'image/jpeg')).toBe(true);
    });

    it('should reject mismatched extension and MIME type', () => {
      expect(extensionMatchesMimeType('file.mp3', 'video/mp4')).toBe(false);
      expect(extensionMatchesMimeType('file.pdf', 'image/jpeg')).toBe(false);
    });

    it('should handle case-insensitive extensions', () => {
      expect(extensionMatchesMimeType('file.MP3', 'audio/mpeg')).toBe(true);
      expect(extensionMatchesMimeType('file.PDF', 'application/pdf')).toBe(true);
    });
  });
});
