import { APIRequestContext } from '@playwright/test';

/**
 * Test Data Seeding Script
 *
 * Seeds the database with test content for E2E tests
 * Run before tests to ensure consistent test data
 */

interface ContentItem {
  title: string;
  description: string;
  contentType: 'AUDIO' | 'VIDEO' | 'PDF' | 'IMAGE';
  fileSize: number;
  s3Key: string;
}

const TEST_CONTENT_ITEMS: ContentItem[] = [
  {
    title: 'Sample Audio Track',
    description: 'A test audio file for E2E testing',
    contentType: 'AUDIO',
    fileSize: 5242880, // 5MB
    s3Key: 'test-content/audio-sample.mp3',
  },
  {
    title: 'Tutorial Video',
    description: 'Educational video content',
    contentType: 'VIDEO',
    fileSize: 10485760, // 10MB
    s3Key: 'test-content/video-sample.mp4',
  },
  {
    title: 'Course Materials PDF',
    description: 'Downloadable course materials',
    contentType: 'PDF',
    fileSize: 2097152, // 2MB
    s3Key: 'test-content/pdf-sample.pdf',
  },
  {
    title: 'Album Cover Art',
    description: 'High resolution album artwork',
    contentType: 'IMAGE',
    fileSize: 1048576, // 1MB
    s3Key: 'test-content/image-sample.jpg',
  },
  {
    title: 'Bonus Track - Extended Mix',
    description: 'Exclusive extended mix for fans',
    contentType: 'AUDIO',
    fileSize: 7340032, // 7MB
    s3Key: 'test-content/audio-bonus.mp3',
  },
  {
    title: 'Behind The Scenes',
    description: 'Behind the scenes footage',
    contentType: 'VIDEO',
    fileSize: 15728640, // 15MB
    s3Key: 'test-content/video-bts.mp4',
  },
];

/**
 * Get authentication token for test user
 */
async function getAuthToken(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const apiEndpoint = process.env.VITE_API_ENDPOINT || 'http://localhost:3000';

  const response = await request.post(`${apiEndpoint}/auth/login`, {
    data: {
      email,
      password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Authentication failed: ${response.status()}`);
  }

  const data = await response.json();
  return data.accessToken || data.token || data.idToken;
}

/**
 * Create content items via API
 */
async function createContentItems(
  request: APIRequestContext,
  token: string,
  items: ContentItem[]
): Promise<number> {
  const apiEndpoint = process.env.VITE_API_ENDPOINT || 'http://localhost:3000';
  let createdCount = 0;

  for (const item of items) {
    try {
      // Step 1: Get upload URL
      const uploadUrlResponse = await request.post(`${apiEndpoint}/content/upload-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          filename: item.s3Key.split('/').pop(),
          contentType: item.contentType.toLowerCase(),
          fileSize: item.fileSize,
        },
      });

      if (!uploadUrlResponse.ok()) {
        console.warn(`Failed to get upload URL for ${item.title}: ${uploadUrlResponse.status()}`);
        continue;
      }

      const { contentId } = await uploadUrlResponse.json();

      // Step 2: Create content record
      const createResponse = await request.post(`${apiEndpoint}/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          contentId,
          title: item.title,
          description: item.description,
          contentType: item.contentType,
          s3Key: item.s3Key,
          fileSize: item.fileSize,
        },
      });

      if (createResponse.ok()) {
        createdCount++;
        console.log(`✓ Created: ${item.title}`);
      } else {
        console.warn(`Failed to create ${item.title}: ${createResponse.status()}`);
      }
    } catch (error) {
      console.warn(`Error creating ${item.title}:`, error);
    }
  }

  return createdCount;
}

/**
 * Clear existing test content
 */
async function clearTestContent(
  request: APIRequestContext,
  token: string
): Promise<void> {
  const apiEndpoint = process.env.VITE_API_ENDPOINT || 'http://localhost:3000';

  try {
    // Get all content
    const listResponse = await request.get(`${apiEndpoint}/content`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!listResponse.ok()) {
      console.warn('Failed to list content for cleanup');
      return;
    }

    const { items } = await listResponse.json();

    // Delete each item
    for (const item of items || []) {
      try {
        await request.delete(`${apiEndpoint}/content/${item.contentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Ignore deletion errors
      }
    }

    console.log(`✓ Cleared ${items?.length || 0} existing content items`);
  } catch (error) {
    console.warn('Error clearing test content:', error);
  }
}

/**
 * Main seeding function
 */
export async function seedTestData(
  request: APIRequestContext,
  options: {
    clearExisting?: boolean;
    creatorEmail?: string;
    creatorPassword?: string;
  } = {}
): Promise<{ success: boolean; itemsCreated: number }> {
  const {
    clearExisting = true,
    creatorEmail = 'test-creator@example.com',
    creatorPassword = 'TestPassword123!',
  } = options;

  console.log('\n🌱 Seeding test data...');

  try {
    // Authenticate
    console.log('Authenticating...');
    const token = await getAuthToken(request, creatorEmail, creatorPassword);

    // Clear existing content if requested
    if (clearExisting) {
      console.log('Clearing existing test content...');
      await clearTestContent(request, token);
    }

    // Create test content
    console.log('Creating test content items...');
    const itemsCreated = await createContentItems(request, token, TEST_CONTENT_ITEMS);

    console.log(`\n✅ Successfully seeded ${itemsCreated}/${TEST_CONTENT_ITEMS.length} items\n`);

    return { success: true, itemsCreated };
  } catch (error) {
    console.error('\n❌ Failed to seed test data:', error);
    return { success: false, itemsCreated: 0 };
  }
}

/**
 * Standalone execution for manual testing
 */
if (require.main === module) {
  const { request } = require('@playwright/test');

  (async () => {
    const context = await request.newContext();
    await seedTestData(context);
    await context.dispose();
  })();
}
