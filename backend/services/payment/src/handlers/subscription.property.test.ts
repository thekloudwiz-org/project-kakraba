import * as fc from 'fast-check';
import { createSubscription, cancelSubscription } from './subscription';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { MockPaymentService } from '../utils/mockPayment';

// Mock the repository
jest.mock('../repositories/PaymentRepository');
jest.mock('../utils/mockPayment');

describe('Subscription Service Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set mock mode
    process.env.MOCK_MODE = 'true';
  });

  /**
   * Feature: creator-fan-portals, Property 31: Subscription purchase creates recurring schedule
   * Validates: Requirements 7.5
   * 
   * For any subscription purchase, the system should create a recurring payment
   * schedule via Stripe and grant immediate access.
   */
  test('Property 31: Subscription purchase creates recurring schedule', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // creatorId
        fc.string({ minLength: 1, maxLength: 50 }), // paymentMethodId
        async (userId, creatorId, paymentMethodId) => {
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          // Mock subscription creation
          const mockSubId = `sub_mock_${creatorId}`;
          (MockPaymentService.createSubscription as jest.Mock).mockReturnValue({
            id: mockSubId,
            customer: userId,
            status: 'active',
            current_period_start: Math.floor(now.getTime() / 1000),
            current_period_end: Math.floor(nextMonth.getTime() / 1000),
            cancel_at_period_end: false,
          });

          // Mock repository methods
          const mockRepo = PaymentRepository.prototype;
          const createSubscriptionMock = jest.fn().mockResolvedValue({});
          const getCreatorProductsMock = jest.fn().mockResolvedValue([
            {
              productId: 'product-1',
              allowSubscription: true,
              creatorId,
            },
            {
              productId: 'product-2',
              allowSubscription: true,
              creatorId,
            },
          ]);
          const createAccessRightMock = jest.fn().mockResolvedValue({});

          (mockRepo.createSubscription as jest.Mock) = createSubscriptionMock;
          (mockRepo.getCreatorProducts as jest.Mock) = getCreatorProductsMock;
          (mockRepo.createAccessRight as jest.Mock) = createAccessRightMock;

          const result = await createSubscription(userId, {
            creatorId,
            paymentMethodId,
          }) as { statusCode: number; body: string };

          // Subscription should be created successfully
          expect(result.statusCode).toBe(201);
          expect(createSubscriptionMock).toHaveBeenCalled();

          const body = JSON.parse(result.body);
          
          // Should have recurring schedule
          expect(body.status).toBe('ACTIVE');
          expect(body.currentPeriodStart).toBeDefined();
          expect(body.currentPeriodEnd).toBeDefined();
          expect(body.cancelAtPeriodEnd).toBe(false);
          
          // Should grant immediate access by creating access rights
          expect(getCreatorProductsMock).toHaveBeenCalledWith(creatorId);
          expect(createAccessRightMock).toHaveBeenCalledTimes(2); // For 2 products
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 41: Subscription cancellation maintains access
   * Validates: Requirements 9.2
   * 
   * For any subscription cancellation, the system should update Stripe to stop
   * recurring payments and maintain access until the current period ends.
   */
  test('Property 41: Subscription cancellation maintains access until period end', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // subscriptionId
        fc.string({ minLength: 1, maxLength: 50 }), // creatorId
        async (userId, subscriptionId, creatorId) => {
          // Clear mocks for each property test run
          jest.clearAllMocks();
          
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          const existingSubscription = {
            subscriptionId,
            userId,
            creatorId,
            stripeSubscriptionId: `stripe_${subscriptionId}`,
            status: 'ACTIVE' as const,
            currentPeriodStart: now.toISOString(),
            currentPeriodEnd: nextMonth.toISOString(),
            cancelAtPeriodEnd: false,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          };

          // Mock subscription cancellation
          (MockPaymentService.cancelSubscription as jest.Mock).mockReturnValue({
            id: existingSubscription.stripeSubscriptionId,
            status: 'canceled',
            cancel_at_period_end: true,
          });

          // Mock repository methods - need to mock the instance methods
          const mockRepo = PaymentRepository.prototype;
          (mockRepo.getSubscription as jest.Mock) = jest.fn().mockResolvedValue(existingSubscription);
          (mockRepo.updateSubscription as jest.Mock) = jest.fn().mockResolvedValue({});

          const result = await cancelSubscription(userId, subscriptionId) as { statusCode: number; body: string };

          // Cancellation should succeed
          expect(result.statusCode).toBe(200);
          expect(mockRepo.getSubscription).toHaveBeenCalledWith(userId, subscriptionId);
          expect(mockRepo.updateSubscription).toHaveBeenCalled();

          const body = JSON.parse(result.body);
          
          // Should be marked as canceled but maintain access
          expect(body.status).toBe('CANCELED');
          expect(body.cancelAtPeriodEnd).toBe(true);
          
          // Period end should still be in the future (access maintained)
          expect(body.currentPeriodEnd).toBe(nextMonth.toISOString());
          
          // Should have confirmation message
          expect(body.message).toContain('Access maintained until period end');
        }
      ),
      { numRuns: 10 } // Reduced runs for faster testing
    );
  });

  /**
   * Feature: creator-fan-portals, Property 31 (additional): Subscription creates access for eligible products
   * Validates: Requirements 7.5, 3.5
   * 
   * For any subscription, access rights should be created only for products
   * that allow subscription access.
   */
  test('Property 31 (additional): Subscription creates access only for eligible products', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // creatorId
        fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }), // allowSubscription flags
        async (userId, creatorId, allowSubscriptionFlags) => {
          const now = new Date();
          const nextMonth = new Date(now);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          // Create products with varying subscription eligibility
          const products = allowSubscriptionFlags.map((allowSub, index) => ({
            productId: `product-${index}`,
            allowSubscription: allowSub,
            creatorId,
          }));

          const expectedAccessRights = products.filter(p => p.allowSubscription).length;

          // Mock subscription creation
          (MockPaymentService.createSubscription as jest.Mock).mockReturnValue({
            id: `sub_mock_${creatorId}`,
            customer: userId,
            status: 'active',
            current_period_start: Math.floor(now.getTime() / 1000),
            current_period_end: Math.floor(nextMonth.getTime() / 1000),
            cancel_at_period_end: false,
          });

          // Mock repository methods
          const mockRepo = PaymentRepository.prototype;
          const createAccessRightMock = jest.fn().mockResolvedValue({});
          
          (mockRepo.createSubscription as jest.Mock) = jest.fn().mockResolvedValue({});
          (mockRepo.getCreatorProducts as jest.Mock) = jest.fn().mockResolvedValue(products);
          (mockRepo.createAccessRight as jest.Mock) = createAccessRightMock;

          const result = await createSubscription(userId, {
            creatorId,
            paymentMethodId: 'pm_test',
          }) as { statusCode: number; body: string };

          // Should create access rights only for subscription-eligible products
          expect(result.statusCode).toBe(201);
          expect(createAccessRightMock).toHaveBeenCalledTimes(expectedAccessRights);

          // Verify each access right is for a subscription-eligible product
          const calls = createAccessRightMock.mock.calls;
          calls.forEach((call: any) => {
            const accessRight = call[0];
            expect(accessRight.accessType).toBe('SUBSCRIPTION');
            
            // Find the product
            const product = products.find(p => p.productId === accessRight.productId);
            expect(product).toBeDefined();
            expect(product!.allowSubscription).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
