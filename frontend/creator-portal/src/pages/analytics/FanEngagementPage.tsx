import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@kakraba/shared';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function FanEngagementPage() {
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

  const { data: fanMetrics } = useQuery({
    queryKey: ['fan-engagement', timeRange],
    queryFn: () => api.analytics.getFanEngagement({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fan Engagement</h1>
            <p className="text-gray-400">
              Track how your fans interact with your content
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Active Fans</h3>
            <p className="text-3xl font-bold text-white" data-testid="active-fans">
              {fanMetrics?.activeFans?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-green-400 mt-2">+12% from last period</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">New Fans</h3>
            <p className="text-3xl font-bold text-white" data-testid="new-fans">
              {fanMetrics?.newFans?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-green-400 mt-2">+8% from last period</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Subscription Retention</h3>
            <p className="text-3xl font-bold text-white" data-testid="subscription-retention">
              {fanMetrics?.retentionRate?.toFixed(1) || '0'}%
            </p>
            <p className="text-sm text-green-400 mt-2">+2% from last period</p>
          </div>
        </div>

        {/* Engagement Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Engagement Rate</h3>
            <p className="text-4xl font-bold text-white mb-2">
              {fanMetrics?.engagementRate?.toFixed(1) || '0'}%
            </p>
            <p className="text-sm text-gray-400">
              Percentage of fans who actively engage with your content
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Avg. Revenue per Fan</h3>
            <p className="text-4xl font-bold text-white mb-2">
              ${fanMetrics?.avgRevenuePerFan?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-400">
              Average revenue generated per active fan
            </p>
          </div>
        </div>

        {/* Fan Activity Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Fan Activity Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Activity trends
          </div>
        </div>

        {/* Top Fans Table */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Fans</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Fan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Total Spent</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Purchases</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Active</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 text-white" colSpan={4}>
                    <div className="text-center text-gray-400">
                      No data available
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
