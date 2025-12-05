/**
 * Test data fixtures for E2E tests
 */

export const testUsers = {
  creator: {
    email: `creator-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Test Creator',
    bio: 'This is a test creator account for E2E testing',
  },
  fan: {
    email: `fan-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Test Fan',
  },
};

export const testContent = {
  audio: {
    title: 'Test Audio Track',
    description: 'A test audio file for E2E testing',
    contentType: 'AUDIO',
  },
  video: {
    title: 'Test Video',
    description: 'A test video file for E2E testing',
    contentType: 'VIDEO',
  },
  pdf: {
    title: 'Test PDF Document',
    description: 'A test PDF file for E2E testing',
    contentType: 'PDF',
  },
};

export const testProduct = {
  single: {
    title: 'Test Single Product',
    description: 'A single content product for testing',
    price: 9.99,
    accessType: 'PURCHASE',
    downloadQuota: 5,
  },
  bundle: {
    title: 'Test Bundle Product',
    description: 'A bundle of content for testing',
    price: 19.99,
    accessType: 'PURCHASE',
    downloadQuota: 10,
  },
  subscription: {
    title: 'Test Subscription',
    description: 'A subscription product for testing',
    price: 4.99,
    accessType: 'SUBSCRIPTION',
  },
};

export const testPayment = {
  validCard: {
    number: '4242424242424242', // Stripe test card
    expiry: '12/25',
    cvc: '123',
    zip: '12345',
  },
  declinedCard: {
    number: '4000000000000002', // Stripe test card that declines
    expiry: '12/25',
    cvc: '123',
    zip: '12345',
  },
};
