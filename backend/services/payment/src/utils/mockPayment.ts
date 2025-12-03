import { v4 as uuidv4 } from 'uuid';

/**
 * Mock payment service for development
 * Simulates Stripe payment processing without actual API calls
 */

export interface MockPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'failed';
  client_secret: string;
}

export class MockPaymentService {
  /**
   * Create a mock payment intent
   */
  static createPaymentIntent(amount: number, currency: string = 'usd'): MockPaymentIntent {
    const intentId = `pi_mock_${uuidv4()}`;
    
    return {
      id: intentId,
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      status: 'requires_payment_method',
      client_secret: `${intentId}_secret_${uuidv4()}`,
    };
  }

  /**
   * Confirm a mock payment intent
   * In dev mode, you can control success/failure
   */
  static confirmPaymentIntent(
    paymentIntentId: string,
    mockSuccess: boolean = true
  ): MockPaymentIntent {
    return {
      id: paymentIntentId,
      amount: 0, // Amount not needed for confirmation
      currency: 'usd',
      status: mockSuccess ? 'succeeded' : 'failed',
      client_secret: `${paymentIntentId}_secret`,
    };
  }

  /**
   * Create a mock subscription
   */
  static createSubscription(customerId: string, priceId: string): any {
    const subscriptionId = `sub_mock_${uuidv4()}`;
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      id: subscriptionId,
      customer: customerId,
      status: 'active',
      current_period_start: Math.floor(now.getTime() / 1000),
      current_period_end: Math.floor(nextMonth.getTime() / 1000),
      cancel_at_period_end: false,
    };
  }

  /**
   * Cancel a mock subscription
   */
  static cancelSubscription(subscriptionId: string): any {
    return {
      id: subscriptionId,
      status: 'canceled',
      cancel_at_period_end: true,
    };
  }

  /**
   * Verify webhook signature (always returns true in mock mode)
   */
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // In mock mode, always return true
    // In production, use Stripe's signature verification
    return true;
  }
}
