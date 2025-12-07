import { Page } from '@playwright/test';

/**
 * UI-Based Content Seeding Helpers
 *
 * Seeds test content by using the actual upload UI flow
 * More reliable than API-based seeding as it tests real functionality
 */

interface TestContentItem {
  filename: string;
  title: string;
  description: string;
  contentType: string;
}

const TEST_CONTENT: TestContentItem[] = [
  {
    filename: 'sample-audio.mp3',
    title: 'Sample Audio Track',
    description: 'A test audio file for E2E testing',
    contentType: 'audio/mpeg',
  },
  {
    filename: 'tutorial-video.mp4',
    title: 'Tutorial Video',
    description: 'Educational video content',
    contentType: 'video/mp4',
  },
  {
    filename: 'course-materials.pdf',
    title: 'Course Materials PDF',
    description: 'Downloadable course materials',
    contentType: 'application/pdf',
  },
  {
    filename: 'album-cover.jpg',
    title: 'Album Cover Art',
    description: 'High resolution album artwork',
    contentType: 'image/jpeg',
  },
];

/**
 * Upload a single content item via UI
 */
export async function uploadContent(
  page: Page,
  item: TestContentItem
): Promise<void> {
  // Navigate to upload page
  await page.goto('/content/upload');

  // Wait for upload area
  await page.waitForSelector('[data-testid="upload-area"]');

  // Create a test file buffer
  const buffer = Buffer.from(`Test content for ${item.filename}`);

  // Select file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: item.filename,
    mimeType: item.contentType,
    buffer,
  });

  // Wait for metadata form to appear
  await page.waitForSelector('input[name="title"]', { timeout: 5000 });

  // Fill in metadata
  await page.fill('input[name="title"]', item.title);
  await page.fill('textarea[name="description"]', item.description);

  // Submit
  await page.click('button[type="submit"]:has-text("Upload Content")');

  // Wait for upload to start (progress indicator appears)
  try {
    await page.waitForSelector('[data-testid="upload-progress"]', {
      state: 'visible',
      timeout: 5000,
    });

    // Give it a moment to process, but don't wait for completion
    // since mock uploads may not trigger full flow
    await page.waitForTimeout(2000);
  } catch (error) {
    // If progress doesn't appear, that's okay - might be instant
    console.warn(`Upload progress not detected for ${item.filename}`);
  }

  // Navigate back to content library to reset for next upload
  await page.goto('/content');
  await page.waitForTimeout(500);
}

/**
 * Seed multiple test content items via UI
 */
export async function seedTestContent(page: Page): Promise<number> {
  let successCount = 0;

  for (const item of TEST_CONTENT) {
    try {
      await uploadContent(page, item);
      successCount++;
      console.log(`✓ Uploaded: ${item.title}`);
    } catch (error) {
      console.warn(`Failed to upload ${item.title}:`, error);
    }
  }

  console.log(`\n✅ Seeded ${successCount}/${TEST_CONTENT.length} content items via UI\n`);
  return successCount;
}

/**
 * Clear all content via UI (delete all items)
 */
export async function clearTestContent(page: Page): Promise<void> {
  await page.goto('/content');

  // Wait for content grid to load
  await page.waitForSelector('[data-testid="content-grid"]', { timeout: 5000 });

  // Get all content items
  const items = page.locator('[data-testid="content-item"]');
  const count = await items.count();

  console.log(`Clearing ${count} existing content items...`);

  // Delete each item
  for (let i = 0; i < count; i++) {
    // Always click the first item since the list updates after each deletion
    await items.first().click();

    // Wait for preview/details modal
    await page.waitForTimeout(500);

    // Click delete button
    await page.click('[data-testid="delete-button"]');

    // Confirm deletion in modal
    await page.click('button:has-text("Delete")');

    // Wait for item to be removed
    await page.waitForTimeout(1000);
  }

  console.log(`✓ Cleared ${count} content items`);
}
