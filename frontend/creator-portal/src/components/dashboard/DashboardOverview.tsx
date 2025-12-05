import { useQuery } from '@tanstack/react-query';
import { api } from '@kakraba/shared';
import MetricsCard from './MetricsCard';
import { Spinner } from '@kakraba/shared';

export default function DashboardOverview() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.analytics.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
        Failed to load dashboard metrics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricsCard
        title="Total Revenue"
        value={`$${metrics?.totalRevenue.toLocaleString() || 0}`}
        icon="💰"
        trend="+12%"
        trendUp={true}
      />
      <MetricsCard
        title="Active Subscribers"
        value={metrics?.activeSubscribers.toLocaleString() || '0'}
        icon="👥"
        trend="+8%"
        trendUp={true}
      />
      <MetricsCard
        title="Content Views"
        value={metrics?.contentViews.toLocaleString() || '0'}
        icon="👁️"
        trend="+15%"
        trendUp={true}
      />
      <MetricsCard
        title="New Fans"
        value={metrics?.newFans.toLocaleString() || '0'}
        icon="⭐"
        trend="+5%"
        trendUp={true}
      />
    </div>
  );
}
