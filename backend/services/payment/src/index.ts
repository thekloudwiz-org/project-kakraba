import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { APIGatewayProxyEventV2WithAuth } from './types';
import { createPaymentIntent, confirmPayment } from './handlers/payment';
import { createSubscription, cancelSubscription } from './handlers/subscription';
import { handleStripeWebhook } from './handlers/webhook';

/**
 * Main Lambda handler for payment service
 * Routes requests to appropriate handlers
 * 
 * MOCK MODE: Set MOCK_MODE=true (default) for development without Stripe
 * PRODUCTION: Set MOCK_MODE=false and configure Stripe API keys
 */
export const handler = async (
  event: APIGatewayProxyEventV2WithAuth
): Promise<APIGatewayProxyResultV2> => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const { http } = event.requestContext;
    const method = http.method;
    const path = http.path;

    const userId = event.requestContext.authorizer?.jwt.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Missing user authentication',
        }),
      };
    }

    // Route to appropriate handler
    if (path === '/payments/create-intent' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await createPaymentIntent(userId, body);
    }

    if (path === '/payments/confirm' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await confirmPayment(userId, body);
    }

    if (path === '/subscriptions/create' && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      return await createSubscription(userId, body);
    }

    if (path.match(/^\/subscriptions\/[^/]+\/cancel$/) && method === 'POST') {
      const subscriptionId = event.pathParameters?.subscriptionId;
      if (!subscriptionId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Missing subscriptionId parameter',
          }),
        };
      }
      return await cancelSubscription(userId, subscriptionId);
    }

    // Webhook endpoint - no auth required, uses signature verification
    if (path === '/webhooks/stripe' && method === 'POST') {
      const signature = event.headers['stripe-signature'] || '';
      const body = event.body || '';
      return await handleStripeWebhook(body, signature);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Not Found',
        message: `Route ${method} ${path} not found`,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
