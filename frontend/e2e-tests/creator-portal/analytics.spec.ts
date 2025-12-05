import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForApiResponse } from '../utils/wait-helpers';

/**
 * Creator Portal Analytics Tests
 * 
 * Tests analytics dashboard and data visualization
 * Validates: Requirements 4.1-4.6
 */

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-creator@example.com', 'TestPassword123!');
    await page.waitForURL(/dashboard/);
  });

  test('should display dashboard with key metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should see key metrics cards
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-subscribers"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-fans"]')).toBeVisible();
  });

  test('should display revenue chart with trends', async ({ page }) => {
    await page.goto('/analytics');
    
    // Should see revenue chart
    const revenueChart = page.locator('[data-testid="revenue-chart"]');
    await expect(revenueChart).toBeVisible();
    
    // Chart should have data points
    await expect(revenueChart.locator('svg')).toBeVisible();
  });

  test('should switch between daily, weekly, and monthly views', async ({ page }) => {
    await page.goto('/analytics');
    
    // Click weekly view
    await page.click('[data-testid="view-weekly"]');
    await waitForApiResponse(page, /analytics.*granularity=weekly/);
    
    // Verify weekly view is active
    await expect(page.locator('[data-testid="view-weekly"]')).toHaveClass(/active/);
    
    // Click monthly view
    await page.click('[data-testid="view-monthly"]');
    await waitForApiResponse(page, /analytics.*granularity=monthly/);
    
    // Verify monthly view is active
    await expect(page.locator('[data-testid="view-monthly"]')).toHaveClass(/active/);
  });

  test('should display content performance metrics', async ({ page }) => {
    await page.goto('/analytics/content');
    
    // Should see content performance table
    const performanceTable = page.locator('[data-testid="content-performance-table"]');
    await expect(performanceTable).toBeVisible();
    
    // Table should have columns for views, downloads, and revenue
    await expect(page.locator('th:has-text("Views")')).toBeVisible();
    await expect(page.locator('th:has-text("Downloads")')).toBeVisible();
    await expect(page.locator('th:has-text("Revenue")')).toBeVisible();
  });

  test('should display fan engagement statistics', async ({ page }) => {
    await page.goto('/analytics/fans');
    
    // Should see fan engagement metrics
    await expect(page.locator('[data-testid="active-fans"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-fans"]')).toBeVisible();
    await expect(page.locator('[data-testid="subscription-retention"]')).toBeVisible();
  });

  test('should filter analytics by time range', async ({ page }) => {
    await page.goto('/analytics');
    
    // Click time range selector
    await page.click('[data-testid="time-range-selector"]');
    
    // Select last 30 days
    await page.click('text=/last 30 days/i');
    
    // Wait for filtered data
    await waitForApiResponse(page, /analytics.*startDate/);
    
    // Verify time range is applied
    await expect(page.locator('[data-testid="time-range-selector"]')).toContainText(/30 days/i);
  });

  test('should filter analytics by custom date range', async ({ page }) => {
    await page.goto('/analytics');
    
    // Click time range selector
    await page.click('[data-testid="time-range-selector"]');
    
    // Select custom range
    await page.click('text=/custom/i');
    
    // Set start and end dates
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.click('button:has-text("Apply")');
    
    // Wait for filtered data
    await waitForApiResponse(page, /analytics.*startDate=2024-01-01/);
  });

  test('should export analytics data as CSV', async ({ page }) => {
    await page.goto('/analytics');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify file is CSV
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('should display recent activity feed', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should see recent activity section
    const activityFeed = page.locator('[data-testid="recent-activity"]');
    await expect(activityFeed).toBeVisible();
    
    // Should have activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    await expect(activityItems.first()).toBeVisible();
  });

  test('should show revenue breakdown by product', async ({ page }) => {
    await page.goto('/analytics/revenue');
    
    // Should see revenue breakdown
    await expect(page.locator('[data-testid="revenue-by-product"]')).toBeVisible();
    
    // Should list products with revenue
    const productRevenue = page.locator('[data-testid="product-revenue-item"]');
    await expect(productRevenue.first()).toBeVisible();
  });

  test('should display subscription metrics', async ({ page }) => {
    await page.goto('/analytics/subscriptions');
    
    // Should see subscription metrics
    await expect(page.locator('[data-testid="total-subscribers"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-subscribers"]')).toBeVisible();
    await expect(page.locator('[data-testid="churn-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="mrr"]')).toBeVisible(); // Monthly Recurring Revenue
  });

  test('should sort content performance by different metrics', async ({ page }) => {
    await page.goto('/analytics/content');
    
    // Click sort by revenue
    await page.click('th:has-text("Revenue")');
    
    // Wait for sorted data
    await waitForApiResponse(page, /analytics.*sort=revenue/);
    
    // Verify sorting indicator
    await expect(page.locator('th:has-text("Revenue")')).toHaveClass(/sorted/);
  });

  test('should refresh analytics data', async ({ page }) => {
    await page.goto('/analytics');
    
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');
    
    // Wait for data to reload
    await waitForApiResponse(page, /analytics/);
    
    // Should show updated timestamp
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
  });
});
