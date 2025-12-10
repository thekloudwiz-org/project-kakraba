import { Page } from '@playwright/test';
import { uploadContent } from './content-seed-helpers';

/**
 * UI-Based Product Seeding Helpers
 *
 * Seeds test products by using the actual product creation UI flow
 * Ensures content exists first (products require content)
 */

interface TestProductItem {
  title: string;
  description: string;
  price: number;
  contentCount: number; // How many content items to select
  allowSubscription?: boolean;
}

const TEST_PRODUCTS: TestProductItem[] = [
  {
    title: 'Single Audio Track',
    description: 'A single audio track product',
    price: 4.99,
    contentCount: 1,
  },
  {
    title: 'Video Tutorial Bundle',
    description: 'Bundle of video tutorials',
    price: 19.99,
    contentCount: 2,
  },
  {
    title: 'Premium Content Pack',
    description: 'Premium content with subscription access',
    price: 9.99,
    contentCount: 1,
    allowSubscription: true,
  },
];

/**
 * Ensure content exists for product creation
 * Returns the number of content items available
 */
async function ensureContentExists(page: Page): Promise<number> {
  await page.goto('/content');
  await page.waitForLoadState('networkidle');

  // Check if content exists
  const contentGrid = page.locator('[data-testid="content-grid"]');
  const hasContent = await contentGrid.isVisible().catch(() => false);

  if (!hasContent) {
    console.log('No content found. Creating test content...');
    
    // Upload minimal content for product creation
    const testContent = [
      {
        filename: 'test-audio.mp3',
        title: 'Test Audio for Products',
        description: 'Audio content for product testing',
        contentType: 'audio/mpeg',
      },
      {
        filename: 'test-video.mp4',
        title: 'Test Video for Products',
        description: 'Video content for product testing',
        contentType: 'video/mp4',
      },
    ];

    for (const item of testContent) {
      try {
        await uploadContent(page, item);
        console.log(`✓ Uploaded: ${item.title}`);
      } catch (error) {
        console.warn(`Failed to upload ${item.title}:`, error);
      }
    }
  }

  // Count available content
  await page.goto('/content');
  await page.waitForLoadState('networkidle');
  const contentItems = page.locator('[data-testid="content-item"]');
  const count = await contentItems.count();
  
  console.log(`✓ ${count} content items available for product creation`);
  return count;
}

/**
 * Create a single product via UI
 */
export async function createProduct(
  page: Page,
  product: TestProductItem
): Promise<void> {
  // Navigate to product creation page
  await page.goto('/products/create');
  await page.waitForLoadState('networkidle');

  // Step 1: Fill in product details
  await page.fill('input[name="title"]', product.title);
  await page.fill('textarea[name="description"]', product.description);
  await page.click('button:has-text("Next")');

  // Step 2: Select content
  await page.waitForSelector('[data-testid="content-selector"]', { timeout: 5000 });
  
  const contentItems = page.locator('[data-testid="content-item"]');
  const availableCount = await contentItems.count();

  if (availableCount === 0) {
    throw new Error('No content available to create product');
  }

  // Select the requested number of content items (or all available if less)
  const selectCount = Math.min(product.contentCount, availableCount);
  for (let i = 0; i < selectCount; i++) {
    await contentItems.nth(i).click();
    await page.waitForTimeout(200); // Small delay between clicks
  }

  await page.click('button:has-text("Next")');

  // Step 3: Set pricing
  await page.fill('input[name="price"]', product.price.toString());

  // Enable subscription if requested
  if (product.allowSubscription) {
    await page.check('input[name="allowSubscription"]');
  }

  await page.click('button:has-text("Next")');

  // Step 4: Review and submit
  try {
    await page.waitForSelector('h2:has-text("Review")', { timeout: 5000 });
    await page.click('button:has-text("Create Product")');

    // Wait for navigation to products page (or timeout gracefully)
    await page.waitForURL(/\/products$/, { timeout: 15000 });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.warn(`Product creation may have failed: ${error}`);
    // Try to navigate to products page anyway
    await page.goto('/products');
  }
}

/**
 * Seed multiple test products via UI
 * Ensures content exists first
 */
export async function seedTestProducts(page: Page): Promise<number> {
  // First, ensure content exists
  const contentCount = await ensureContentExists(page);

  if (contentCount === 0) {
    console.error('❌ Cannot create products: No content available');
    return 0;
  }

  let successCount = 0;

  for (const product of TEST_PRODUCTS) {
    // Skip if not enough content for this product
    if (product.contentCount > contentCount) {
      console.warn(`⏭️  Skipping "${product.title}" - requires ${product.contentCount} content items, only ${contentCount} available`);
      continue;
    }

    try {
      await createProduct(page, product);
      successCount++;
      console.log(`✓ Created product: ${product.title}`);
    } catch (error) {
      console.warn(`Failed to create product ${product.title}:`, error);
    }
  }

  console.log(`\n✅ Seeded ${successCount}/${TEST_PRODUCTS.length} products via UI\n`);
  return successCount;
}

/**
 * Clear all products via UI (delete all items)
 */
export async function clearTestProducts(page: Page): Promise<void> {
  await page.goto('/products');
  await page.waitForLoadState('networkidle');

  // Check if products exist
  const productGrid = page.locator('[data-testid="product-grid"]');
  const hasProducts = await productGrid.isVisible().catch(() => false);

  if (!hasProducts) {
    console.log('No products to clear');
    return;
  }

  // Get all product items
  const items = page.locator('[data-testid="product-card"]');
  const count = await items.count();

  console.log(`Clearing ${count} existing products...`);

  // Delete each item
  for (let i = 0; i < count; i++) {
    // Always click the first item's edit button since the list updates after each deletion
    const firstCard = items.first();
    await firstCard.locator('[data-testid="edit-button"]').click();

    // Wait for edit modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Click delete button
    await page.locator('[role="dialog"]').locator('[data-testid="delete-button"]').click();

    // Confirm deletion
    await page.waitForSelector('text=/confirm.*delete/i', { timeout: 5000 });
    await page.locator('button:has-text("Delete")').last().click();

    // Wait for item to be removed
    await page.waitForTimeout(1000);
  }

  console.log(`✓ Cleared ${count} products`);
}
