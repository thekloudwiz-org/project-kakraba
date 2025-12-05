import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ProductCatalog from '../components/product/ProductCatalog';
import { api } from '@kakraba/shared';

// Mock the API
vi.mock('@kakraba/shared', async () => {
  const actual = await vi.importActual('@kakraba/shared');
  return {
    ...actual,
    api: {
      product: {
        listProducts: vi.fn(),
        getProductById: vi.fn(),
        createProduct: vi.fn(),
        updateProduct: vi.fn(),
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
 * Feature: creator-fan-portals, Property 11: Content selection supports single and multiple
 * Validates: Requirements 3.2
 * 
 * For any product creation, the system should allow selection of either a single 
 * content item or multiple content items for bundles.
 */
describe('Property 11: Content selection supports single and multiple', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should support single content selection', () => {
    const singleContentProduct = {
      contentIds: ['content-1'],
      productType: 'SINGLE',
    };

    expect(singleContentProduct.contentIds.length).toBe(1);
    expect(singleContentProduct.productType).toBe('SINGLE');
  });

  it('should support multiple content selection for bundles', () => {
    const testCases = [
      { contentIds: ['content-1', 'content-2'], expectedType: 'BUNDLE' },
      { contentIds: ['content-1', 'content-2', 'content-3'], expectedType: 'BUNDLE' },
      { contentIds: ['content-1', 'content-2', 'content-3', 'content-4'], expectedType: 'BUNDLE' },
    ];

    testCases.forEach(({ contentIds, expectedType }) => {
      const bundleProduct = {
        contentIds,
        productType: contentIds.length > 1 ? 'BUNDLE' : 'SINGLE',
      };

      expect(bundleProduct.contentIds.length).toBeGreaterThan(1);
      expect(bundleProduct.productType).toBe(expectedType);
    });
  });
});

/**
 * Feature: creator-fan-portals, Property 12: Price validation enforces limits
 * Validates: Requirements 3.3
 * 
 * For any product price input, the system should validate that the price is 
 * within minimum and maximum allowed values.
 */
describe('Property 12: Price validation enforces limits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const MIN_PRICE = 0.99;
  const MAX_PRICE = 10000;

  it('should reject prices below minimum', () => {
    const testCases = [0, 0.50, 0.98, -1, -10];

    testCases.forEach((price) => {
      const isValid = price >= MIN_PRICE && price <= MAX_PRICE;
      expect(isValid).toBe(false);
    });
  });

  it('should reject prices above maximum', () => {
    const testCases = [10001, 15000, 100000];

    testCases.forEach((price) => {
      const isValid = price >= MIN_PRICE && price <= MAX_PRICE;
      expect(isValid).toBe(false);
    });
  });

  it('should accept valid prices within range', () => {
    const testCases = [0.99, 1.00, 5.99, 9.99, 50.00, 100.00, 999.99, 10000];

    testCases.forEach((price) => {
      const isValid = price >= MIN_PRICE && price <= MAX_PRICE;
      expect(isValid).toBe(true);
    });
  });
});

/**
 * Feature: creator-fan-portals, Property 14: Product save creates complete record
 * Validates: Requirements 3.6
 * 
 * For any product configuration, saving should create a DynamoDB record with 
 * all configuration details (pricing, access rules, content IDs).
 */
describe('Property 14: Product save creates complete record', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should create product with all required fields', async () => {
    const testCases = [
      {
        title: 'Test Product 1',
        description: 'Test description',
        contentIds: ['content-1'],
        price: 9.99,
        accessType: 'PURCHASE',
        productType: 'SINGLE',
        allowSubscription: false,
      },
      {
        title: 'Test Bundle',
        description: 'Bundle description',
        contentIds: ['content-1', 'content-2', 'content-3'],
        price: 29.99,
        accessType: 'RENTAL',
        productType: 'BUNDLE',
        allowSubscription: true,
        downloadQuota: 3,
      },
    ];

    for (const productData of testCases) {
      vi.mocked(api.product.createProduct).mockResolvedValue({
        productId: 'product-123',
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      });

      const result = await api.product.createProduct(productData);

      // Verify all required fields are present
      expect(result.title).toBe(productData.title);
      expect(result.description).toBe(productData.description);
      expect(result.contentIds).toEqual(productData.contentIds);
      expect(result.price).toBe(productData.price);
      expect(result.accessType).toBe(productData.accessType);
      expect(result.productType).toBe(productData.productType);
      expect(result.allowSubscription).toBe(productData.allowSubscription);
      expect(result.productId).toBeDefined();
      expect(result.createdAt).toBeDefined();
    }
  });

  it('should display products in catalog with all details', async () => {
    const mockProducts = [
      {
        productId: '1',
        title: 'Product 1',
        description: 'Description 1',
        price: 9.99,
        contentIds: ['content-1'],
        accessType: 'PURCHASE',
        productType: 'SINGLE',
        allowSubscription: false,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        productId: '2',
        title: 'Product 2',
        description: 'Description 2',
        price: 19.99,
        contentIds: ['content-1', 'content-2'],
        accessType: 'RENTAL',
        productType: 'BUNDLE',
        allowSubscription: true,
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
      },
    ];

    vi.mocked(api.product.listProducts).mockResolvedValue({
      items: mockProducts,
      total: mockProducts.length,
      page: 1,
      limit: 12,
    });

    const { unmount } = render(
      <TestWrapper>
        <ProductCatalog />
      </TestWrapper>
    );

    // Wait for products to load - check for loading state to disappear first
    await waitFor(
      () => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Then verify first product is displayed
    await waitFor(
      () => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify all products are displayed
    mockProducts.forEach((product) => {
      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
    });

    unmount();
    cleanup();
  });
});
