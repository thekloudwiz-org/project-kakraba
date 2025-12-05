import { useAuth } from '@kakraba/shared';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import ContentPerformanceTable from '../components/dashboard/ContentPerformanceTable';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your content today.
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="mb-8">
          <DashboardOverview />
        </div>

        {/* Revenue Chart and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart />
          <RecentActivity />
        </div>

        {/* Content Performance Table */}
        <div>
          <ContentPerformanceTable />
        </div>
      </div>
    </div>
  );
}
