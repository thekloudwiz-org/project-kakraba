import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { MockPaymentService } from '../utils/mockPayment';
import { CreateSubscriptionRequest, Subscription, AccessRight } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const mockMode = process.env.MOCK_MODE !== 'false';
const paymentRepo = new PaymentRepository(tableName, region);

/**
 * POST /subscriptions/create
 * Create subscription (mock for development)
 */
export async function createSubscription(
  userId: string,
  request: CreateSubscriptionRequest
): Promise<APIGatewayProxyResultV2> {
  try {
    const { creatorId, paymentMethodId } = request;

    if (!creatorId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing required field: creatorId',
        }),
      };
    }

    if (mockMode) {
      // Mock mode: Create fake subscription
      const mockSub = MockPaymentService.createSubscription(userId, 'mock-price-id');

      const subscription: Subscription = {
        subscriptionId: uuidv4(),
        userId,
        creatorId,
        stripeSubscriptionId: mockSub.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(mockSub.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(mockSub.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await paymentRepo.createSubscription(subscription);

      // Create access rights for all subscription-eligible products from this creator
      try {
        const products = await paymentRepo.getCreatorProducts(creatorId);
        const subscriptionProducts = (products || []).filter(p => p.allowSubscription);

        for (const product of subscriptionProducts) {
          const accessRight = {
            userId,
            productId: product.productId,
            creatorId,
            accessType: 'SUBSCRIPTION' as const,
            purchaseDate: new Date().toISOString(),
            expiresAt: subscription.currentPeriodEnd,
          };

          await paymentRepo.createAccessRight(accessRight);
        }

        console.log(`Created access rights for ${subscriptionProducts.length} subscription products`);
      } catch (error) {
        console.error('Error creating access rights for subscription:', error);
        // Don't fail the subscription creation if access rights fail
      }

      return {
        statusCode: 201,
        body: JSON.stringify({
          ...subscription,
          mockMode: true,
          message: 'Mock subscription created successfully',
        }),
      };
    }

    return {
      statusCode: 501,
      body: JSON.stringify({
        error: 'Not Implemented',
        message: 'Stripe integration not yet configured. Use MOCK_MODE=true for development.',
      }),
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
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
 * POST /subscriptions/{subscriptionId}/cancel
 * Cancel subscription (mock for development)
 */
export async function cancelSubscription(
  userId: string,
  subscriptionId: string
): Promise<APIGatewayProxyResultV2> {
  try {
    if (!subscriptionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing subscriptionId',
        }),
      };
    }

    // Get existing subscription
    const existing = await paymentRepo.getSubscription(userId, subscriptionId);

    if (!existing) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Not Found',
          message: 'Subscription not found',
        }),
      };
    }

    if (mockMode) {
      // Mock mode: Cancel subscription
      MockPaymentService.cancelSubscription(existing.stripeSubscriptionId || '');

      const updated: Subscription = {
        ...existing,
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString(),
      };

      await paymentRepo.updateSubscription(updated);

      return {
        statusCode: 200,
        body: JSON.stringify({
          ...updated,
          mockMode: true,
          message: 'Mock subscription canceled successfully. Access maintained until period end.',
        }),
      };
    }

    return {
      statusCode: 501,
      body: JSON.stringify({
        error: 'Not Implemented',
        message: 'Stripe integration not yet configured. Use MOCK_MODE=true for development.',
      }),
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
