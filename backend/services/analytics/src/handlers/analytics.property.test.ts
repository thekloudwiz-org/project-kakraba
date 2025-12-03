import * as fc from 'fast-check';
import { getDashboard, getRevenue, exportAnalytics } from './analytics';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';

// Mock the repository
jest.mock('../repositories/AnalyticsRepository');

describe('Analytics Service Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: creator-fan-portals, Property 17: Revenue analytics display trends
   * Validates: Requirements 4.2
   * 
   * For any revenue data, the analytics view should display charts showing
   * trends over time with daily, weekly, and monthly aggregations.
   */
  test('Property 17: Revenue analytics display trends with different granularities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.constantFrom('daily', 'weekly', 'monthly'), // granularity
        fc.integer({ min: 1, max: 30 }), // number of transactions
        async (userId, granularity, numTransactions) => {
          // Mock transactions
          const mockTransactions = Array.from({ length: numTransactions }, (_, i) => ({
            transactionId: `tx-${i}`,
            userId: `user-${i}`,
            creatorId: userId,
            productId: `product-${i}`,
            amount: Math.random() * 100,
            status: 'COMPLETED',
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          }));

          // Mock repository methods
          const mockRepo = AnalyticsRepository.prototype;
          (mockRepo.getTransactionsByDateRange as jest.Mock) = jest.fn().mockResolvedValue(mockTransactions);

          const result = await getRevenue(userId, { granularity }) as { statusCode: number; body: string };

          // Should return successful response
          expect(result.statusCode).toBe(200);

          const body = JSON.parse(result.body);

          // Should have data array
          expect(body.data).toBeDefined();
          expect(Array.isArray(body.data)).toBe(true);

          // Should have total revenue
          expect(body.total).toBeDefined();
          expect(typeof body.total).toBe('number');
          expect(body.total).toBeGreaterThanOrEqual(0);

          // Should have granularity
          expect(body.granularity).toBe(granularity);

          // Each data point should have required fields
          body.data.forEach((point: any) => {
            expect(point.date).toBeDefined();
            expect(point.revenue).toBeDefined();
            expect(point.transactions).toBeDefined();
            expect(typeof point.revenue).toBe('number');
            expect(typeof point.transactions).toBe('number');
          });

          // Data should be sorted by date
          for (let i = 1; i < body.data.length; i++) {
            expect(body.data[i].date >= body.data[i - 1].date).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 20: Time range filters all analytics
   * Validates: Requirements 4.5
   * 
   * For any time range selection, all analytics data should be filtered
   * to show only data within the selected period.
   */
  test('Property 20: Time range filters analytics data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.integer({ min: 1, max: 90 }), // days back for start
        fc.integer({ min: 0, max: 30 }), // days back for end
        async (userId, daysBackStart, daysBackEnd) => {
          // Ensure start is before end
          if (daysBackStart <= daysBackEnd) {
            return; // Skip this test case
          }

          const endDate = new Date(Date.now() - daysBackEnd * 24 * 60 * 60 * 1000).toISOString();
          const startDate = new Date(Date.now() - daysBackStart * 24 * 60 * 60 * 1000).toISOString();

          // Mock transactions within and outside the range
          const mockTransactions = [
            {
              transactionId: 'tx-in-range',
              userId: 'user-1',
              creatorId: userId,
              productId: 'product-1',
              amount: 50,
              status: 'COMPLETED',
              createdAt: new Date(Date.now() - (daysBackStart - 1) * 24 * 60 * 60 * 1000).toISOString(),
            },
          ];

          // Mock repository methods
          const mockRepo = AnalyticsRepository.prototype;
          const getTransactionsMock = jest.fn().mockResolvedValue(mockTransactions);
          (mockRepo.getTransactionsByDateRange as jest.Mock) = getTransactionsMock;

          const result = await getDashboard(userId, { startDate, endDate }) as { statusCode: number; body: string };

          // Should call repository with correct date range
          expect(getTransactionsMock).toHaveBeenCalledWith(userId, startDate, endDate);

          // Should return successful response
          expect(result.statusCode).toBe(200);

          const body = JSON.parse(result.body);

          // Should have metrics
          expect(body.totalRevenue).toBeDefined();
          expect(typeof body.totalRevenue).toBe('number');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 21: Analytics export generates CSV
   * Validates: Requirements 4.6
   * 
   * For any analytics export request, the system should generate a CSV file
   * containing all detailed metrics.
   */
  test('Property 21: Analytics export generates valid CSV', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.constantFrom('revenue', 'content', 'fans'), // export type
        async (userId, type) => {
          // Mock data based on type
          const mockTransactions = [
            {
              transactionId: 'tx-1',
              userId: 'user-1',
              creatorId: userId,
              productId: 'product-1',
              amount: 99.99,
              status: 'COMPLETED',
              createdAt: new Date().toISOString(),
            },
          ];

          const mockContent = [
            {
              contentId: 'content-1',
              title: 'Test Content',
              uploadedAt: new Date().toISOString(),
            },
          ];

          const mockProducts = [
            {
              productId: 'product-1',
              contentIds: ['content-1'],
              downloadQuota: 10,
            },
          ];

          const mockSubscriptions: any[] = [];

          // Mock repository methods
          const mockRepo = AnalyticsRepository.prototype;
          (mockRepo.getTransactionsByDateRange as jest.Mock) = jest.fn().mockResolvedValue(mockTransactions);
          (mockRepo.getCreatorContent as jest.Mock) = jest.fn().mockResolvedValue(mockContent);
          (mockRepo.getCreatorProducts as jest.Mock) = jest.fn().mockResolvedValue(mockProducts);
          (mockRepo.getActiveSubscriptions as jest.Mock) = jest.fn().mockResolvedValue(mockSubscriptions);
          (mockRepo.getUniqueFans as jest.Mock) = jest.fn().mockResolvedValue(new Set(['user-1']));

          const result = await exportAnalytics(userId, { type }) as { statusCode: number; body: string; headers?: any };

          // Should return successful response
          expect(result.statusCode).toBe(200);

          // Should have CSV content type
          expect(result.headers).toBeDefined();
          expect(result.headers['Content-Type']).toBe('text/csv');
          expect(result.headers['Content-Disposition']).toContain('attachment');
          expect(result.headers['Content-Disposition']).toContain(type);

          // Should have CSV body
          expect(result.body).toBeDefined();
          expect(typeof result.body).toBe('string');

          // CSV should have headers (first line)
          const lines = result.body.split('\n');
          expect(lines.length).toBeGreaterThan(0);
          expect(lines[0]).toContain(','); // Should have comma-separated headers

          // Should have at least one data row (for non-empty data)
          if (type === 'revenue' || type === 'content') {
            expect(lines.length).toBeGreaterThan(1);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 17 (additional): Revenue totals are accurate
   * Validates: Requirements 4.2
   * 
   * For any set of transactions, the total revenue should equal the sum
   * of all individual transaction amounts.
   */
  test('Property 17 (additional): Revenue totals match sum of transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.array(fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }), { minLength: 1, maxLength: 20 }), // transaction amounts
        async (userId, amounts) => {
          // Create mock transactions
          const mockTransactions = amounts.map((amount, i) => ({
            transactionId: `tx-${i}`,
            userId: `user-${i}`,
            creatorId: userId,
            productId: `product-${i}`,
            amount,
            status: 'COMPLETED',
            createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          }));

          // Calculate expected total
          const expectedTotal = amounts.reduce((sum, amount) => sum + amount, 0);

          // Mock repository methods
          const mockRepo = AnalyticsRepository.prototype;
          (mockRepo.getTransactionsByDateRange as jest.Mock) = jest.fn().mockResolvedValue(mockTransactions);

          const result = await getRevenue(userId, {}) as { statusCode: number; body: string };

          expect(result.statusCode).toBe(200);

          const body = JSON.parse(result.body);

          // Total should match sum of all transactions (within floating point precision)
          expect(Math.abs(body.total - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 10 }
    );
  });
});
