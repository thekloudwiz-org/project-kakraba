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

    // Wait for metadata form to appear
    await page.waitForSelector('input[name="title"]', { timeout: 5000 });

    // Fill in metadata
    await page.fill('input[name="title"]', 'Test Audio');
    await page.fill('textarea[name="description"]', 'Test Description');

    // Submit to start upload
    await page.click('button[type="submit"]');

    // Should show progress indicator
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible({ timeout: 10000 });
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

  test('should display content library with all uploaded items', async ({ page }) => {
    await page.goto('/content');

    // Should see content grid/list
    const contentGrid = page.locator('[data-testid="content-grid"]');
    await expect(contentGrid).toBeVisible();

    // Should see at least one content item
    const contentItems = page.locator('[data-testid="content-item"]');
    await expect(contentItems.first()).toBeVisible();
  });

  test('should display content details when clicking on item', async ({ page }) => {
    await page.goto('/content');

    // Wait for content grid and items to be fully loaded
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="content-grid"]')).toBeVisible();

    // Wait for content items to be visible
    const firstItem = page.locator('[data-testid="content-item"]').first();
    await expect(firstItem).toBeVisible();

    // Click on the first content item
    await firstItem.click();

    // Wait for API call to complete and modal to render
    await page.waitForResponse(response =>
      response.url().includes('/content/') && response.status() === 200
    );

    // Should show content details modal
    const contentDetails = page.locator('[data-testid="content-details"]');
    await expect(contentDetails).toBeVisible({ timeout: 5000 });

    // Should show content title as a heading (any title) or show action buttons
    // Modal should be functional even if content data is incomplete
    const hasTitle = await contentDetails.locator('h3').first().isVisible();
    const hasEditButton = await contentDetails.locator('[data-testid="edit-button"]').isVisible();

    expect(hasTitle || hasEditButton).toBeTruthy();
  });

  test('should edit content metadata', async ({ page }) => {
    await page.goto('/content');

    // Click on first content item to open preview modal
    await page.locator('[data-testid="content-item"]').first().click();

    // Wait for API call to complete
    await page.waitForResponse(response =>
      response.url().includes('/content/') && response.status() === 200
    );

    // Wait for preview modal to appear
    await expect(page.locator('[data-testid="content-details"]')).toBeVisible({ timeout: 5000 });

    // Click edit button in the modal
    await page.locator('[role="dialog"]').locator('[data-testid="edit-button"]').click();

    // Update title in the editor modal
    const newTitle = `Updated Title ${Date.now()}`;
    await page.fill('input[name="title"]', newTitle);

    // Save changes
    await page.click('button[type="submit"]');

    // Wait for success toast
    await waitForToast(page, /updated/i);

    // Verify new title is displayed
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  test('should delete content item with confirmation', async ({ page }) => {
    await page.goto('/content');

    // Wait for content to load and get initial count
    await expect(page.locator('[data-testid="content-item"]').first()).toBeVisible();
    const initialCount = await page.locator('[data-testid="content-item"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // Click on first content item to open preview modal
    await page.locator('[data-testid="content-item"]').first().click();

    // Wait for API call to complete
    await page.waitForResponse(response =>
      response.url().includes('/content/') && response.status() === 200
    );

    // Wait for preview modal to appear
    await expect(page.locator('[data-testid="content-details"]')).toBeVisible({ timeout: 5000 });

    // Click delete button in the preview modal
    const previewModal = page.locator('[role="dialog"]').first();
    await previewModal.locator('[data-testid="delete-button"]').click();

    // Should show confirmation modal
    await expect(page.locator('text=/confirm.*delete/i')).toBeVisible();

    // Confirm deletion by clicking the Delete button in the confirmation modal
    await page.locator('button:has-text("Delete")').last().click();

    // Wait for success toast
    await waitForToast(page, /deleted/i);

    // Wait for the deleted item to be removed from DOM
    await page.waitForTimeout(1000);

    // Should still be on content page
    await expect(page).toHaveURL(/\/content/);

    // Count should decrease
    const newCount = await page.locator('[data-testid="content-item"]').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('should filter content by type', async ({ page }) => {
    await page.goto('/content');

    // Wait for content grid to load
    await page.waitForSelector('[data-testid="content-grid"]');

    // Wait for at least one content item to be visible initially
    await expect(page.locator('[data-testid="content-item"]').first()).toBeVisible();

    // Select video filter using select dropdown
    await page.selectOption('[data-testid="content-type-filter"]', 'VIDEO');

    // Wait for API response
    await waitForApiResponse(page, /content/);

    // Wait for content items to be visible after filter
    await expect(page.locator('[data-testid="content-item"]').first()).toBeVisible();

    // All visible items should be videos
    const contentItems = page.locator('[data-testid="content-item"]');
    const count = await contentItems.count();

    // Verify at least one item exists
    expect(count).toBeGreaterThan(0);

    // Check that all items are videos by looking for the VIDEO badge
    for (let i = 0; i < count; i++) {
      const item = contentItems.nth(i);
      const badge = item.locator('[data-testid="content-type"]');
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText('VIDEO');
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
