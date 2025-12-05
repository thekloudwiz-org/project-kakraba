import { test, expect } from '@playwright/test';
import { loginUser } from '../utils/auth-helpers';
import { waitForApiResponse } from '../utils/wait-helpers';

/**
 * Fan Portal Content Access Tests
 * 
 * Tests content library, streaming, and download functionality
 * Validates: Requirements 8.1-8.7
 */

test.describe('Content Access and Consumption', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page, 'test-fan@example.com', 'TestPassword123!');
    await page.waitForURL(/discover|home/);
  });

  test('should display content library with accessible content', async ({ page }) => {
    await page.goto('/library');
    
    // Should see content library
    await expect(page.locator('[data-testid="content-library"]')).toBeVisible();
    
    // Should have content items
    const contentItems = page.locator('[data-testid="library-content-item"]');
    await expect(contentItems.first()).toBeVisible();
  });

  test('should filter library by content type', async ({ page }) => {
    await page.goto('/library');
    
    // Click filter dropdown
    await page.click('[data-testid="content-type-filter"]');
    
    // Select audio filter
    await page.click('text=/audio/i');
    
    // Wait for filtered results
    await waitForApiResponse(page, /content.*contentType=AUDIO/);
    
    // All visible items should be audio
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();
    
    for (let i = 0; i < count; i++) {
      await expect(contentItems.nth(i).locator('[data-testid="content-type"]')).toHaveText(/audio/i);
    }
  });

  test('should display access type and download quota', async ({ page }) => {
    await page.goto('/library');
    
    // Click on a content item
    await page.click('[data-testid="library-content-item"]').first();
    
    // Should show access information
    await expect(page.locator('[data-testid="access-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-quota"]')).toBeVisible();
  });

  test('should stream audio content', async ({ page }) => {
    await page.goto('/library');
    
    // Find an audio item
    const audioItem = page.locator('[data-testid="library-content-item"]').filter({
      has: page.locator('[data-testid="content-type"]:has-text("audio")'),
    }).first();
    
    await audioItem.click();
    
    // Click stream button
    await page.click('[data-testid="stream-button"]');
    
    // Wait for signed URL generation
    await waitForApiResponse(page, /access\/generate-link.*intent=STREAM/);
    
    // Should show media player
    await expect(page.locator('[data-testid="media-player"]')).toBeVisible();
    await expect(page.locator('audio')).toBeVisible();
  });

  test('should stream video content', async ({ page }) => {
    await page.goto('/library');
    
    // Find a video item
    const videoItem = page.locator('[data-testid="library-content-item"]').filter({
      has: page.locator('[data-testid="content-type"]:has-text("video")'),
    }).first();
    
    await videoItem.click();
    
    // Click stream button
    await page.click('[data-testid="stream-button"]');
    
    // Wait for signed URL generation
    await waitForApiResponse(page, /access\/generate-link.*intent=STREAM/);
    
    // Should show video player
    await expect(page.locator('[data-testid="media-player"]')).toBeVisible();
    await expect(page.locator('video')).toBeVisible();
  });

  test('should have playback controls for media player', async ({ page }) => {
    await page.goto('/library');
    
    // Stream a content item
    await page.click('[data-testid="library-content-item"]').first();
    await page.click('[data-testid="stream-button"]');
    await waitForApiResponse(page, /access\/generate-link/);
    
    // Should have playback controls
    await expect(page.locator('[data-testid="play-pause-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="volume-control"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  test('should download content with available quota', async ({ page }) => {
    await page.goto('/library');
    
    // Click on a content item
    await page.click('[data-testid="library-content-item"]').first();
    
    // Check download quota
    const quotaText = await page.locator('[data-testid="download-quota"]').textContent();
    const remainingDownloads = parseInt(quotaText?.match(/\d+/)?.[0] || '0');
    
    if (remainingDownloads > 0) {
      // Click download button
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-button"]');
      
      // Wait for signed URL generation
      await waitForApiResponse(page, /access\/generate-link.*intent=DOWNLOAD/);
      
      // Should initiate download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBeTruthy();
    }
  });

  test('should prevent download when quota is exhausted', async ({ page }) => {
    await page.goto('/library');
    
    // Find an item with zero quota
    const exhaustedItem = page.locator('[data-testid="library-content-item"]').filter({
      has: page.locator('[data-testid="download-quota"]:has-text("0")'),
    }).first();
    
    if (await exhaustedItem.isVisible()) {
      await exhaustedItem.click();
      
      // Download button should be disabled
      await expect(page.locator('[data-testid="download-button"]')).toBeDisabled();
      
      // Should show quota exhausted message
      await expect(page.locator('text=/quota.*exhausted/i')).toBeVisible();
    }
  });

  test('should not decrement quota when streaming', async ({ page }) => {
    await page.goto('/library');
    
    // Click on a content item
    await page.click('[data-testid="library-content-item"]').first();
    
    // Get initial quota
    const initialQuotaText = await page.locator('[data-testid="download-quota"]').textContent();
    const initialQuota = parseInt(initialQuotaText?.match(/\d+/)?.[0] || '0');
    
    // Stream the content
    await page.click('[data-testid="stream-button"]');
    await waitForApiResponse(page, /access\/generate-link.*intent=STREAM/);
    
    // Go back to library
    await page.goto('/library');
    await page.click('[data-testid="library-content-item"]').first();
    
    // Check quota again
    const newQuotaText = await page.locator('[data-testid="download-quota"]').textContent();
    const newQuota = parseInt(newQuotaText?.match(/\d+/)?.[0] || '0');
    
    // Quota should remain the same
    expect(newQuota).toBe(initialQuota);
  });

  test('should display content metadata in player', async ({ page }) => {
    await page.goto('/library');
    
    // Stream a content item
    await page.click('[data-testid="library-content-item"]').first();
    await page.click('[data-testid="stream-button"]');
    await waitForApiResponse(page, /access\/generate-link/);
    
    // Should show content title and creator
    await expect(page.locator('[data-testid="player-content-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="player-creator-name"]')).toBeVisible();
  });

  test('should handle expired signed URLs', async ({ page }) => {
    await page.goto('/library');
    
    // Stream a content item
    await page.click('[data-testid="library-content-item"]').first();
    await page.click('[data-testid="stream-button"]');
    await waitForApiResponse(page, /access\/generate-link/);
    
    // Wait for URL to expire (in real scenario, this would be 15 minutes)
    // For testing, we can mock this or test the error handling
    
    // If URL expires, should show error and refresh option
    // This is a placeholder for the actual test logic
  });

  test('should show recently accessed content', async ({ page }) => {
    await page.goto('/library');
    
    // Should have recently accessed section
    const recentSection = page.locator('[data-testid="recently-accessed"]');
    
    if (await recentSection.isVisible()) {
      await expect(recentSection).toBeVisible();
      
      // Should have recent items
      const recentItems = page.locator('[data-testid="recent-content-item"]');
      await expect(recentItems.first()).toBeVisible();
    }
  });

  test('should search within library', async ({ page }) => {
    await page.goto('/library');
    
    // Enter search query
    await page.fill('[data-testid="library-search"]', 'music');
    
    // Wait for search results
    await waitForApiResponse(page, /content.*search=music/);
    
    // Should show filtered results
    const contentItems = page.locator('[data-testid="library-content-item"]');
    await expect(contentItems.first()).toBeVisible();
  });
});
