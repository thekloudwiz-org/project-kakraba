import * as fc from 'fast-check';
import { createPaymentIntent, confirmPayment } from './payment';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { MockPaymentService } from '../utils/mockPayment';

// Mock the repository
jest.mock('../repositories/PaymentRepository');
jest.mock('../utils/mockPayment');

describe('Payment Service Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set mock mode
    process.env.MOCK_MODE = 'true';
  });

  /**
   * Feature: creator-fan-portals, Property 28: Payment validation processes correctly
   * Validates: Requirements 7.2
   * 
   * For any payment information submitted, the system should validate card details
   * and process payment via Stripe (or mock in dev mode).
   */
  test('Property 28: Payment validation processes correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // productId
        fc.string({ minLength: 1, maxLength: 50 }), // paymentIntentId
        fc.boolean(), // mockSuccess
        async (userId, productId, paymentIntentId, mockSuccess) => {
          // Mock the payment service
          (MockPaymentService.confirmPaymentIntent as jest.Mock).mockReturnValue({
            id: paymentIntentId,
            amount: 0,
            currency: 'usd',
            status: mockSuccess ? 'succeeded' : 'failed',
            client_secret: `${paymentIntentId}_secret`,
          });

          // Mock repository methods
          const mockRepo = PaymentRepository.prototype;
          (mockRepo.createTransaction as jest.Mock) = jest.fn().mockResolvedValue({});
          (mockRepo.createAccessRight as jest.Mock) = jest.fn().mockResolvedValue({});
          (mockRepo.getProductById as jest.Mock) = jest.fn().mockResolvedValue(null);

          const result = await confirmPayment(userId, {
            paymentIntentId,
            productId,
            mockSuccess,
          }) as { statusCode: number; body: string };

          // Payment should always return a valid response
          expect(result.statusCode).toBeGreaterThanOrEqual(200);
          expect(result.statusCode).toBeLessThan(600);
          expect(result.body).toBeDefined();

          const body = JSON.parse(result.body);

          if (mockSuccess) {
            // Successful payment should return 200
            expect(result.statusCode).toBe(200);
            expect(body.mockMode).toBe(true);
            expect(body.message).toContain('successfully');
          } else {
            // Failed payment should return 400
            expect(result.statusCode).toBe(400);
            expect(body.error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 29: Successful payment creates access right
   * Validates: Requirements 7.3
   * 
   * For any successful payment, the system should create an access right record
   * in DynamoDB and display a purchase confirmation.
   */
  test('Property 29: Successful payment creates access right', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // productId
        fc.string({ minLength: 1, maxLength: 50 }), // paymentIntentId
        async (userId, productId, paymentIntentId) => {
          // Mock successful payment
          (MockPaymentService.confirmPaymentIntent as jest.Mock).mockReturnValue({
            id: paymentIntentId,
            amount: 0,
            currency: 'usd',
            status: 'succeeded',
            client_secret: `${paymentIntentId}_secret`,
          });

          // Mock repository methods
          const mockRepo = PaymentRepository.prototype;
          const createAccessRightMock = jest.fn().mockResolvedValue({});
          const createTransactionMock = jest.fn().mockResolvedValue({});
          (mockRepo.createAccessRight as jest.Mock) = createAccessRightMock;
          (mockRepo.createTransaction as jest.Mock) = createTransactionMock;
          (mockRepo.getProductById as jest.Mock) = jest.fn().mockResolvedValue(null);

          const result = await confirmPayment(userId, {
            paymentIntentId,
            productId,
            mockSuccess: true,
          }) as { statusCode: number; body: string };

          // Successful payment should create access right
          expect(result.statusCode).toBe(200);
          expect(createAccessRightMock).toHaveBeenCalled();
          expect(createTransactionMock).toHaveBeenCalled();

          const body = JSON.parse(result.body);
          expect(body.accessRight).toBeDefined();
          expect(body.accessRight.userId).toBe(userId);
          expect(body.accessRight.productId).toBe(productId);
          expect(body.transaction).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 30: Failed payment allows retry
   * Validates: Requirements 7.4
   * 
   * For any failed payment, the system should display an error message
   * and allow the user to retry with different payment information.
   */
  test('Property 30: Failed payment allows retry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // productId
        fc.string({ minLength: 1, maxLength: 50 }), // paymentIntentId
        async (userId, productId, paymentIntentId) => {
          // Mock failed payment
          (MockPaymentService.confirmPaymentIntent as jest.Mock).mockReturnValue({
            id: paymentIntentId,
            amount: 0,
            currency: 'usd',
            status: 'failed',
            client_secret: `${paymentIntentId}_secret`,
          });

          // Mock repository methods
          const mockRepo = PaymentRepository.prototype;
          (mockRepo.createAccessRight as jest.Mock) = jest.fn().mockResolvedValue({});
          (mockRepo.createTransaction as jest.Mock) = jest.fn().mockResolvedValue({});
          (mockRepo.getProductById as jest.Mock) = jest.fn().mockResolvedValue(null);

          const result = await confirmPayment(userId, {
            paymentIntentId,
            productId,
            mockSuccess: false,
          }) as { statusCode: number; body: string };

          // Failed payment should return error but allow retry
          expect(result.statusCode).toBe(400);
          
          const body = JSON.parse(result.body);
          expect(body.error).toBeDefined();
          expect(body.message).toBeDefined();
          
          // Error message should indicate failure, not a permanent block
          expect(body.error).toBe('Payment Failed');
          
          // Should NOT create access right on failed payment
          expect(mockRepo.createAccessRight).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: creator-fan-portals, Property 28 (additional): Payment intent creation
   * Validates: Requirements 7.1
   * 
   * For any product ID, creating a payment intent should return valid payment details.
   */
  test('Property 28 (additional): Payment intent creation returns valid details', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }), // userId
        fc.string({ minLength: 1, maxLength: 50 }), // productId
        async (userId, productId) => {
          // Mock payment intent creation
          const mockIntentId = `pi_mock_${productId}`;
          (MockPaymentService.createPaymentIntent as jest.Mock).mockReturnValue({
            id: mockIntentId,
            amount: 9999,
            currency: 'usd',
            status: 'requires_payment_method',
            client_secret: `${mockIntentId}_secret_xxx`,
          });

          const result = await createPaymentIntent(userId, { productId }) as { statusCode: number; body: string };

          // Should return valid payment intent
          expect(result.statusCode).toBe(200);
          
          const body = JSON.parse(result.body);
          expect(body.clientSecret).toBeDefined();
          expect(body.paymentIntentId).toBeDefined();
          expect(body.amount).toBeGreaterThan(0);
          expect(body.mockMode).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
