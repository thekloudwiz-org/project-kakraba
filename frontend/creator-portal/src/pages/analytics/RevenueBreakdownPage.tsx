import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@kakraba/shared';

type TimeRange = '7d' | '30d' | '90d' | '1y';

interface ProductRevenue {
  productId: string;
  productTitle: string;
  revenue: number;
  sales: number;
  avgPrice: number;
}

export default function RevenueBreakdownPage() {
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

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-breakdown', timeRange],
    queryFn: async () => {
      // Mock data for now
      return {
        totalRevenue: 0,
        productRevenue: [] as ProductRevenue[],
      };
    },
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Revenue Breakdown</h1>
            <p className="text-gray-400">
              See which products are generating the most revenue
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

        {/* Total Revenue Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Revenue</h3>
          <p className="text-4xl font-bold text-white">
            ${revenueData?.totalRevenue?.toLocaleString() || '0.00'}
          </p>
          <p className="text-sm text-green-400 mt-2">+15% from last period</p>
        </div>

        {/* Revenue by Product */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8" data-testid="revenue-by-product">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Product</h3>
          
          {revenueData?.productRevenue && revenueData.productRevenue.length > 0 ? (
            <div className="space-y-4">
              {revenueData.productRevenue.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  data-testid="product-revenue-item"
                >
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{product.productTitle}</h4>
                    <p className="text-sm text-gray-400">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Avg: ${product.avgPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No revenue data available for this period
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Revenue over time
          </div>
        </div>
      </div>
    </div>
  );
}
