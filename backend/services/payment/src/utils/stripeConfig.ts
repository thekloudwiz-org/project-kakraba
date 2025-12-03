import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;
let stripeApiKey: string | null = null;

/**
 * Get Stripe API key from Secrets Manager
 */
async function getStripeApiKey(): Promise<string> {
  if (stripeApiKey) {
    return stripeApiKey;
  }

  const secretName = process.env.STRIPE_SECRET_NAME || 'kakraba/stripe/api-key';
  const region = process.env.AWS_REGION || 'eu-central-1';

  const client = new SecretsManagerClient({ region });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    if (response.SecretString) {
      const secret = JSON.parse(response.SecretString);
      stripeApiKey = secret.apiKey || secret.STRIPE_API_KEY;
      
      if (!stripeApiKey) {
        throw new Error('Stripe API key not found in secret');
      }

      return stripeApiKey;
    }

    throw new Error('Secret value is empty');
  } catch (error) {
    console.error('Error retrieving Stripe API key from Secrets Manager:', error);
    throw new Error('Failed to retrieve Stripe API key');
  }
}

/**
 * Get Stripe instance (singleton)
 * Returns null in mock mode
 */
export async function getStripe(): Promise<Stripe | null> {
  const mockMode = process.env.MOCK_MODE !== 'false';

  if (mockMode) {
    console.log('Running in MOCK_MODE - Stripe integration disabled');
    return null;
  }

  if (stripeInstance) {
    return stripeInstance;
  }

  try {
    const apiKey = await getStripeApiKey();
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    console.log('Stripe initialized successfully');
    return stripeInstance;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    throw error;
  }
}

/**
 * Check if running in mock mode
 */
export function isMockMode(): boolean {
  return process.env.MOCK_MODE !== 'false';
}

/**
 * Get webhook secret from environment or Secrets Manager
 */
export async function getWebhookSecret(): Promise<string> {
  const mockMode = process.env.MOCK_MODE !== 'false';

  if (mockMode) {
    return 'mock_webhook_secret';
  }

  // Try environment variable first
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }

  // Otherwise get from Secrets Manager
  const secretName = process.env.STRIPE_WEBHOOK_SECRET_NAME || 'kakraba/stripe/webhook-secret';
  const region = process.env.AWS_REGION || 'eu-central-1';

  const client = new SecretsManagerClient({ region });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    if (response.SecretString) {
      const secret = JSON.parse(response.SecretString);
      return secret.webhookSecret || secret.STRIPE_WEBHOOK_SECRET;
    }

    throw new Error('Webhook secret not found');
  } catch (error) {
    console.error('Error retrieving webhook secret:', error);
    throw new Error('Failed to retrieve webhook secret');
  }
}
