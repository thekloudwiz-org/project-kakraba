import { DynamoDBRepository } from './DynamoDBRepository';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { AccessType, ProductType } from '../types';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

describe('DynamoDBRepository', () => {
  let repository: DynamoDBRepository;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    (DynamoDBDocumentClient.from as jest.Mock) = jest.fn().mockReturnValue({
      send: mockSend
    });
    repository = new DynamoDBRepository('test-table');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessRight', () => {
    it('should return access right when it exists', async () => {
      const mockAccessRight = {
        PK: 'USER#user123',
        SK: 'RIGHT#prod456',
        access_type: AccessType.PURCHASE,
        downloads_remaining: 3,
        purchase_date: '2024-01-01T00:00:00Z',
        creator_id: 'creator789'
      };

      mockSend.mockResolvedValueOnce({ Item: mockAccessRight });

      const result = await repository.getAccessRight('user123', 'prod456');

      expect(result).toEqual(mockAccessRight);
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetCommand));
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should return null when access right does not exist', async () => {
      mockSend.mockResolvedValueOnce({ Item: undefined });

      const result = await repository.getAccessRight('user123', 'prod456');

      expect(result).toBeNull();
    });

    it('should throw error when DynamoDB operation fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

      await expect(repository.getAccessRight('user123', 'prod456'))
        .rejects.toThrow('Failed to retrieve access right from database');
    });
  });

  describe('getProduct', () => {
    it('should return product when it exists', async () => {
      const mockProduct = {
        PK: 'CREATOR#creator789',
        SK: 'PROD#prod456',
        type: ProductType.AUDIO,
        allow_subscription: true,
        price_one_time: 9.99,
        s3_key_source: 'audio/song.mp3',
        title: 'Test Song',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSend.mockResolvedValueOnce({ Item: mockProduct });

      const result = await repository.getProduct('creator789', 'prod456');

      expect(result).toEqual(mockProduct);
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it('should return null when product does not exist', async () => {
      mockSend.mockResolvedValueOnce({ Item: undefined });

      const result = await repository.getProduct('creator789', 'prod456');

      expect(result).toBeNull();
    });

    it('should throw error when DynamoDB operation fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

      await expect(repository.getProduct('creator789', 'prod456'))
        .rejects.toThrow('Failed to retrieve product from database');
    });
  });

  describe('hasValidSubscription', () => {
    it('should return true when user has valid subscription', async () => {
      mockSend.mockResolvedValueOnce({
        Items: [{
          PK: 'USER#user123',
          SK: 'RIGHT#sub789',
          access_type: AccessType.SUBSCRIPTION
        }]
      });

      const result = await repository.hasValidSubscription('user123', 'creator789');

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    });

    it('should return false when user has no subscription', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await repository.hasValidSubscription('user123', 'creator789');

      expect(result).toBe(false);
    });

    it('should return false when query returns undefined Items', async () => {
      mockSend.mockResolvedValueOnce({ Items: undefined });

      const result = await repository.hasValidSubscription('user123', 'creator789');

      expect(result).toBe(false);
    });

    it('should return false gracefully when DynamoDB operation fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

      const result = await repository.hasValidSubscription('user123', 'creator789');

      expect(result).toBe(false);
    });
  });

  describe('decrementDownloads', () => {
    it('should decrement downloads and return new count when counter > 0', async () => {
      mockSend.mockResolvedValueOnce({
        Attributes: {
          downloads_remaining: 2
        }
      });

      const result = await repository.decrementDownloads('user123', 'prod456');

      expect(result).toBe(2);
      expect(mockSend).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });

    it('should throw error when downloads_remaining is 0', async () => {
      const conditionalError = new Error('Conditional check failed');
      conditionalError.name = 'ConditionalCheckFailedException';
      mockSend.mockRejectedValueOnce(conditionalError);

      await expect(repository.decrementDownloads('user123', 'prod456'))
        .rejects.toThrow('Download limit reached');
    });

    it('should throw error when update operation fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

      await expect(repository.decrementDownloads('user123', 'prod456'))
        .rejects.toThrow('Failed to update download counter');
    });

    it('should return 0 when Attributes is undefined', async () => {
      mockSend.mockResolvedValueOnce({ Attributes: undefined });

      const result = await repository.decrementDownloads('user123', 'prod456');

      expect(result).toBe(0);
    });
  });
});
