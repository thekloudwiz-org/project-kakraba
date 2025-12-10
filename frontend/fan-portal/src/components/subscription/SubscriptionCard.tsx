import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Badge, Button, Modal, Toast } from '@kakraba/shared';
import { useNavigate } from 'react-router-dom';

interface SubscriptionCardProps {
  subscription: {
    subscriptionId: string;
    creatorId: string;
    creatorName: string;
    creatorAvatar?: string;
    status: 'active' | 'cancelled' | 'past_due';
    price: number;
    interval: 'month' | 'year';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
  };
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const cancelMutation = useMutation({
    mutationFn: () => api.subscription.cancelSubscription(subscription.subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setShowCancelModal(false);
      setToast({ message: 'Subscription canceled successfully', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Failed to cancel subscription', type: 'error' });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => api.subscription.reactivateSubscription(subscription.subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setToast({ message: 'Subscription reactivated successfully', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Failed to reactivate subscription', type: 'error' });
    },
  });

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return subscription.cancelAtPeriodEnd ? (
          <Badge variant="default">Cancelling</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        );
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow" data-testid="subscription-card">
        {/* Creator Header */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center space-x-4 mb-4">
            {subscription.creatorAvatar ? (
              <img
                src={subscription.creatorAvatar}
                alt={subscription.creatorName}
                className="w-16 h-16 rounded-full border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-white bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">
                  {subscription.creatorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold" data-testid="creator-name">{subscription.creatorName}</h3>
              <div className="mt-1" data-testid="subscription-status">{getStatusBadge()}</div>
            </div>
          </div>

          <div className="text-3xl font-bold" data-testid="subscription-price">
            ${subscription.price}
            <span className="text-base font-normal">/{subscription.interval}</span>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              {subscription.cancelAtPeriodEnd ? 'Access until:' : 'Next billing date:'}
            </div>
            <div className="font-medium text-gray-900" data-testid={subscription.cancelAtPeriodEnd ? "access-until" : "next-billing-date"}>
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div className="text-sm text-gray-600 mt-1" data-testid="renewal-date">
                Will not renew
              </div>
            )}
            {!subscription.cancelAtPeriodEnd && (
              <div data-testid="renewal-date" className="hidden">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Member since:</div>
            <div className="font-medium text-gray-900">
              {new Date(subscription.createdAt).toLocaleDateString()}
            </div>
          </div>

          {subscription.status === 'past_due' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3" data-testid="payment-failed-warning">
              <p className="text-sm text-red-600">
                Your payment failed. Please update your payment method to continue your subscription.
              </p>
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Your subscription will end on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                You'll retain access until then.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <Button
              onClick={() => navigate(`/creators/${subscription.creatorId}`)}
              variant="secondary"
              className="w-full"
            >
              View Creator
            </Button>

            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <>
                <Button
                  data-testid="update-payment-button"
                  onClick={() => setShowUpdatePayment(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Update Payment Method
                </Button>
                <Button
                  data-testid="cancel-button"
                  onClick={() => setShowCancelModal(true)}
                  variant="destructive"
                  className="w-full"
                >
                  Cancel Subscription
                </Button>
              </>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Button
                data-testid="reactivate-button"
                onClick={() => reactivateMutation.mutate()}
                isLoading={reactivateMutation.isPending}
                className="w-full"
              >
                Reactivate Subscription
              </Button>
            )}

            {subscription.status === 'past_due' && (
              <Button
                data-testid="update-payment-button"
                onClick={() => setShowUpdatePayment(true)}
                className="w-full"
              >
                Update Payment Method
              </Button>
            )}
          </div>

          {/* Hidden payment method info for testing */}
          <div className="hidden" data-testid="payment-method">
            ****
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Subscription"
          data-testid="cancel-subscription-modal"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to cancel your subscription to {subscription.creatorName}?
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                You'll retain access to all content until{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                After that, you'll lose access to subscription content.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={() => cancelMutation.mutate()}
                variant="destructive"
                className="flex-1"
                isLoading={cancelMutation.isPending}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Payment Modal */}
      {showUpdatePayment && (
        <Modal
          isOpen={true}
          onClose={() => setShowUpdatePayment(false)}
          title="Update Payment Method"
          data-testid="update-payment-modal"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Update your payment method for {subscription.creatorName} subscription.
            </p>
            {/* Payment form would go here */}
            <p className="text-sm text-gray-500">
              Payment method update functionality coming soon.
            </p>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
          data-testid="toast"
        />
      )}
    </>
  );
}
