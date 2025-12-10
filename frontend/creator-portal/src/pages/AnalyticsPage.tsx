import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@kakraba/shared';
import MetricsCard from '../components/dashboard/MetricsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import ContentPerformanceTable from '../components/dashboard/ContentPerformanceTable';
import ExportButton from '../components/analytics/ExportButton';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const getDateRange = (range: TimeRange) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange(timeRange);

  const { data: metrics } = useQuery({
    queryKey: ['analytics-metrics', timeRange],
    queryFn: () => api.analytics.getDashboard({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });

  const { data: fanMetrics } = useQuery({
    queryKey: ['fan-metrics', timeRange],
    queryFn: () => api.analytics.getFanEngagement({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Time Range Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">
              Track your performance and earnings
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ExportButton
              startDate={startDate.toISOString()}
              endDate={endDate.toISOString()}
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                data-testid="time-range-selector"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Revenue"
            value={`$${metrics?.totalRevenue?.toLocaleString() || '0'}`}
            icon="💰"
            trend="+12%"
            trendUp={true}
          />
          <MetricsCard
            title="Active Subscribers"
            value={metrics?.activeSubscribers?.toLocaleString() || '0'}
            icon="👥"
            trend="+8%"
            trendUp={true}
          />
          <MetricsCard
            title="Content Views"
            value={metrics?.contentViews?.toLocaleString() || '0'}
            icon="👁️"
            trend="+15%"
            trendUp={true}
          />
          <MetricsCard
            title="New Fans"
            value={metrics?.newFans?.toLocaleString() || '0'}
            icon="⭐"
            trend="+5%"
            trendUp={true}
          />
        </div>

        {/* Fan Engagement Metrics */}
        {fanMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Engagement Rate</h3>
              <p className="text-3xl font-bold text-white">
                {fanMetrics.engagementRate?.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Avg. Revenue per Fan</h3>
              <p className="text-3xl font-bold text-white">
                ${fanMetrics.avgRevenuePerFan?.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Retention Rate</h3>
              <p className="text-3xl font-bold text-white">
                {fanMetrics.retentionRate?.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        <div className="mb-8">
          <RevenueChart />
        </div>

        {/* Content Performance */}
        <div>
          <ContentPerformanceTable />
        </div>
      </div>
    </div>
  );
}
