import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Spinner, type Subscription } from '@kakraba/shared';
import SubscriptionCard from '../../components/subscription/SubscriptionCard';

export default function SubscriptionManagerPage() {
  const [showCancelled, setShowCancelled] = useState(false);

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ['subscriptions', showCancelled],
    queryFn: async () => {
      return await api.subscription.getSubscriptions({
        status: showCancelled ? 'all' : 'active',
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
          <p className="text-gray-600">Manage your creator subscriptions</p>
        </div>

        {/* Filter Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCancelled(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showCancelled
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setShowCancelled(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showCancelled
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Subscriptions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : subscriptions && subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.subscriptionId} subscription={subscription} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showCancelled ? 'No subscriptions' : 'No active subscriptions'}
            </h3>
            <p className="text-gray-600 mb-6">
              Subscribe to creators to get unlimited access to their content
            </p>
            <button
              onClick={() => window.location.href = '/discover'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Discover Creators
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
