import { test, expect } from '@playwright/test';

/**
 * Landing Page Navigation Tests
 * 
 * Tests the basic navigation functionality of the landing page,
 * including redirects to Creator and Fan portals.
 */

test.describe('Landing Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with hero section', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Kakraba/i);
    
    // Check for hero section
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();
  });

  test('should display Creator and Fan CTA buttons', async ({ page }) => {
    // Check for Creator button
    const creatorButton = page.locator('text=/I\'m a Creator/i');
    await expect(creatorButton).toBeVisible();
    
    // Check for Fan button
    const fanButton = page.locator('text=/I\'m a Fan/i');
    await expect(fanButton).toBeVisible();
  });

  test('should display creator features section with correct message', async ({ page }) => {
    // Check for creator features section
    const creatorFeatures = page.locator('text=/Your Fans Are Waiting/i');
    await expect(creatorFeatures).toBeVisible();
    
    const uploadMessage = page.locator('text=/Upload Your Content Now/i');
    await expect(uploadMessage).toBeVisible();
  });

  test('should display fan features section with correct message', async ({ page }) => {
    // Check for fan features section
    const fanFeatures = page.locator('text=/Own It How You Want It/i');
    await expect(fanFeatures).toBeVisible();
    
    const discoverMessage = page.locator('text=/Discover Amazing Creators/i');
    await expect(discoverMessage).toBeVisible();
  });

  test('should scroll to creators section when clicking Creator button', async ({ page }) => {
    // Click the Creator button
    const creatorButton = page.locator('text=/I\'m a Creator/i').first();
    await creatorButton.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(1000);
    
    // Check that creators section is in viewport
    const creatorsSection = page.locator('#creators');
    await expect(creatorsSection).toBeInViewport();
  });

  test('should scroll to fans section when clicking Fan button', async ({ page }) => {
    // Click the Fan button
    const fanButton = page.locator('text=/I\'m a Fan/i').first();
    await fanButton.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(1000);
    
    // Check that fans section is in viewport
    const fansSection = page.locator('#fans');
    await expect(fansSection).toBeInViewport();
  });

  test('should display footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that hero section is still visible
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();
    
    // Check that CTA buttons are visible
    const creatorButton = page.locator('text=/I\'m a Creator/i').first();
    await expect(creatorButton).toBeVisible();
  });
});
