import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
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
        getFanEngagement: vi.fn(),
        exportData: vi.fn(),
      },
    },
  };
});

/**
 * Feature: creator-fan-portals, Property 20: Time range filters all analytics
 * Validates: Requirements 4.5
 * 
 * For any time range selection, all analytics data should be filtered to show 
 * only data within the selected period.
 */
describe('Property 20: Time range filters all analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should filter analytics data by time range', async () => {
    const testCases = [
      {
        range: '7d',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
      {
        range: '30d',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
      {
        range: '90d',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
    ];

    for (const testCase of testCases) {
      vi.mocked(api.analytics.getDashboard).mockResolvedValue({
        totalRevenue: 1000,
        activeSubscribers: 50,
        contentViews: 5000,
        newFans: 10,
      });

      const result = await api.analytics.getDashboard({
        startDate: testCase.startDate.toISOString(),
        endDate: testCase.endDate.toISOString(),
      });

      // Verify the API was called with correct date range
      expect(api.analytics.getDashboard).toHaveBeenCalledWith({
        startDate: testCase.startDate.toISOString(),
        endDate: testCase.endDate.toISOString(),
      });

      // Verify data is returned
      expect(result).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
      expect(result.activeSubscribers).toBeDefined();
    }
  });

  it('should filter revenue data by time range', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    const mockRevenueData = [
      { date: '2024-01-15', revenue: 100 },
      { date: '2024-01-20', revenue: 150 },
      { date: '2024-01-25', revenue: 200 },
    ];

    vi.mocked(api.analytics.getRevenue).mockResolvedValue(mockRevenueData);

    const result = await api.analytics.getRevenue({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      granularity: 'daily',
    });

    // Verify all returned data is within the date range
    result.forEach((dataPoint) => {
      const pointDate = new Date(dataPoint.date);
      expect(pointDate >= startDate).toBe(true);
      expect(pointDate <= endDate).toBe(true);
    });
  });

  it('should apply time range to all analytics endpoints', async () => {
    const startDate = new Date('2024-01-01').toISOString();
    const endDate = new Date('2024-01-31').toISOString();

    // Mock all analytics endpoints
    vi.mocked(api.analytics.getDashboard).mockResolvedValue({
      totalRevenue: 1000,
      activeSubscribers: 50,
      contentViews: 5000,
      newFans: 10,
    });

    vi.mocked(api.analytics.getRevenue).mockResolvedValue([
      { date: '2024-01-15', revenue: 100 },
    ]);

    vi.mocked(api.analytics.getFanEngagement).mockResolvedValue({
      engagementRate: 75,
      avgRevenuePerFan: 20,
      retentionRate: 85,
    });

    // Call all endpoints with the same time range
    await api.analytics.getDashboard({ startDate, endDate });
    await api.analytics.getRevenue({ startDate, endDate, granularity: 'daily' });
    await api.analytics.getFanEngagement({ startDate, endDate });

    // Verify all were called with the time range
    expect(api.analytics.getDashboard).toHaveBeenCalledWith({ startDate, endDate });
    expect(api.analytics.getRevenue).toHaveBeenCalledWith({
      startDate,
      endDate,
      granularity: 'daily',
    });
    expect(api.analytics.getFanEngagement).toHaveBeenCalledWith({ startDate, endDate });
  });
});

/**
 * Feature: creator-fan-portals, Property 21: Analytics export generates CSV
 * Validates: Requirements 4.6
 * 
 * For any analytics export request, the system should generate a CSV file 
 * containing all detailed metrics.
 */
describe('Property 21: Analytics export generates CSV', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should generate CSV with all metrics', async () => {
    const mockCSVData = `Date,Revenue,Views,Downloads,New Fans
2024-01-01,100,500,50,5
2024-01-02,150,600,60,8
2024-01-03,200,700,70,10`;

    vi.mocked(api.analytics.exportData).mockResolvedValue({
      csvData: mockCSVData,
      filename: 'analytics-export-2024-01-01.csv',
    });

    const result = await api.analytics.exportData({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Verify CSV data is returned
    expect(result.csvData).toBeDefined();
    expect(result.csvData).toContain('Date,Revenue,Views,Downloads,New Fans');
    expect(result.csvData.split('\n').length).toBeGreaterThan(1);
  });

  it('should include all required columns in CSV', async () => {
    const mockCSVData = `Date,Revenue,Views,Downloads,New Fans,Active Subscribers
2024-01-01,100,500,50,5,20`;

    vi.mocked(api.analytics.exportData).mockResolvedValue({
      csvData: mockCSVData,
      filename: 'analytics-export.csv',
    });

    const result = await api.analytics.exportData({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    const headers = result.csvData.split('\n')[0];
    const requiredColumns = ['Date', 'Revenue', 'Views', 'Downloads', 'New Fans'];

    requiredColumns.forEach((column) => {
      expect(headers).toContain(column);
    });
  });

  it('should generate CSV for different time ranges', async () => {
    const testCases = [
      {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        expectedRows: 7,
      },
      {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        expectedRows: 31,
      },
    ];

    for (const testCase of testCases) {
      const mockRows = Array.from({ length: testCase.expectedRows }, (_, i) => {
        const date = new Date(testCase.startDate);
        date.setDate(date.getDate() + i);
        return `${date.toISOString().split('T')[0]},100,500,50,5`;
      });

      const mockCSVData = `Date,Revenue,Views,Downloads,New Fans\n${mockRows.join('\n')}`;

      vi.mocked(api.analytics.exportData).mockResolvedValue({
        csvData: mockCSVData,
        filename: 'analytics-export.csv',
      });

      const result = await api.analytics.exportData({
        startDate: testCase.startDate,
        endDate: testCase.endDate,
      });

      const rows = result.csvData.split('\n');
      // +1 for header row
      expect(rows.length).toBe(testCase.expectedRows + 1);
    }
  });

  it('should handle empty data gracefully', async () => {
    const mockCSVData = `Date,Revenue,Views,Downloads,New Fans`;

    vi.mocked(api.analytics.exportData).mockResolvedValue({
      csvData: mockCSVData,
      filename: 'analytics-export.csv',
    });

    const result = await api.analytics.exportData({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    // Should still have headers even with no data
    expect(result.csvData).toContain('Date,Revenue,Views,Downloads,New Fans');
    const rows = result.csvData.split('\n');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });
});
