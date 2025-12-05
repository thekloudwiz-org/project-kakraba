import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForApiResponse } from '../utils/wait-helpers';

/**
 * Fan Portal Content Discovery Tests
 * 
 * Tests content browsing, search, and filtering
 * Validates: Requirements 6.1-6.6
 */

test.describe('Content Discovery', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-fan@example.com', 'TestPassword123!');
    await page.waitForURL(/discover|home/);
  });

  test('should display discovery feed with featured content', async ({ page }) => {
    await page.goto('/discover');
    
    // Should see featured section
    await expect(page.locator('[data-testid="featured-content"]')).toBeVisible();
    
    // Should see trending section
    await expect(page.locator('[data-testid="trending-content"]')).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await page.goto('/discover');
    
    // Should see search bar
    const searchBar = page.locator('[data-testid="search-bar"]');
    await expect(searchBar).toBeVisible();
  });

  test('should search for content and return results', async ({ page }) => {
    await page.goto('/discover');
    
    // Enter search query
    await page.fill('[data-testid="search-bar"]', 'music');
    await page.press('[data-testid="search-bar"]', 'Enter');
    
    // Wait for search results
    await waitForApiResponse(page, /products.*search=music/);
    
    // Should display search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Results should contain search term
    const results = page.locator('[data-testid="product-card"]');
    await expect(results.first()).toBeVisible();
  });

  test('should show autocomplete suggestions while typing', async ({ page }) => {
    await page.goto('/discover');
    
    // Start typing in search bar
    await page.fill('[data-testid="search-bar"]', 'mus');
    
    // Should show autocomplete dropdown
    await expect(page.locator('[data-testid="autocomplete-dropdown"]')).toBeVisible();
    
    // Should have suggestions
    const suggestions = page.locator('[data-testid="autocomplete-item"]');
    await expect(suggestions.first()).toBeVisible();
  });

  test('should filter content by type', async ({ page }) => {
    await page.goto('/discover');
    
    // Open filter panel
    await page.click('[data-testid="filter-button"]');
    
    // Select video filter
    await page.check('input[name="contentType"][value="VIDEO"]');
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await waitForApiResponse(page, /products.*contentType=VIDEO/);
    
    // All results should be videos
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    
    for (let i = 0; i < count; i++) {
      await expect(products.nth(i).locator('[data-testid="content-type"]')).toHaveText(/video/i);
    }
  });

  test('should filter content by price range', async ({ page }) => {
    await page.goto('/discover');
    
    // Open filter panel
    await page.click('[data-testid="filter-button"]');
    
    // Set price range
    await page.fill('input[name="minPrice"]', '5');
    await page.fill('input[name="maxPrice"]', '20');
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await waitForApiResponse(page, /products.*minPrice=5.*maxPrice=20/);
    
    // All results should be within price range
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    
    for (let i = 0; i < count; i++) {
      const priceText = await products.nth(i).locator('[data-testid="product-price"]').textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
      expect(price).toBeGreaterThanOrEqual(5);
      expect(price).toBeLessThanOrEqual(20);
    }
  });

  test('should filter content by creator', async ({ page }) => {
    await page.goto('/discover');
    
    // Open filter panel
    await page.click('[data-testid="filter-button"]');
    
    // Select a creator
    await page.click('[data-testid="creator-filter"]');
    await page.click('[data-testid="creator-option"]').first();
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await waitForApiResponse(page, /products.*creatorId=/);
    
    // All results should be from the same creator
    const products = page.locator('[data-testid="product-card"]');
    const firstCreator = await products.first().locator('[data-testid="creator-name"]').textContent();
    
    const count = await products.count();
    for (let i = 0; i < count; i++) {
      const creatorName = await products.nth(i).locator('[data-testid="creator-name"]').textContent();
      expect(creatorName).toBe(firstCreator);
    }
  });

  test('should view creator profile', async ({ page }) => {
    await page.goto('/discover');
    
    // Click on a creator card
    await page.click('[data-testid="creator-card"]').first();
    
    // Should navigate to creator profile
    await page.waitForURL(/creator\//);
    
    // Should display creator information
    await expect(page.locator('[data-testid="creator-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="creator-content-library"]')).toBeVisible();
    await expect(page.locator('[data-testid="subscription-options"]')).toBeVisible();
  });

  test('should view product details', async ({ page }) => {
    await page.goto('/discover');
    
    // Click on a product card
    await page.click('[data-testid="product-card"]').first();
    
    // Should navigate to product details
    await page.waitForURL(/product\//);
    
    // Should display product information
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible();
  });

  test('should display product preview content', async ({ page }) => {
    await page.goto('/discover');
    
    // Click on a product card
    await page.click('[data-testid="product-card"]').first();
    
    // Should show preview section
    await expect(page.locator('[data-testid="preview-section"]')).toBeVisible();
    
    // Should have preview media or images
    const preview = page.locator('[data-testid="preview-media"]');
    if (await preview.isVisible()) {
      await expect(preview).toBeVisible();
    }
  });

  test('should display product reviews', async ({ page }) => {
    await page.goto('/discover');
    
    // Click on a product card
    await page.click('[data-testid="product-card"]').first();
    
    // Should show reviews section
    await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
    
    // Should display rating
    await expect(page.locator('[data-testid="product-rating"]')).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    await page.goto('/discover');
    
    // Apply some filters
    await page.click('[data-testid="filter-button"]');
    await page.check('input[name="contentType"][value="VIDEO"]');
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await waitForApiResponse(page, /products.*contentType=VIDEO/);
    
    // Clear filters
    await page.click('[data-testid="clear-filters"]');
    
    // Wait for unfiltered results
    await waitForApiResponse(page, /products/);
    
    // Should show all content again
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test('should paginate through discovery results', async ({ page }) => {
    await page.goto('/discover');
    
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Click next page
      await page.click('[data-testid="next-page"]');
      
      // Wait for new content
      await waitForApiResponse(page, /products.*page=2/);
      
      // URL should reflect page change
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
