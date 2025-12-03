import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { MockPaymentService } from '../utils/mockPayment';
import { CreatePaymentIntentRequest, ConfirmPaymentRequest, Transaction, AccessRight } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const mockMode = process.env.MOCK_MODE !== 'false'; // Default to mock mode
const paymentRepo = new PaymentRepository(tableName, region);

/**
 * POST /payments/create-intent
 * Create payment intent (mock for development)
 */
export async function createPaymentIntent(
  userId: string,
  request: CreatePaymentIntentRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const { productId } = request;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing required field: productId',
        }),
      };
    }

    // Get product to determine price and creator
    // Note: We need to query by productId across all creators
    // For now, we'll return a mock response
    // In production, you'd query the product table properly

    if (mockMode) {
      // Mock mode: Create a fake payment intent
      const mockIntent = MockPaymentService.createPaymentIntent(99.99, 'usd');

      return {
        statusCode: 200,
        body: JSON.stringify({
          clientSecret: mockIntent.client_secret,
          paymentIntentId: mockIntent.id,
          amount: mockIntent.amount / 100, // Convert back to dollars
          mockMode: true,
        }),
      };
    }

    // Production mode would integrate with Stripe here
    return {
      statusCode: 501,
      body: JSON.stringify({
        error: 'Not Implemented',
        message: 'Stripe integration not yet configured. Use MOCK_MODE=true for development.',
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * POST /payments/confirm
 * Confirm payment and create access right (mock for development)
 */
export async function confirmPayment(
  userId: string,
  request: ConfirmPaymentRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const { paymentIntentId, productId, mockSuccess = true } = request;

    if (!paymentIntentId || !productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing required fields: paymentIntentId, productId',
        }),
      };
    }

    if (mockMode) {
      // Mock mode: Simulate payment confirmation
      const mockIntent = MockPaymentService.confirmPaymentIntent(paymentIntentId, mockSuccess);

      if (mockIntent.status === 'failed') {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Payment Failed',
            message: 'Mock payment failed. Set mockSuccess=true to simulate successful payment.',
          }),
        };
      }

      // Try to get product details (for mock mode, use defaults if not found)
      let product;
      let creatorId = 'mock-creator-id';
      let amount = 99.99;
      let downloadQuota = 10;

      try {
        // In mock mode, we might not have the full product data
        // This is just for demonstration - in production you'd query properly
        product = await paymentRepo.getProductById(productId);
        if (product) {
          creatorId = product.creatorId;
          amount = product.price;
          downloadQuota = product.downloadQuota || 10;
        }
      } catch (error) {
        console.log('Could not fetch product details, using mock values:', error);
      }

      // Create transaction record
      const transaction: Transaction = {
        transactionId: uuidv4(),
        userId,
        creatorId,
        productId,
        amount,
        currency: 'USD',
        paymentMethod: 'MOCK',
        stripePaymentIntentId: paymentIntentId,
        status: 'COMPLETED',
        transactionType: 'PURCHASE',
        createdAt: new Date().toISOString(),
      };

      await paymentRepo.createTransaction(transaction);

      // Create access right
      const accessRight: AccessRight = {
        userId,
        productId,
        creatorId,
        accessType: 'PURCHASE',
        downloadsRemaining: downloadQuota,
        purchaseDate: new Date().toISOString(),
      };

      await paymentRepo.createAccessRight(accessRight);

      return {
        statusCode: 200,
        body: JSON.stringify({
          accessRight,
          transaction,
          mockMode: true,
          message: 'Mock payment confirmed successfully',
        }),
      };
    }

    // Production mode would integrate with Stripe here
    return {
      statusCode: 501,
      body: JSON.stringify({
        error: 'Not Implemented',
        message: 'Stripe integration not yet configured. Use MOCK_MODE=true for development.',
      }),
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
