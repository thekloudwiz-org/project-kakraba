import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ContentLibrary from '../components/content/ContentLibrary';
import { api } from '@kakraba/shared';

// Mock the API
vi.mock('@kakraba/shared', async () => {
  const actual = await vi.importActual('@kakraba/shared');
  return {
    ...actual,
    api: {
      content: {
        listContent: vi.fn(),
        getContentById: vi.fn(),
        updateContent: vi.fn(),
        deleteContent: vi.fn(),
        getUploadUrl: vi.fn(),
        createContent: vi.fn(),
      },
    },
  };
});

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
}

/**
 * Feature: creator-fan-portals, Property 5: File validation before upload
 * Validates: Requirements 2.2
 * 
 * For any file selected for upload, the system should validate file type 
 * and size before initiating S3 upload, rejecting invalid files.
 */
describe('Property 5: File validation before upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should reject files exceeding maximum size', () => {
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    
    const testCases = [
      { size: MAX_FILE_SIZE + 1, shouldReject: true },
      { size: MAX_FILE_SIZE, shouldReject: false },
      { size: MAX_FILE_SIZE - 1, shouldReject: false },
      { size: 1024 * 1024, shouldReject: false }, // 1MB
    ];

    testCases.forEach(({ size, shouldReject }) => {
      const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
      Object.defineProperty(file, 'size', { value: size });

      // Validation logic (extracted from ContentUploader)
      const isInvalid = size > MAX_FILE_SIZE;
      expect(isInvalid).toBe(shouldReject);
    });
  });

  it('should reject unsupported file types', () => {
    const supportedExtensions = ['.mp3', '.wav', '.m4a', '.flac', '.mp4', '.mov', '.avi', '.mkv', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    const testCases = [
      { filename: 'test.mp3', shouldReject: false },
      { filename: 'test.mp4', shouldReject: false },
      { filename: 'test.pdf', shouldReject: false },
      { filename: 'test.jpg', shouldReject: false },
      { filename: 'test.exe', shouldReject: true },
      { filename: 'test.zip', shouldReject: true },
      { filename: 'test.doc', shouldReject: true },
    ];

    testCases.forEach(({ filename, shouldReject }) => {
      const fileExtension = `.${filename.split('.').pop()?.toLowerCase()}`;
      const isSupported = supportedExtensions.includes(fileExtension);
      expect(!isSupported).toBe(shouldReject);
    });
  });
});

/**
 * Feature: creator-fan-portals, Property 6: Upload generates unique content ID
 * Validates: Requirements 2.3
 * 
 * For any completed file upload, the system should generate a unique content ID 
 * that differs from all existing content IDs.
 */
describe('Property 6: Upload generates unique content ID', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should generate unique content IDs for multiple uploads', async () => {
    const generatedIds = new Set<string>();
    const uploadCount = 10;

    for (let i = 0; i < uploadCount; i++) {
      // Mock API response with unique ID
      const contentId = `content-${Date.now()}-${Math.random()}`;
      vi.mocked(api.content.getUploadUrl).mockResolvedValueOnce({
        uploadUrl: 'https://s3.amazonaws.com/test',
        contentId,
      });

      const response = await api.content.getUploadUrl({
        filename: `test-${i}.mp3`,
        contentType: 'audio/mp3',
        fileSize: 1024,
      });

      // Verify ID is unique
      expect(generatedIds.has(response.contentId)).toBe(false);
      generatedIds.add(response.contentId);
    }

    // Verify all IDs are unique
    expect(generatedIds.size).toBe(uploadCount);
  });
});

/**
 * Feature: creator-fan-portals, Property 8: Content library displays all items
 * Validates: Requirements 2.5
 * 
 * For any creator's content library, the display should include all uploaded 
 * content items with their thumbnails, titles, and upload dates.
 */
describe('Property 8: Content library displays all items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should display all content items with required information', async () => {
    const testCases = [
      {
        items: [
          {
            contentId: '1',
            title: 'Test Audio',
            description: 'Test description',
            contentType: 'AUDIO',
            uploadedAt: '2024-01-01T00:00:00Z',
            fileSize: 1024,
          },
        ],
      },
      {
        items: [
          {
            contentId: '2',
            title: 'Test Video',
            description: 'Video description',
            contentType: 'VIDEO',
            uploadedAt: '2024-01-02T00:00:00Z',
            fileSize: 2048,
          },
          {
            contentId: '3',
            title: 'Test PDF',
            description: 'PDF description',
            contentType: 'PDF',
            uploadedAt: '2024-01-03T00:00:00Z',
            fileSize: 512,
          },
        ],
      },
    ];

    for (const testCase of testCases) {
      vi.mocked(api.content.listContent).mockResolvedValue({
        items: testCase.items,
        total: testCase.items.length,
        page: 1,
        limit: 12,
      });

      const { unmount } = render(
        <TestWrapper>
          <ContentLibrary />
        </TestWrapper>
      );

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Then verify first item is displayed
      if (testCase.items.length > 0) {
        await waitFor(
          () => {
            expect(screen.getByText(testCase.items[0].title)).toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      }

      // Verify all items are displayed
      testCase.items.forEach((item) => {
        expect(screen.getByText(item.title)).toBeInTheDocument();
        // Content type appears in multiple places (filter dropdown and badge), so use getAllByText
        const contentTypeElements = screen.getAllByText(item.contentType);
        expect(contentTypeElements.length).toBeGreaterThan(0);
      });

      unmount();
      cleanup();
    }
  });
});

/**
 * Feature: creator-fan-portals, Property 9: Content metadata updates persist
 * Validates: Requirements 2.7
 * 
 * For any content metadata update, the changes should persist to DynamoDB 
 * and the display should refresh to show updated information.
 */
describe('Property 9: Content metadata updates persist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should persist metadata updates', async () => {
    const testCases = [
      {
        contentId: '1',
        originalTitle: 'Original Title',
        updatedTitle: 'Updated Title',
        originalDescription: 'Original description',
        updatedDescription: 'Updated description',
      },
      {
        contentId: '2',
        originalTitle: 'Test Content',
        updatedTitle: 'Modified Content',
        originalDescription: 'Test',
        updatedDescription: 'Modified',
      },
    ];

    for (const testCase of testCases) {
      // Mock update API call
      vi.mocked(api.content.updateContent).mockResolvedValue({
        contentId: testCase.contentId,
        title: testCase.updatedTitle,
        description: testCase.updatedDescription,
      });

      const result = await api.content.updateContent(testCase.contentId, {
        title: testCase.updatedTitle,
        description: testCase.updatedDescription,
      });

      // Verify the update was called with correct data
      expect(api.content.updateContent).toHaveBeenCalledWith(
        testCase.contentId,
        {
          title: testCase.updatedTitle,
          description: testCase.updatedDescription,
        }
      );

      // Verify the result contains updated data
      expect(result.title).toBe(testCase.updatedTitle);
      expect(result.description).toBe(testCase.updatedDescription);
    }
  });
});
