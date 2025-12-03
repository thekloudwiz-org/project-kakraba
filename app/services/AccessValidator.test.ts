import { AccessValidator } from './AccessValidator';
import { AccessType, Intent, ProductType } from '../types';

describe('AccessValidator Unit Tests', () => {
  let validator: AccessValidator;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = {
      getAccessRight: jest.fn(),
      getProduct: jest.fn(),
      hasValidSubscription: jest.fn(),
      decrementDownloads: jest.fn()
    };
    validator = new AccessValidator(mockRepository);
  });

  describe('Edge Case: downloads_remaining = 0', () => {
    it('should deny download when downloads_remaining is 0', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.PURCHASE,
        downloads_remaining: 0,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue({
        PK: `CREATOR#${creatorId}`,
        SK: `PROD#${productId}`,
        type: ProductType.AUDIO,
        allow_subscription: true,
        price_one_time: 9.99,
        s3_key_source: 'audio/song.mp3',
        title: 'Test Song',
        created_at: '2024-01-01T00:00:00Z'
      });

      const result = await validator.validateAccess(userId, productId, Intent.DOWNLOAD);

      expect(result.allowed).toBe(false);
      expect(result.errorMessage).toBe('Download limit reached');
    });

    it('should still allow streaming when downloads_remaining is 0', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.PURCHASE,
        downloads_remaining: 0,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue({
        PK: `CREATOR#${creatorId}`,
        SK: `PROD#${productId}`,
        type: ProductType.AUDIO,
        allow_subscription: true,
        price_one_time: 9.99,
        s3_key_source: 'audio/song.mp3',
        title: 'Test Song',
        created_at: '2024-01-01T00:00:00Z'
      });

      const result = await validator.validateAccess(userId, productId, Intent.STREAM);

      expect(result.allowed).toBe(true);
      expect(result.accessType).toBe(AccessType.PURCHASE);
    });
  });

  describe('Edge Case: Subscription download attempts', () => {
    it('should deny download for subscription access', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.SUBSCRIPTION,
        downloads_remaining: 0,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue({
        PK: `CREATOR#${creatorId}`,
        SK: `PROD#${productId}`,
        type: ProductType.VIDEO,
        allow_subscription: true,
        price_one_time: 19.99,
        s3_key_source: 'video/movie.mp4',
        title: 'Test Video',
        created_at: '2024-01-01T00:00:00Z'
      });

      const result = await validator.validateAccess(userId, productId, Intent.DOWNLOAD);

      expect(result.allowed).toBe(false);
      expect(result.errorMessage).toBe('Subscription does not allow downloads');
    });

    it('should allow streaming for subscription access', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.SUBSCRIPTION,
        downloads_remaining: 0,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue({
        PK: `CREATOR#${creatorId}`,
        SK: `PROD#${productId}`,
        type: ProductType.VIDEO,
        allow_subscription: true,
        price_one_time: 19.99,
        s3_key_source: 'video/movie.mp4',
        title: 'Test Video',
        created_at: '2024-01-01T00:00:00Z'
      });

      const result = await validator.validateAccess(userId, productId, Intent.STREAM);

      expect(result.allowed).toBe(true);
      expect(result.accessType).toBe(AccessType.SUBSCRIPTION);
    });
  });

  describe('Edge Case: Missing product', () => {
    it('should return error when product is not found', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.PURCHASE,
        downloads_remaining: 3,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue(null);

      const result = await validator.validateAccess(userId, productId, Intent.STREAM);

      expect(result.allowed).toBe(false);
      expect(result.errorMessage).toBe('Product not found');
    });
  });

  describe('Edge Case: No access rights', () => {
    it('should return error when user has no access rights', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';

      mockRepository.getAccessRight.mockResolvedValue(null);

      const result = await validator.validateAccess(userId, productId, Intent.STREAM);

      expect(result.allowed).toBe(false);
      expect(result.errorMessage).toBe('No access rights found');
    });
  });

  describe('Error message formatting', () => {
    it('should return proper error structure for download limit', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.PURCHASE,
        downloads_remaining: 0,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue({
        PK: `CREATOR#${creatorId}`,
        SK: `PROD#${productId}`,
        type: ProductType.BOOK,
        allow_subscription: false,
        price_one_time: 14.99,
        s3_key_source: 'documents/book.pdf',
        title: 'Test Book',
        created_at: '2024-01-01T00:00:00Z'
      });

      const result = await validator.validateAccess(userId, productId, Intent.DOWNLOAD);

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('errorMessage');
      expect(result.allowed).toBe(false);
      expect(typeof result.errorMessage).toBe('string');
      expect(result.errorMessage).toBeTruthy();
    });

    it('should return proper success structure with all required fields', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';

      mockRepository.getAccessRight.mockResolvedValue({
        PK: `USER#${userId}`,
        SK: `RIGHT#${productId}`,
        access_type: AccessType.PURCHASE,
        downloads_remaining: 2,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: creatorId
      });

      mockRepository.getProduct.mockResolvedValue({
        PK: `CREATOR#${creatorId}`,
        SK: `PROD#${productId}`,
        type: ProductType.AUDIO,
        allow_subscription: true,
        price_one_time: 9.99,
        s3_key_source: 'audio/song.mp3',
        title: 'Test Song',
        created_at: '2024-01-01T00:00:00Z'
      });

      const result = await validator.validateAccess(userId, productId, Intent.STREAM);

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('accessType');
      expect(result).toHaveProperty('downloadsRemaining');
      expect(result).toHaveProperty('s3Key');
      expect(result).toHaveProperty('filename');
      expect(result.allowed).toBe(true);
      expect(result.accessType).toBe(AccessType.PURCHASE);
      expect(result.downloadsRemaining).toBe(2);
      expect(result.s3Key).toBe('audio/song.mp3');
      expect(result.filename).toBe('Test Song');
    });
  });
});
