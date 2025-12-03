/**
 * Unit tests for user management handlers
 * Requirements: 1.5, 1.6, 5.5, 5.6
 */

import { getUserProfile, updateUserProfile } from './profile';
import { getUserContent } from './content';
import { getUserPurchases } from './purchases';
import { getUserSubscriptions } from './subscriptions';
import { UserRepository } from '../repositories/UserRepository';

// Mock the UserRepository
jest.mock('../repositories/UserRepository');

describe('User Management Handlers', () => {
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo = new UserRepository('test-table', 'eu-central-1') as jest.Mocked<UserRepository>;
    
    // Mock all repository methods
    jest.spyOn(UserRepository.prototype, 'getUserProfile').mockImplementation(
      mockUserRepo.getUserProfile
    );
    jest.spyOn(UserRepository.prototype, 'updateUserProfile').mockImplementation(
      mockUserRepo.updateUserProfile
    );
    jest.spyOn(UserRepository.prototype, 'getUserContent').mockImplementation(
      mockUserRepo.getUserContent
    );
    jest.spyOn(UserRepository.prototype, 'getUserPurchases').mockImplementation(
      mockUserRepo.getUserPurchases
    );
    jest.spyOn(UserRepository.prototype, 'getUserSubscriptions').mockImplementation(
      mockUserRepo.getUserSubscriptions
    );
  });

  describe('getUserProfile', () => {
    it('should return 200 with user profile when user exists', async () => {
      const mockUser = {
        userId: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        userType: 'CREATOR' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockUserRepo.getUserProfile.mockResolvedValue(mockUser);

      const result = await getUserProfile('test-user-id');

      expect(result).toHaveProperty('statusCode', 200);
      expect(mockUserRepo.getUserProfile).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 404 when user does not exist', async () => {
      mockUserRepo.getUserProfile.mockResolvedValue(null);

      const result = await getUserProfile('non-existent-user');

      expect(result).toHaveProperty('statusCode', 404);
    });
  });

  describe('updateUserProfile', () => {
    it('should return 200 when updating with valid data', async () => {
      const mockUser = {
        userId: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Updated Name',
        userType: 'CREATOR' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      mockUserRepo.updateUserProfile.mockResolvedValue(mockUser);

      const result = await updateUserProfile('test-user-id', { displayName: 'Updated Name' });

      expect(result).toHaveProperty('statusCode', 200);
      expect(mockUserRepo.updateUserProfile).toHaveBeenCalled();
    });

    it('should return 400 when no fields are provided', async () => {
      const result = await updateUserProfile('test-user-id', {});

      expect(result).toHaveProperty('statusCode', 400);
    });
  });

  describe('getUserContent', () => {
    it('should return 200 with content list', async () => {
      const mockContent = {
        items: [
          {
            contentId: 'content-1',
            title: 'Test Content',
            description: 'Description',
            contentType: 'VIDEO',
            uploadedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      };

      mockUserRepo.getUserContent.mockResolvedValue(mockContent);

      const result = await getUserContent('test-user-id', {});

      expect(result).toHaveProperty('statusCode', 200);
      expect(mockUserRepo.getUserContent).toHaveBeenCalledWith('test-user-id', {});
    });
  });

  describe('getUserPurchases', () => {
    it('should return 200 with purchases list', async () => {
      const mockPurchases = {
        items: [
          {
            transactionId: 'txn-1',
            productId: 'product-1',
            amount: 9.99,
            currency: 'USD',
            status: 'COMPLETED',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      };

      mockUserRepo.getUserPurchases.mockResolvedValue(mockPurchases);

      const result = await getUserPurchases('test-user-id', {});

      expect(result).toHaveProperty('statusCode', 200);
      expect(mockUserRepo.getUserPurchases).toHaveBeenCalledWith('test-user-id', {});
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return 200 with subscriptions list', async () => {
      const mockSubscriptions = [
        {
          subscriptionId: 'sub-1',
          creatorId: 'creator-1',
          status: 'ACTIVE',
          currentPeriodStart: '2024-01-01T00:00:00.000Z',
          currentPeriodEnd: '2024-02-01T00:00:00.000Z',
        },
      ];

      mockUserRepo.getUserSubscriptions.mockResolvedValue(mockSubscriptions);

      const result = await getUserSubscriptions('test-user-id');

      expect(result).toHaveProperty('statusCode', 200);
      expect(mockUserRepo.getUserSubscriptions).toHaveBeenCalledWith('test-user-id');
    });
  });
});
