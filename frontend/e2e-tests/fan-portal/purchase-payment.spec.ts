import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForToast, waitForApiResponse } from '../utils/wait-helpers';
import { testPayment } from '../fixtures/test-data';

/**
 * Fan Portal Purchase and Payment Tests
 * 
 * Tests checkout, payment processing, and purchase history
 * Validates: Requirements 7.1-7.6
 */

test.describe('Purchase and Payment', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-fan@example.com', 'TestPassword123!');
    await page.waitForURL(/discover|home/);
  });

  test('should navigate to checkout from product page', async ({ page }) => {
    await page.goto('/discover');
    
    // Click on a product
    await page.click('[data-testid="product-card"]').first();
    
    // Click purchase button
    await page.click('[data-testid="purchase-button"]');
    
    // Should navigate to checkout
    await page.waitForURL(/checkout/);
    await expect(page).toHaveURL(/checkout/);
  });

  test('should display checkout page with product details', async ({ page }) => {
    // Navigate to a product and start checkout
    await page.goto('/discover');
    await page.click('[data-testid="product-card"]').first();
    await page.click('[data-testid="purchase-button"]');
    
    // Should show product details
    await expect(page.locator('[data-testid="checkout-product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-product-price"]')).toBeVisible();
    
    // Should show payment form
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
  });

  test('should display Stripe payment form', async ({ page }) => {
    await page.goto('/discover');
    await page.click('[data-testid="product-card"]').first();
    await page.click('[data-testid="purchase-button"]');
    
    // Should see Stripe Elements
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await expect(stripeFrame.locator('input[name="cardnumber"]')).toBeVisible();
  });

  test('should validate payment information', async ({ page }) => {
    await page.goto('/discover');
    await page.click('[data-testid="product-card"]').first();
    await page.click('[data-testid="purchase-button"]');
    
    // Try to submit without payment info
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=/payment.*required/i')).toBeVisible();
  });

  test('should process successful payment', async ({ page }) => {
    await page.goto('/discover');
    await page.click('[data-testid="product-card"]').first();
    await page.click('[data-testid="purchase-button"]');
    
    // Fill in Stripe test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('input[name="cardnumber"]').fill(testPayment.validCard.number);
    await stripeFrame.locator('input[name="exp-date"]').fill(testPayment.validCard.expiry);
    await stripeFrame.locator('input[name="cvc"]').fill(testPayment.validCard.cvc);
    await stripeFrame.locator('input[name="postal"]').fill(testPayment.validCard.zip);
    
    // Submit payment
    await page.click('button[type="submit"]');
    
    // Wait for payment processing
    await waitForApiResponse(page, /payments\/confirm/);
    
    // Should redirect to confirmation page
    await page.waitForURL(/purchase\/confirmation/);
    await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible();
  });

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/discover');
    await page.click('[data-testid="product-card"]').first();
    await page.click('[data-testid="purchase-button"]');
    
    // Fill in Stripe declined test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('input[name="cardnumber"]').fill(testPayment.declinedCard.number);
    await stripeFrame.locator('input[name="exp-date"]').fill(testPayment.declinedCard.expiry);
    await stripeFrame.locator('input[name="cvc"]').fill(testPayment.declinedCard.cvc);
    await stripeFrame.locator('input[name="postal"]').fill(testPayment.declinedCard.zip);
    
    // Submit payment
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/payment.*failed|declined/i')).toBeVisible();
    
    // Should allow retry
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should display purchase confirmation with access details', async ({ page }) => {
    // Assuming we have a successful purchase
    await page.goto('/purchase/confirmation?transactionId=test-123');
    
    // Should show success message
    await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible();
    
    // Should show access details
    await expect(page.locator('[data-testid="access-details"]')).toBeVisible();
    
    // Should have link to library
    await expect(page.locator('a[href*="/library"]')).toBeVisible();
  });

  test('should create subscription for creator', async ({ page }) => {
    await page.goto('/discover');
    
    // Navigate to creator profile
    await page.click('[data-testid="creator-card"]').first();
    
    // Click subscribe button
    await page.click('[data-testid="subscribe-button"]');
    
    // Should navigate to subscription checkout
    await page.waitForURL(/checkout.*subscription/);
    
    // Fill in payment details
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('input[name="cardnumber"]').fill(testPayment.validCard.number);
    await stripeFrame.locator('input[name="exp-date"]').fill(testPayment.validCard.expiry);
    await stripeFrame.locator('input[name="cvc"]').fill(testPayment.validCard.cvc);
    await stripeFrame.locator('input[name="postal"]').fill(testPayment.validCard.zip);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for subscription creation
    await waitForApiResponse(page, /subscriptions\/create/);
    
    // Should show success
    await waitForToast(page, /subscribed/i);
  });

  test('should display purchase history', async ({ page }) => {
    await page.goto('/purchases');
    
    // Should see purchase history table
    await expect(page.locator('[data-testid="purchase-history"]')).toBeVisible();
    
    // Should have transaction rows
    const transactions = page.locator('[data-testid="transaction-row"]');
    await expect(transactions.first()).toBeVisible();
  });

  test('should display transaction details in purchase history', async ({ page }) => {
    await page.goto('/purchases');
    
    // Click on a transaction
    await page.click('[data-testid="transaction-row"]').first();
    
    // Should show transaction details
    await expect(page.locator('[data-testid="transaction-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="transaction-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
  });

  test('should filter purchase history by date', async ({ page }) => {
    await page.goto('/purchases');
    
    // Set date filter
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.click('[data-testid="apply-filter"]');
    
    // Wait for filtered results
    await waitForApiResponse(page, /purchases.*startDate/);
    
    // Should show filtered transactions
    const transactions = page.locator('[data-testid="transaction-row"]');
    await expect(transactions.first()).toBeVisible();
  });

  test('should filter purchase history by type', async ({ page }) => {
    await page.goto('/purchases');
    
    // Select purchase type filter
    await page.selectOption('[data-testid="type-filter"]', 'PURCHASE');
    
    // Wait for filtered results
    await waitForApiResponse(page, /purchases.*type=PURCHASE/);
    
    // All transactions should be purchases
    const transactions = page.locator('[data-testid="transaction-row"]');
    const count = await transactions.count();
    
    for (let i = 0; i < count; i++) {
      await expect(transactions.nth(i).locator('[data-testid="transaction-type"]')).toHaveText(/purchase/i);
    }
  });
});
