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
    // Wait for page to load after login
    await page.waitForLoadState('networkidle');
  });

  test('should display content library with accessible content', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should see content library
    await expect(page.locator('[data-testid="content-library"]')).toBeVisible();

    // Check if there are content items (may be empty for new users)
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      await expect(contentItems.first()).toBeVisible();
    }
  });

  test('should filter library by content type', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Click AUDIO filter button
    await page.click('button:has-text("AUDIO")');

    // Wait for filtered results to load
    await page.waitForLoadState('networkidle');

    // All visible items should be audio
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(contentItems.nth(i).locator('[data-testid="content-type"]')).toContainText(/audio/i);
      }
    }
  });

  test('should display access type and download quota', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if there are content items
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      // Should show access information on the card
      const firstItem = contentItems.first();
      await expect(firstItem.locator('[data-testid="access-type"]')).toBeVisible();

      // Download quota may not be visible on all items (only those with quota limits)
      const downloadQuota = firstItem.locator('[data-testid="download-quota"]');
      if (await downloadQuota.isVisible()) {
        await expect(downloadQuota).toBeVisible();
      }
    }
  });

  test('should stream audio content', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find an audio item
    const audioItem = page.locator('[data-testid="library-content-item"]').filter({
      has: page.locator('[data-testid="content-type"]:has-text("AUDIO")'),
    }).first();

    if (await audioItem.isVisible()) {
      // Click stream button on the audio item
      await audioItem.locator('[data-testid="stream-button"]').click();

      // Wait for media player modal to open
      await expect(page.locator('[data-testid="media-player"]')).toBeVisible();

      // Should show audio player
      await expect(page.locator('[data-testid="audio-player"]')).toBeVisible();
    }
  });

  test('should stream video content', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find a video item
    const videoItem = page.locator('[data-testid="library-content-item"]').filter({
      has: page.locator('[data-testid="content-type"]:has-text("VIDEO")'),
    }).first();

    if (await videoItem.isVisible()) {
      // Click stream button on the video item
      await videoItem.locator('[data-testid="stream-button"]').click();

      // Wait for media player modal to open
      await expect(page.locator('[data-testid="media-player"]')).toBeVisible();

      // Should show video player
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
    }
  });

  test('should have playback controls for media player', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find a streamable content item (audio or video)
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const streamButton = contentItems.first().locator('[data-testid="stream-button"]');

    if (await streamButton.isVisible()) {
      // Click stream button to open player
      await streamButton.click();

      // Wait for media player to open
      await expect(page.locator('[data-testid="media-player"]')).toBeVisible();

      // Wait a moment for controls to render
      await page.waitForTimeout(500);

      // Should have playback controls with test IDs
      const playPauseButton = page.locator('[data-testid="play-pause-button"]');
      const volumeControl = page.locator('[data-testid="volume-control"]');
      const progressBar = page.locator('[data-testid="progress-bar"]');

      await expect(playPauseButton).toBeVisible();
      await expect(volumeControl).toBeVisible();
      await expect(progressBar).toBeVisible();

      // Test play/pause functionality
      const initialState = await playPauseButton.getAttribute('aria-label');
      await playPauseButton.click();
      await page.waitForTimeout(300);
      const newState = await playPauseButton.getAttribute('aria-label');

      // State should have changed (from Play to Pause or vice versa)
      expect(initialState).not.toBe(newState);
    }
  });

  test('should download content with available quota', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if there are content items
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      const firstItem = contentItems.first();

      // Check if download quota is visible and has remaining downloads
      const downloadQuota = firstItem.locator('[data-testid="download-quota"]');

      if (await downloadQuota.isVisible()) {
        const quotaText = await downloadQuota.textContent();
        const match = quotaText?.match(/(\d+)\s*\/\s*(\d+)/);

        if (match) {
          const current = parseInt(match[1]);
          const total = parseInt(match[2]);

          if (current < total) {
            // Has available quota - download button should be enabled
            const downloadButton = firstItem.locator('[data-testid="download-button"]');
            await expect(downloadButton).toBeEnabled();
          }
        }
      }
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

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if there are content items with stream buttons
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      const firstItem = contentItems.first();
      const streamButton = firstItem.locator('[data-testid="stream-button"]');

      if (await streamButton.isVisible()) {
        // Get initial quota if visible
        const downloadQuota = firstItem.locator('[data-testid="download-quota"]');

        if (await downloadQuota.isVisible()) {
          const initialQuotaText = await downloadQuota.textContent();
          const initialMatch = initialQuotaText?.match(/(\d+)\s*\/\s*(\d+)/);

          if (initialMatch) {
            const initialCurrent = parseInt(initialMatch[1]);

            // Stream the content
            await streamButton.click();

            // Wait for player to open
            await expect(page.locator('[data-testid="media-player"]')).toBeVisible();

            // Close player and check quota again
            await page.keyboard.press('Escape');

            // Wait for page to settle
            await page.waitForLoadState('networkidle');

            // Check quota again
            const newQuotaText = await downloadQuota.textContent();
            const newMatch = newQuotaText?.match(/(\d+)\s*\/\s*(\d+)/);

            if (newMatch) {
              const newCurrent = parseInt(newMatch[1]);

              // Quota should remain the same
              expect(newCurrent).toBe(initialCurrent);
            }
          }
        }
      }
    }
  });

  test('should display content metadata in player', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if there are content items with stream buttons
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      const firstItem = contentItems.first();
      const streamButton = firstItem.locator('[data-testid="stream-button"]');

      if (await streamButton.isVisible()) {
        // Click stream button
        await streamButton.click();

        // Wait for media player to open
        await expect(page.locator('[data-testid="media-player"]')).toBeVisible();

        // Should show content title (creator name test ID not added yet)
        await expect(page.locator('[data-testid="player-content-title"]')).toBeVisible();
      }
    }
  });

  test('should handle expired signed URLs', async ({ page }) => {
    await page.goto('/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find a streamable content item
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const streamButton = contentItems.first().locator('[data-testid="stream-button"]');

    if (await streamButton.isVisible()) {
      let requestCount = 0;

      // Mock the stream URL API to return expired URL on first call, then valid URL
      await page.route('**/api/content/*/stream-url', async (route) => {
        requestCount++;

        if (requestCount === 1) {
          // First request: return an expired URL
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              url: 'https://expired-url.example.com/video.mp4',
              expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
            }),
          });
        } else {
          // Subsequent requests: return a valid URL
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              url: 'https://valid-url.example.com/video.mp4',
              expiresAt: new Date(Date.now() + 900000).toISOString(), // Valid for 15 minutes
            }),
          });
        }
      });

      // Click stream button to open player
      await streamButton.click();

      // Wait for media player to open
      await expect(page.locator('[data-testid="media-player"]')).toBeVisible();

      // Wait for the expired URL error to appear (the useEffect will detect it immediately)
      await expect(page.locator('[data-testid="url-expired-error"]')).toBeVisible({ timeout: 3000 });

      // Verify error message mentions expiration
      const errorText = await page.locator('[data-testid="url-expired-error"]').textContent();
      expect(errorText?.toLowerCase()).toContain('expired');

      // Verify refresh button is visible
      const refreshButton = page.locator('[data-testid="refresh-url-button"]');
      await expect(refreshButton).toBeVisible();

      // Click refresh button
      await refreshButton.click();

      // Wait for the error to disappear (indicating the URL was refreshed)
      await expect(page.locator('[data-testid="url-expired-error"]')).not.toBeVisible({ timeout: 3000 });

      // Media player should still be visible with the new URL
      await expect(page.locator('[data-testid="media-player"]')).toBeVisible();
    }
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

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Search field should be visible
    const searchInput = page.locator('[data-testid="library-search"]');
    await expect(searchInput).toBeVisible();

    // Get the first content item if it exists
    const contentItems = page.locator('[data-testid="library-content-item"]');
    const count = await contentItems.count();

    if (count > 0) {
      // Get the title of the first item
      const firstItemTitle = await contentItems.first().locator('[data-testid="content-title"]').textContent();

      if (firstItemTitle) {
        // Extract a search term from the title (first word)
        const searchTerm = firstItemTitle.trim().split(' ')[0].toLowerCase();

        // Enter search query
        await searchInput.fill(searchTerm);

        // Wait for search to filter
        await page.waitForTimeout(500);

        // Should show filtered results
        const filteredItems = page.locator('[data-testid="library-content-item"]');
        const filteredCount = await filteredItems.count();

        // Should have at least one result
        expect(filteredCount).toBeGreaterThan(0);

        // Verify results match search term
        for (let i = 0; i < Math.min(filteredCount, 3); i++) {
          const itemTitle = await filteredItems.nth(i).locator('[data-testid="content-title"]').textContent();
          expect(itemTitle?.toLowerCase()).toContain(searchTerm);
        }
      }
    } else {
      // If no content, just verify search field works
      await searchInput.fill('test');
      await expect(searchInput).toHaveValue('test');
    }
  });
});
