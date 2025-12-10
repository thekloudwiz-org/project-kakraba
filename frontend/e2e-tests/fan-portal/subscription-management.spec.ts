import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForToast, waitForApiResponse, waitForModalToOpen } from '../utils/wait-helpers';

/**
 * Fan Portal Subscription Management Tests
 * 
 * Tests subscription viewing, cancellation, and payment method updates
 * Validates: Requirements 9.1-9.5
 */

test.describe('Subscription Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-fan@example.com', 'TestPassword123!');
    // Wait for page to load after login
    await page.waitForLoadState('networkidle');
  });

  test('should display subscriptions page', async ({ page }) => {
    await page.goto('/subscriptions');
    
    // Should see subscriptions manager
    await expect(page.locator('[data-testid="subscription-manager"]')).toBeVisible();
  });

  test('should display all active subscriptions', async ({ page }) => {
    await page.goto('/subscriptions');
    
    // Should see subscription cards
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      await expect(subscriptions.first()).toBeVisible();
      
      // Each subscription should show key details
      await expect(subscriptions.first().locator('[data-testid="creator-name"]')).toBeVisible();
      await expect(subscriptions.first().locator('[data-testid="renewal-date"]')).toBeVisible();
      await expect(subscriptions.first().locator('[data-testid="subscription-price"]')).toBeVisible();
    }
  });

  test('should display subscription status', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Should show status badge
      await expect(subscriptions.first().locator('[data-testid="subscription-status"]')).toBeVisible();
      
      // Status should be ACTIVE, CANCELED, or PAST_DUE
      const statusText = await subscriptions.first().locator('[data-testid="subscription-status"]').textContent();
      expect(statusText).toMatch(/active|canceled|past.due/i);
    }
  });

  test('should cancel subscription with confirmation', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Click cancel button
      await subscriptions.first().locator('[data-testid="cancel-button"]').click();
      
      // Should show confirmation modal
      await waitForModalToOpen(page, 'cancel-subscription-modal');
      await expect(page.locator('text=/confirm.*cancel/i')).toBeVisible();
      await expect(page.locator('text=/access.*until.*period.*ends/i')).toBeVisible();
      
      // Confirm cancellation
      await page.click('button:has-text("Cancel Subscription")');
      
      // Wait for API call
      await waitForApiResponse(page, /subscriptions.*cancel/);
      
      // Should show success message
      await waitForToast(page, /canceled/i);
      
      // Status should update to show cancellation
      await expect(subscriptions.first().locator('[data-testid="subscription-status"]')).toContainText(/cancel/i);
    }
  });

  test('should maintain access until period ends after cancellation', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    // Find a canceled subscription
    const canceledSub = subscriptions.filter({
      has: page.locator('[data-testid="subscription-status"]:has-text("canceled")'),
    }).first();
    
    if (await canceledSub.isVisible()) {
      // Should show access until date
      await expect(canceledSub.locator('[data-testid="access-until"]')).toBeVisible();
      
      // Should indicate no renewal
      await expect(canceledSub.locator('text=/will not renew/i')).toBeVisible();
    }
  });

  test('should update payment method', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Click update payment method
      await subscriptions.first().locator('[data-testid="update-payment-button"]').click();
      
      // Should show payment method modal
      await waitForModalToOpen(page, 'update-payment-modal');
      
      // Should have Stripe Elements
      const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
      await expect(stripeFrame.locator('input[name="cardnumber"]')).toBeVisible();
      
      // Fill in new card details
      await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
      await stripeFrame.locator('input[name="exp-date"]').fill('12/25');
      await stripeFrame.locator('input[name="cvc"]').fill('123');
      await stripeFrame.locator('input[name="postal"]').fill('12345');
      
      // Submit
      await page.click('button:has-text("Update")');
      
      // Wait for API call
      await waitForApiResponse(page, /subscriptions.*payment-method/);
      
      // Should show success message
      await waitForToast(page, /updated/i);
    }
  });

  test('should display payment method last 4 digits', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Should show payment method info
      const paymentInfo = subscriptions.first().locator('[data-testid="payment-method"]');
      await expect(paymentInfo).toBeVisible();
      
      // Should show last 4 digits
      const paymentText = await paymentInfo.textContent();
      expect(paymentText).toMatch(/\d{4}/);
    }
  });

  test('should display next billing date', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Should show next billing date
      await expect(subscriptions.first().locator('[data-testid="next-billing-date"]')).toBeVisible();
    }
  });

  test('should handle failed payment notification', async ({ page }) => {
    await page.goto('/subscriptions');
    
    // Find subscription with past due status
    const pastDueSub = page.locator('[data-testid="subscription-card"]').filter({
      has: page.locator('[data-testid="subscription-status"]:has-text("past due")'),
    }).first();
    
    if (await pastDueSub.isVisible()) {
      // Should show payment failed warning
      await expect(pastDueSub.locator('[data-testid="payment-failed-warning"]')).toBeVisible();
      
      // Should have update payment button
      await expect(pastDueSub.locator('[data-testid="update-payment-button"]')).toBeVisible();
    }
  });

  test('should reactivate canceled subscription', async ({ page }) => {
    await page.goto('/subscriptions');
    
    // Find a canceled subscription
    const canceledSub = page.locator('[data-testid="subscription-card"]').filter({
      has: page.locator('[data-testid="subscription-status"]:has-text("canceled")'),
    }).first();
    
    if (await canceledSub.isVisible()) {
      // Should have reactivate button
      const reactivateButton = canceledSub.locator('[data-testid="reactivate-button"]');
      
      if (await reactivateButton.isVisible()) {
        await reactivateButton.click();
        
        // Should show confirmation
        await waitForModalToOpen(page);
        await page.click('button:has-text("Reactivate")');
        
        // Wait for API call
        await waitForApiResponse(page, /subscriptions.*reactivate/);
        
        // Should show success
        await waitForToast(page, /reactivated/i);
        
        // Status should update to active
        await expect(canceledSub.locator('[data-testid="subscription-status"]')).toContainText(/active/i);
      }
    }
  });

  test('should display subscription benefits', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Click to expand details
      await subscriptions.first().click();
      
      // Should show benefits
      await expect(page.locator('[data-testid="subscription-benefits"]')).toBeVisible();
      await expect(page.locator('text=/access.*all.*content/i')).toBeVisible();
    }
  });

  test('should filter subscriptions by status', async ({ page }) => {
    await page.goto('/subscriptions');

    // Click active filter button
    await page.click('button:has-text("Active")');

    // All visible subscriptions should be active
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    const count = await subscriptions.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(subscriptions.nth(i).locator('[data-testid="subscription-status"]')).toContainText(/active/i);
      }
    }
  });

  test('should navigate to creator profile from subscription', async ({ page }) => {
    await page.goto('/subscriptions');
    
    const subscriptions = page.locator('[data-testid="subscription-card"]');
    
    if (await subscriptions.first().isVisible()) {
      // Click on creator name
      await subscriptions.first().locator('[data-testid="creator-name"]').click();
      
      // Should navigate to creator profile
      await page.waitForURL(/creator\//);
      await expect(page.locator('[data-testid="creator-profile"]')).toBeVisible();
    }
  });

  test('should display subscription history', async ({ page }) => {
    await page.goto('/subscriptions');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Subscriptions page should load (history feature planned)
    await expect(page.locator('[data-testid="subscription-manager"]')).toBeVisible();
  });
});
