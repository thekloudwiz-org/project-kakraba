import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { MockPaymentService } from '../utils/mockPayment';
import { Subscription } from '../types';

const tableName = process.env.TABLE_NAME || '';
const region = process.env.AWS_REGION || 'eu-central-1';
const mockMode = process.env.MOCK_MODE !== 'false';
const paymentRepo = new PaymentRepository(tableName, region);

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events with signature verification
 */
export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<APIGatewayProxyResultV2> {
  try {
    if (mockMode) {
      // Mock mode: Simulate webhook processing
      console.log('Mock webhook received:', body);
      
      // Verify signature in mock mode (always passes)
      const isValid = MockPaymentService.verifyWebhookSignature(
        body,
        signature,
        'mock_webhook_secret'
      );

      if (!isValid) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Invalid Signature',
            message: 'Webhook signature verification failed',
          }),
        };
      }

      // Parse the event
      let event;
      try {
        event = JSON.parse(body);
      } catch (e) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Invalid JSON',
            message: 'Failed to parse webhook body',
          }),
        };
      }

      // Handle different event types
      await handleWebhookEvent(event);

      return {
        statusCode: 200,
        body: JSON.stringify({
          received: true,
          mockMode: true,
          eventType: event.type,
        }),
      };
    }

    // Production mode: Real Stripe webhook handling
    // This would use Stripe's webhook signature verification
    return {
      statusCode: 501,
      body: JSON.stringify({
        error: 'Not Implemented',
        message: 'Stripe webhook integration not yet configured. Use MOCK_MODE=true for development.',
      }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
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
 * Handle different webhook event types
 */
async function handleWebhookEvent(event: any): Promise<void> {
  console.log('Processing webhook event:', event.type);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  console.log('Payment intent succeeded:', paymentIntent.id);
  
  // In production, you would:
  // 1. Find the associated transaction
  // 2. Update transaction status to COMPLETED
  // 3. Create access right if not already created
  // 4. Send confirmation email to user
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  console.log('Payment intent failed:', paymentIntent.id);
  
  // In production, you would:
  // 1. Find the associated transaction
  // 2. Update transaction status to FAILED
  // 3. Send failure notification to user
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: any): Promise<void> {
  console.log('Subscription created:', subscription.id);
  
  // In production, you would:
  // 1. Create subscription record in DynamoDB
  // 2. Create access rights for all creator's subscription-eligible products
  // 3. Send welcome email to subscriber
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  console.log('Subscription updated:', subscription.id);
  
  // In production, you would:
  // 1. Update subscription record in DynamoDB
  // 2. Handle status changes (active, past_due, canceled, etc.)
  // 3. Update access rights if needed
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  console.log('Subscription deleted:', subscription.id);
  
  // In production, you would:
  // 1. Update subscription status to CANCELED
  // 2. Remove access rights after current period ends
  // 3. Send cancellation confirmation email
}

/**
 * Handle successful invoice payment (subscription renewal)
 */
async function handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
  console.log('Invoice payment succeeded:', invoice.id);
  
  // In production, you would:
  // 1. Create transaction record for the renewal
  // 2. Extend subscription period
  // 3. Send receipt email
}

/**
 * Handle failed invoice payment (subscription renewal failure)
 */
async function handleInvoicePaymentFailed(invoice: any): Promise<void> {
  console.log('Invoice payment failed:', invoice.id);
  
  // In production, you would:
  // 1. Update subscription status to PAST_DUE
  // 2. Send payment failure notification
  // 3. Provide instructions to update payment method
}
