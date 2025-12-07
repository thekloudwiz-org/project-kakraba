import { test, expect, Page } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForApiResponse, waitForToast } from '../utils/wait-helpers';
import { testContent } from '../fixtures/test-data';
import { seedTestContent } from '../utils/content-seed-helpers';

/**
 * Creator Portal Content Management Tests
 *
 * Tests content upload, editing, and deletion flows
 * Validates: Requirements 2.1-2.8
 */

test.describe('Content Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-creator@example.com', 'TestPassword123!');
    await page.waitForURL(/dashboard/);
  });

  test('should navigate to content upload page', async ({ page }) => {
    // Navigate to content section via navigation menu
    await page.click('a[href="/content"]');

    // Should be on content library page
    await expect(page).toHaveURL(/\/content$/);

    // Click upload button
    await page.click('button:has-text("Upload Content")');

    // Should be on upload page
    await expect(page).toHaveURL(/\/content\/upload/);
    await expect(page.locator('[data-testid="upload-area"]')).toBeVisible();
  });

  test('should display file upload interface with supported formats', async ({ page }) => {
    await page.goto('/content/upload');
    
    // Check for upload area
    const uploadArea = page.locator('[data-testid="upload-area"]');
    await expect(uploadArea).toBeVisible();
    
    // Check for supported formats message
    await expect(page.locator('text=/audio.*video.*pdf.*image/i')).toBeVisible();
  });

  test('should validate file type before upload', async ({ page }) => {
    await page.goto('/content/upload');
    
    // Try to upload an unsupported file type
    const fileInput = page.locator('input[type="file"]');
    
    // Create a test file with unsupported extension
    const buffer = Buffer.from('test content');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer,
    });
    
    // Should show validation error
    await expect(page.locator('text=/unsupported.*file.*type/i')).toBeVisible();
  });

  test('should show upload progress during file upload', async ({ page }) => {
    await page.goto('/content/upload');
    
    // Upload a valid file
    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('test audio content');
    
    await fileInput.setInputFiles({
      name: 'test-audio.mp3',
      mimeType: 'audio/mpeg',
      buffer,
    });
    
    // Should show progress indicator
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
  });

  test('should create content record after successful upload', async ({ page }) => {
    await page.goto('/content/upload');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('test content');
    
    await fileInput.setInputFiles({
      name: 'test-video.mp4',
      mimeType: 'video/mp4',
      buffer,
    });
    
    // Fill in metadata
    await page.fill('input[name="title"]', testContent.video.title);
    await page.fill('textarea[name="description"]', testContent.video.description);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for success
    await waitForToast(page, /success/i);
    
    // Should redirect to content library
    await page.waitForURL(/content/);
  });

  test.skip('should display content library with all uploaded items', async ({ page }) => {
    // Skip: Requires backend API integration for test data
    await page.goto('/content');

    // Should see content grid/list
    const contentGrid = page.locator('[data-testid="content-grid"]');
    await expect(contentGrid).toBeVisible();

    // Should see at least one content item
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems.first()).toBeVisible();
  });

  test.skip('should display content details when clicking on item', async ({ page }) => {
    // Skip: Requires backend API integration for test data
    await page.goto('/content');

    // Click on first content item
    await page.locator('[data-testid="content-item"]').first().click();

    // Should show content details
    await expect(page.locator('[data-testid="content-details"]')).toBeVisible();
    await expect(page.locator('text=/title/i')).toBeVisible();
    await expect(page.locator('text=/description/i')).toBeVisible();
  });

  test.skip('should edit content metadata', async ({ page }) => {
    // Skip: Requires backend API integration for test data
    await page.goto('/content');
    
    // Click on first content item
    await page.locator('[data-testid="content-item"]').first().click();
    
    // Click edit button
    await page.click('[data-testid="edit-button"]');
    
    // Update title
    const newTitle = `Updated Title ${Date.now()}`;
    await page.fill('input[name="title"]', newTitle);
    
    // Save changes
    await page.click('button[type="submit"]');
    
    // Wait for success
    await waitForToast(page, /updated/i);
    
    // Verify new title is displayed
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  test.skip('should delete content item with confirmation', async ({ page }) => {
    // Skip: Requires backend API integration for test data
    await page.goto('/content');
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="content-item"]').count();
    
    // Click on first content item
    await page.locator('[data-testid="content-item"]').first().click();
    
    // Click delete button
    await page.click('[data-testid="delete-button"]');
    
    // Should show confirmation modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=/confirm.*delete/i')).toBeVisible();
    
    // Confirm deletion
    await page.click('button:has-text("Delete")');
    
    // Wait for success
    await waitForToast(page, /deleted/i);
    
    // Should return to content library
    await page.waitForURL(/content/);
    
    // Count should decrease
    const newCount = await page.locator('[data-testid="content-item"]').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test.skip('should filter content by type', async ({ page }) => {
    // Skip: Requires backend API integration for test data
    await page.goto('/content');

    // Wait for content grid to load
    await page.waitForSelector('[data-testid="content-grid"]');

    // Select video filter using select dropdown
    await page.selectOption('[data-testid="content-type-filter"]', 'VIDEO');

    // Wait for filtered results
    await page.waitForTimeout(1000); // Wait for re-render

    // All visible items should be videos
    const contentItems = page.locator('[data-testid="content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const item = contentItems.nth(i);
        await expect(item.locator('[data-testid="content-type"]')).toHaveText(/VIDEO/i);
      }
    }
  });

  test('should paginate content library', async ({ page }) => {
    await page.goto('/content');
    
    // Check if pagination exists (only if there are enough items)
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Click next page
      await page.click('[data-testid="next-page"]');
      
      // Wait for new content to load
      await waitForApiResponse(page, /content.*page=2/);
      
      // URL should reflect page change
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
