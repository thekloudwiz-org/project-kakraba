import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForToast } from '../utils/wait-helpers';
import { testProduct } from '../fixtures/test-data';

/**
 * Creator Portal Product Creation Tests
 * 
 * Tests product creation, editing, and configuration flows
 * Validates: Requirements 3.1-3.8
 */

test.describe('Product Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-creator@example.com', 'TestPassword123!');
    await page.waitForURL(/dashboard/);
  });

  test('should navigate to product creation page', async ({ page }) => {
    // Navigate to products section
    await page.click('text=/products/i');
    
    // Click create product button
    await page.click('text=/create.*product/i');
    
    // Should see product creation form
    await expect(page).toHaveURL(/products\/create/);
  });

  test('should display product creation form with all fields', async ({ page }) => {
    await page.goto('/products/create');
    
    // Check for required fields
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="price"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="access-type-selector"]')).toBeVisible();
  });

  test('should create a single content product', async ({ page }) => {
    await page.goto('/products/create');
    
    // Fill in product details
    await page.fill('input[name="title"]', testProduct.single.title);
    await page.fill('textarea[name="description"]', testProduct.single.description);
    await page.fill('input[name="price"]', testProduct.single.price.toString());
    
    // Select single content item
    await page.click('[data-testid="content-selector"]');
    await page.click('[data-testid="content-item"]').first();
    
    // Set access type
    await page.click('[data-testid="access-type-selector"]');
    await page.click('text=/purchase/i');
    
    // Set download quota
    await page.fill('input[name="downloadQuota"]', testProduct.single.downloadQuota.toString());
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for success
    await waitForToast(page, /created/i);
    
    // Should redirect to products page
    await page.waitForURL(/products/);
  });

  test('should create a bundle product with multiple content items', async ({ page }) => {
    await page.goto('/products/create');
    
    // Fill in product details
    await page.fill('input[name="title"]', testProduct.bundle.title);
    await page.fill('textarea[name="description"]', testProduct.bundle.description);
    await page.fill('input[name="price"]', testProduct.bundle.price.toString());
    
    // Select multiple content items
    await page.click('[data-testid="content-selector"]');
    await page.click('[data-testid="content-item"]').first();
    await page.click('[data-testid="content-item"]').nth(1);
    await page.click('[data-testid="content-selector"]'); // Close selector
    
    // Verify multiple items selected
    const selectedCount = await page.locator('[data-testid="selected-content"]').count();
    expect(selectedCount).toBeGreaterThan(1);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for success
    await waitForToast(page, /created/i);
  });

  test('should validate price within allowed range', async ({ page }) => {
    await page.goto('/products/create');
    
    // Try to set price below minimum
    await page.fill('input[name="price"]', '0.50');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=/price.*minimum/i')).toBeVisible();
    
    // Try to set price above maximum
    await page.fill('input[name="price"]', '10000');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=/price.*maximum/i')).toBeVisible();
  });

  test('should enable subscription access for product', async ({ page }) => {
    await page.goto('/products/create');
    
    // Fill in basic details
    await page.fill('input[name="title"]', testProduct.subscription.title);
    await page.fill('input[name="price"]', testProduct.subscription.price.toString());
    
    // Select content
    await page.click('[data-testid="content-selector"]');
    await page.click('[data-testid="content-item"]').first();
    
    // Enable subscription
    await page.check('input[name="allowSubscription"]');
    
    // Verify subscription is enabled
    await expect(page.locator('input[name="allowSubscription"]')).toBeChecked();
    
    // Submit
    await page.click('button[type="submit"]');
    await waitForToast(page, /created/i);
  });

  test('should display product catalog with all products', async ({ page }) => {
    await page.goto('/products');
    
    // Should see product grid
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();
    
    // Should see at least one product
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test('should display product details with pricing and access info', async ({ page }) => {
    await page.goto('/products');
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Should show product details
    await expect(page.locator('[data-testid="product-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="access-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible();
  });

  test('should edit existing product', async ({ page }) => {
    await page.goto('/products');
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Click edit button
    await page.click('[data-testid="edit-button"]');
    
    // Update price
    const newPrice = '14.99';
    await page.fill('input[name="price"]', newPrice);
    
    // Save changes
    await page.click('button[type="submit"]');
    
    // Wait for success
    await waitForToast(page, /updated/i);
    
    // Verify new price is displayed
    await expect(page.locator(`text=$${newPrice}`)).toBeVisible();
  });

  test('should delete product with confirmation', async ({ page }) => {
    await page.goto('/products');
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Click delete button
    await page.click('[data-testid="delete-button"]');
    
    // Should show confirmation modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=/confirm.*delete/i')).toBeVisible();
    
    // Confirm deletion
    await page.click('button:has-text("Delete")');
    
    // Wait for success
    await waitForToast(page, /deleted/i);
    
    // Should return to products page
    await page.waitForURL(/products/);
    
    // Count should decrease
    const newCount = await page.locator('[data-testid="product-card"]').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('should filter products by price range', async ({ page }) => {
    await page.goto('/products');
    
    // Set price filter
    await page.fill('input[name="minPrice"]', '5');
    await page.fill('input[name="maxPrice"]', '15');
    await page.click('[data-testid="apply-filter"]');
    
    // All visible products should be within range
    const products = page.locator('[data-testid="product-card"]');
    const count = await products.count();
    
    for (let i = 0; i < count; i++) {
      const priceText = await products.nth(i).locator('[data-testid="product-price"]').textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
      expect(price).toBeGreaterThanOrEqual(5);
      expect(price).toBeLessThanOrEqual(15);
    }
  });

  test('should show sales metrics for products', async ({ page }) => {
    await page.goto('/products');
    
    // Click on first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Should show sales metrics
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="purchase-count"]')).toBeVisible();
  });
});
