import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@kakraba/shared';
import { Spinner } from '@kakraba/shared';

type Granularity = 'daily' | 'weekly' | 'monthly';

export default function RevenueChart() {
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [timeRange, setTimeRange] = useState(30); // days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue', granularity, timeRange],
    queryFn: () =>
      api.analytics.getRevenue({
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        granularity,
      }),
  });

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...(revenueData?.map((d) => d.revenue) || [1]));

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700" data-testid="revenue-chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Revenue Trends</h3>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm border border-gray-600"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm border border-gray-600"
            data-testid={`view-${granularity}`}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="space-y-3" data-testid="chart-bars">
        {revenueData?.map((dataPoint, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="text-xs text-gray-400 w-24">
              {new Date(dataPoint.date).toLocaleDateString()}
            </div>
            <div className="flex-1 bg-gray-700 rounded-full h-8 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full flex items-center justify-end px-3 transition-all"
                style={{ width: `${(dataPoint.revenue / maxRevenue) * 100}%` }}
              >
                <span className="text-white text-sm font-semibold">
                  ${dataPoint.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!revenueData || revenueData.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          No revenue data available for this period
        </div>
      )}
    </div>
  );
}
