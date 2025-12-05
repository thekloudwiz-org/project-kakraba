import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Spinner, Badge, type Transaction, type PaginatedResponse } from '@kakraba/shared';

type FilterType = 'all' | 'content' | 'product' | 'subscription';

export default function PurchaseHistoryPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);

  const { data: purchases, isLoading } = useQuery<PaginatedResponse<Transaction> & { totalPages: number }>({
    queryKey: ['purchase-history', filter, page],
    queryFn: async () => {
      return await api.purchase.getPurchaseHistory({
        type: filter === 'all' ? undefined : filter,
        page,
        limit: 20,
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'content':
        return <Badge variant="default">Content</Badge>;
      case 'product':
        return <Badge variant="default">Product</Badge>;
      case 'subscription':
        return <Badge variant="success">Subscription</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
          <p className="text-gray-600">View all your past purchases and transactions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <div className="flex space-x-2">
              {(['all', 'content', 'product', 'subscription'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === type
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : purchases && purchases.items.length > 0 ? (
          <div className="space-y-4">
            {purchases.items.map((purchase) => (
              <div
                key={purchase.transactionId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Purchase Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    {purchase.thumbnailUrl && (
                      <img
                        src={purchase.thumbnailUrl}
                        alt={purchase.itemTitle}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {purchase.itemTitle}
                        </h3>
                        {getTypeBadge(purchase.type)}
                        {getStatusBadge(purchase.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        by {purchase.creatorName}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Order ID: <span className="font-mono">{purchase.transactionId}</span>
                        </span>
                        <span>•</span>
                        <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ${purchase.amount.toFixed(2)}
                    </div>
                    {purchase.type === 'subscription' && (
                      <div className="text-sm text-gray-600">
                        /{purchase.interval}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {purchase.status === 'completed' && purchase.type !== 'subscription' && (
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        View Content
                      </button>
                    )}
                    {purchase.type === 'subscription' && purchase.status === 'completed' && (
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Manage Subscription
                      </button>
                    )}
                  </div>
                  
                  <button className="text-sm text-gray-600 hover:text-gray-800">
                    Download Receipt
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {purchases.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {purchases.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(purchases.totalPages, p + 1))}
                  disabled={page === purchases.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring and purchase content from your favorite creators
            </p>
            <button
              onClick={() => window.location.href = '/discover'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
