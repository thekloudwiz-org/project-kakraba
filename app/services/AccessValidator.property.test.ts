import * as fc from 'fast-check';
import { AccessValidator } from './AccessValidator';
import { DynamoDBRepository } from '../repositories/DynamoDBRepository';
import { AccessType, Intent, ProductType } from '../types';

// Mock the repository
jest.mock('../repositories/DynamoDBRepository');

describe('AccessValidator Property Tests', () => {
  let validator: AccessValidator;
  let mockRepository: jest.Mocked<DynamoDBRepository>;

  beforeEach(() => {
    mockRepository = {
      getAccessRight: jest.fn(),
      getProduct: jest.fn(),
      hasValidSubscription: jest.fn(),
      decrementDownloads: jest.fn()
    } as any;
    validator = new AccessValidator(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Feature: content-access-control, Property 1: Purchase access allows unlimited streaming
  describe('Property 1: Purchase access allows unlimited streaming', () => {
    it('should always allow streaming for any purchase access', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            productId: fc.uuid(),
            creatorId: fc.uuid(),
            downloadsRemaining: fc.integer({ min: 0, max: 3 }),
            s3Key: fc.string({ minLength: 5 }),
            title: fc.string({ minLength: 1 })
          }),
          async ({ userId, productId, creatorId, downloadsRemaining, s3Key, title }) => {
            // Setup: User has purchase access
            mockRepository.getAccessRight.mockResolvedValue({
              PK: `USER#${userId}`,
              SK: `RIGHT#${productId}`,
              access_type: AccessType.PURCHASE,
              downloads_remaining: downloadsRemaining,
              purchase_date: '2024-01-01T00:00:00Z',
              creator_id: creatorId
            });

            mockRepository.getProduct.mockResolvedValue({
              PK: `CREATOR#${creatorId}`,
              SK: `PROD#${productId}`,
              type: ProductType.AUDIO,
              allow_subscription: true,
              price_one_time: 9.99,
              s3_key_source: s3Key,
              title: title,
              created_at: '2024-01-01T00:00:00Z'
            });

            // Action: Request stream access
            const result = await validator.validateAccess(userId, productId, Intent.STREAM);

            // Property: Should always be allowed
            expect(result.allowed).toBe(true);
            expect(result.accessType).toBe(AccessType.PURCHASE);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: content-access-control, Property 3: Streaming preserves download counter
  describe('Property 3: Streaming preserves download counter', () => {
    it('should not affect downloads_remaining when streaming', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            productId: fc.uuid(),
            creatorId: fc.uuid(),
            downloadsRemaining: fc.integer({ min: 0, max: 3 })
          }),
          async ({ userId, productId, creatorId, downloadsRemaining }) => {
            mockRepository.getAccessRight.mockResolvedValue({
              PK: `USER#${userId}`,
              SK: `RIGHT#${productId}`,
              access_type: AccessType.PURCHASE,
              downloads_remaining: downloadsRemaining,
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

            // Action: Stream access
            const result = await validator.validateAccess(userId, productId, Intent.STREAM);

            // Property: downloads_remaining should be unchanged in result
            expect(result.downloadsRemaining).toBe(downloadsRemaining);
            // Verify decrementDownloads was NOT called
            expect(mockRepository.decrementDownloads).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: content-access-control, Property 5: Download with remaining quota succeeds
  describe('Property 5: Download with remaining quota succeeds', () => {
    it('should allow download when downloads_remaining > 0', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            productId: fc.uuid(),
            creatorId: fc.uuid(),
            downloadsRemaining: fc.integer({ min: 1, max: 3 }) // Always > 0
          }),
          async ({ userId, productId, creatorId, downloadsRemaining }) => {
            mockRepository.getAccessRight.mockResolvedValue({
              PK: `USER#${userId}`,
              SK: `RIGHT#${productId}`,
              access_type: AccessType.PURCHASE,
              downloads_remaining: downloadsRemaining,
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

            // Action: Request download
            const result = await validator.validateAccess(userId, productId, Intent.DOWNLOAD);

            // Property: Should be allowed when counter > 0
            expect(result.allowed).toBe(true);
            expect(result.accessType).toBe(AccessType.PURCHASE);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Edge case test - moved to unit tests since it's a specific boundary condition
    it('should deny download when downloads_remaining = 0', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';
      
      const testRepo = {
        getAccessRight: jest.fn().mockResolvedValue({
          PK: `USER#${userId}`,
          SK: `RIGHT#${productId}`,
          access_type: AccessType.PURCHASE,
          downloads_remaining: 0,
          purchase_date: '2024-01-01T00:00:00Z',
          creator_id: creatorId
        }),
        getProduct: jest.fn().mockResolvedValue({
          PK: `CREATOR#${creatorId}`,
          SK: `PROD#${productId}`,
          type: ProductType.AUDIO,
          allow_subscription: true,
          price_one_time: 9.99,
          s3_key_source: 'audio/song.mp3',
          title: 'Test Song',
          created_at: '2024-01-01T00:00:00Z'
        }),
        hasValidSubscription: jest.fn(),
        decrementDownloads: jest.fn()
      } as any;
      
      const testValidator = new AccessValidator(testRepo);
      const result = await testValidator.validateAccess(userId, productId, Intent.DOWNLOAD);

      expect(result.allowed).toBe(false);
      expect(result.errorMessage).toBe('Download limit reached');
    });
  });

  // Feature: content-access-control, Property 9: Subscription allows only streaming
  describe('Property 9: Subscription allows only streaming', () => {
    it('should allow streaming for subscription access', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            productId: fc.uuid(),
            creatorId: fc.uuid()
          }),
          async ({ userId, productId, creatorId }) => {
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
              type: ProductType.AUDIO,
              allow_subscription: true,
              price_one_time: 9.99,
              s3_key_source: 'audio/song.mp3',
              title: 'Test Song',
              created_at: '2024-01-01T00:00:00Z'
            });

            // Action: Request stream
            const result = await validator.validateAccess(userId, productId, Intent.STREAM);

            // Property: Should be allowed
            expect(result.allowed).toBe(true);
            expect(result.accessType).toBe(AccessType.SUBSCRIPTION);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Edge case test - moved to unit tests since it's a specific boundary condition
    it('should deny download for subscription access', async () => {
      const userId = 'user-123';
      const productId = 'prod-456';
      const creatorId = 'creator-789';
      
      const testRepo = {
        getAccessRight: jest.fn().mockResolvedValue({
          PK: `USER#${userId}`,
          SK: `RIGHT#${productId}`,
          access_type: AccessType.SUBSCRIPTION,
          downloads_remaining: 0,
          purchase_date: '2024-01-01T00:00:00Z',
          creator_id: creatorId
        }),
        getProduct: jest.fn().mockResolvedValue({
          PK: `CREATOR#${creatorId}`,
          SK: `PROD#${productId}`,
          type: ProductType.VIDEO,
          allow_subscription: true,
          price_one_time: 19.99,
          s3_key_source: 'video/movie.mp4',
          title: 'Test Video',
          created_at: '2024-01-01T00:00:00Z'
        }),
        hasValidSubscription: jest.fn(),
        decrementDownloads: jest.fn()
      } as any;
      
      const testValidator = new AccessValidator(testRepo);
      const result = await testValidator.validateAccess(userId, productId, Intent.DOWNLOAD);

      expect(result.allowed).toBe(false);
      expect(result.errorMessage).toBe('Subscription does not allow downloads');
    });
  });
});
