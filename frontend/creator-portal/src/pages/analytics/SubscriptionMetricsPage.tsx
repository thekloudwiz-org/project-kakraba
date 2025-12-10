import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export default function SubscriptionMetricsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { data: subscriptionMetrics } = useQuery({
    queryKey: ['subscription-metrics', timeRange],
    queryFn: async () => {
      // Mock data for now
      return {
        totalSubscribers: 0,
        newSubscribers: 0,
        churnRate: 0,
        mrr: 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Subscription Metrics</h1>
            <p className="text-gray-400">
              Track your subscription performance and recurring revenue
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Subscribers</h3>
            <p className="text-3xl font-bold text-white" data-testid="total-subscribers">
              {subscriptionMetrics?.totalSubscribers?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-green-400 mt-2">+12% from last period</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">New Subscribers</h3>
            <p className="text-3xl font-bold text-white" data-testid="new-subscribers">
              {subscriptionMetrics?.newSubscribers?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-green-400 mt-2">+8% from last period</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Churn Rate</h3>
            <p className="text-3xl font-bold text-white" data-testid="churn-rate">
              {subscriptionMetrics?.churnRate?.toFixed(1) || '0'}%
            </p>
            <p className="text-sm text-red-400 mt-2">-2% from last period</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">MRR</h3>
            <p className="text-3xl font-bold text-white" data-testid="mrr">
              ${subscriptionMetrics?.mrr?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-green-400 mt-2">+15% from last period</p>
          </div>
        </div>

        {/* Subscription Growth Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription Growth</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Subscriber count over time
          </div>
        </div>

        {/* MRR Trend Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">MRR Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Monthly recurring revenue over time
          </div>
        </div>

        {/* Subscription Plans Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription Plans</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Subscribers</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">MRR</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="py-3 px-4 text-white" colSpan={4}>
                    <div className="text-center text-gray-400">
                      No subscription plans available
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
