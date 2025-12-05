import { useQuery } from '@tanstack/react-query';
import { api, useAuth, Spinner, Badge } from '@kakraba/shared';

export default function RecentActivity() {
  const { user } = useAuth();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['recent-purchases', user?.userId],
    queryFn: () => api.user.getPurchases(user?.userId || '', 1, 10),
    enabled: !!user?.userId,
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {purchases?.items.map((transaction) => (
          <div
            key={transaction.transactionId}
            className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex-1">
              <p className="text-white font-medium">
                {transaction.transactionType === 'PURCHASE' ? 'Purchase' : 'Subscription'}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  transaction.status === 'COMPLETED'
                    ? 'success'
                    : transaction.status === 'FAILED'
                    ? 'error'
                    : 'default'
                }
              >
                {transaction.status}
              </Badge>
              <span className="text-green-400 font-semibold">
                ${transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(!purchases?.items || purchases.items.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          No recent activity
        </div>
      )}
    </div>
  );
}
