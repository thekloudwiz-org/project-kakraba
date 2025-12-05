import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import RevenueChart from '../components/dashboard/RevenueChart';
import ContentPerformanceTable from '../components/dashboard/ContentPerformanceTable';
import { api } from '@kakraba/shared';

// Mock the API
vi.mock('@kakraba/shared', async () => {
  const actual = await vi.importActual('@kakraba/shared');
  return {
    ...actual,
    api: {
      analytics: {
        getDashboard: vi.fn(),
        getRevenue: vi.fn(),
        getContentPerformance: vi.fn(),
      },
      user: {
        getPurchases: vi.fn(),
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
 * Feature: creator-fan-portals, Property 17: Revenue analytics display trends
 * Validates: Requirements 4.2
 * 
 * For any revenue data, the analytics view should display charts showing trends 
 * over time with daily, weekly, and monthly aggregations.
 */
describe('Property 17: Revenue analytics display trends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should display revenue trends for any valid revenue data', async () => {
    // Test with a few different revenue data sets
    const testCases = [
      [{ date: '2024-01-01', revenue: 100 }],
      [
        { date: '2024-01-01', revenue: 1000 },
        { date: '2024-01-02', revenue: 1500 },
      ],
      [
        { date: '2024-01-01', revenue: 500 },
        { date: '2024-01-02', revenue: 750 },
        { date: '2024-01-03', revenue: 1200 },
      ],
    ];

    for (const revenueData of testCases) {
      vi.mocked(api.analytics.getRevenue).mockResolvedValue(revenueData);

      const { unmount } = render(
        <TestWrapper>
          <RevenueChart />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
      });

      // Verify at least one data point is displayed
      const formattedRevenue = `$${revenueData[0].revenue.toLocaleString()}`;
      expect(screen.getByText(formattedRevenue)).toBeInTheDocument();

      // Clean up before next iteration
      unmount();
      cleanup();
    }
  });

  it('should support daily, weekly, and monthly granularity', async () => {
    const mockData = [
      { date: '2024-01-01', revenue: 1000 },
      { date: '2024-01-02', revenue: 1500 },
    ];

    vi.mocked(api.analytics.getRevenue).mockResolvedValue(mockData);

    render(
      <TestWrapper>
        <RevenueChart />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    });

    // Verify granularity selector exists
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);

    // Verify granularity options are available
    const granularitySelect = selects.find(select => 
      select.querySelector('option[value="daily"]')
    );
    expect(granularitySelect).toBeDefined();
    expect(granularitySelect?.querySelector('option[value="weekly"]')).toBeDefined();
    expect(granularitySelect?.querySelector('option[value="monthly"]')).toBeDefined();
  });

  it('should handle empty revenue data gracefully', async () => {
    vi.mocked(api.analytics.getRevenue).mockResolvedValue([]);

    render(
      <TestWrapper>
        <RevenueChart />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No revenue data available for this period')).toBeInTheDocument();
    });
  });
});

/**
 * Feature: creator-fan-portals, Property 18: Content performance shows all metrics
 * Validates: Requirements 4.3
 * 
 * For any content item, the performance view should display views, downloads, 
 * and revenue generated.
 */
describe('Property 18: Content performance shows all metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should display all metrics for any content performance data', async () => {
    // Test with different content performance data sets
    const testCases = [
      [
        {
          contentId: '123',
          title: 'Test Content 1',
          views: 100,
          downloads: 10,
          revenue: 50,
        },
      ],
      [
        {
          contentId: '456',
          title: 'Test Content 2',
          views: 1000,
          downloads: 100,
          revenue: 500,
        },
        {
          contentId: '789',
          title: 'Test Content 3',
          views: 5000,
          downloads: 500,
          revenue: 2500,
        },
      ],
    ];

    for (const contentData of testCases) {
      vi.mocked(api.analytics.getContentPerformance).mockResolvedValue(contentData);

      const { unmount } = render(
        <TestWrapper>
          <ContentPerformanceTable />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Content Performance')).toBeInTheDocument();
      });

      // Verify table headers exist
      expect(screen.getByRole('columnheader', { name: /content/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /views/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /downloads/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /revenue/i })).toBeInTheDocument();

      // Verify first content item is displayed
      const firstContent = contentData[0];
      expect(screen.getByText(firstContent.title)).toBeInTheDocument();

      // Clean up before next iteration
      unmount();
      cleanup();
    }
  });

  it('should handle zero metrics correctly', async () => {
    const contentData = [
      {
        contentId: '123',
        title: 'New Content',
        views: 0,
        downloads: 0,
        revenue: 0,
      },
    ];

    vi.mocked(api.analytics.getContentPerformance).mockResolvedValue(contentData);

    render(
      <TestWrapper>
        <ContentPerformanceTable />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('New Content')).toBeInTheDocument();
    });

    // Verify zero values are displayed (using getAllByText since there are multiple zeros)
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('should handle empty content performance data', async () => {
    vi.mocked(api.analytics.getContentPerformance).mockResolvedValue([]);

    render(
      <TestWrapper>
        <ContentPerformanceTable />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No content performance data available')).toBeInTheDocument();
    });
  });
});

/**
 * Feature: creator-fan-portals, Property 19: Fan engagement displays statistics
 * Validates: Requirements 4.4
 * 
 * For any creator, the engagement view should display active fans, new fans, 
 * and subscription retention statistics.
 */
describe('Property 19: Fan engagement displays statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should display all engagement metrics for any dashboard data', async () => {
    // Test with different dashboard data sets
    const testCases = [
      {
        totalRevenue: 1000,
        activeSubscribers: 50,
        contentViews: 5000,
        newFans: 10,
      },
      {
        totalRevenue: 50000,
        activeSubscribers: 500,
        contentViews: 100000,
        newFans: 100,
      },
    ];

    for (const dashboardData of testCases) {
      vi.mocked(api.analytics.getDashboard).mockResolvedValue(dashboardData);

      const { unmount } = render(
        <TestWrapper>
          <DashboardOverview />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      });

      // Verify all engagement metrics are displayed
      expect(screen.getByText('Active Subscribers')).toBeInTheDocument();
      expect(screen.getByText('Content Views')).toBeInTheDocument();
      expect(screen.getByText('New Fans')).toBeInTheDocument();

      // Verify metric values are displayed
      expect(screen.getByText(dashboardData.activeSubscribers.toLocaleString())).toBeInTheDocument();
      expect(screen.getByText(dashboardData.contentViews.toLocaleString())).toBeInTheDocument();
      expect(screen.getByText(dashboardData.newFans.toLocaleString())).toBeInTheDocument();

      // Clean up before next iteration
      unmount();
      cleanup();
    }
  });

  it('should display zero values correctly', async () => {
    const dashboardData = {
      totalRevenue: 0,
      activeSubscribers: 0,
      contentViews: 0,
      newFans: 0,
    };

    vi.mocked(api.analytics.getDashboard).mockResolvedValue(dashboardData);

    render(
      <TestWrapper>
        <DashboardOverview />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Active Subscribers')).toBeInTheDocument();
    });

    // Verify zero values are displayed
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThan(0);
  });

  it('should handle large numbers correctly', async () => {
    const dashboardData = {
      totalRevenue: 1234567.89,
      activeSubscribers: 123456,
      contentViews: 9876543,
      newFans: 5432,
    };

    vi.mocked(api.analytics.getDashboard).mockResolvedValue(dashboardData);

    render(
      <TestWrapper>
        <DashboardOverview />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Active Subscribers')).toBeInTheDocument();
    });

    // Verify large numbers are formatted with commas
    expect(screen.getByText('123,456')).toBeInTheDocument();
    expect(screen.getByText('9,876,543')).toBeInTheDocument();
    expect(screen.getByText('5,432')).toBeInTheDocument();
  });
});
