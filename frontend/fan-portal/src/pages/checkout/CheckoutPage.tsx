import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { api, Spinner } from '@kakraba/shared';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import PurchaseConfirmation from '../../components/purchase/PurchaseConfirmation';

const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);

  // Fetch item details
  const { data: itemDetails, isLoading } = useQuery({
    queryKey: ['checkout-item', type, id],
    queryFn: async () => {
      if (type === 'product') {
        const result = await api.product.getProduct(id!);
        return result as any;
      } else if (type === 'content') {
        const result = await api.content.getContent(id!);
        return result as any;
      } else if (type === 'subscription') {
        const result = await api.subscription.getPlanDetails(id!);
        return result as any;
      }
      throw new Error('Invalid checkout type');
    },
    enabled: !!type && !!id,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      if (type === 'product') {
        return api.purchase.purchaseProduct(id!, paymentData);
      } else if (type === 'content') {
        return api.purchase.purchaseContent(id!, paymentData);
      } else if (type === 'subscription') {
        return api.subscription.subscribe(id!, paymentData);
      }
      throw new Error('Invalid checkout type');
    },
    onSuccess: (result) => {
      setPurchaseData(result);
      setPurchaseComplete(true);
    },
  });

  const handlePaymentSubmit = async (paymentData: any) => {
    await purchaseMutation.mutateAsync(paymentData);
  };

  const handleComplete = () => {
    if (type === 'subscription') {
      navigate('/subscriptions');
    } else {
      navigate('/library');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!itemDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600">The item you're trying to purchase doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (purchaseComplete && purchaseData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <PurchaseConfirmation
              purchaseData={purchaseData}
              itemDetails={itemDetails}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase securely</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                amount={itemDetails.price || itemDetails.amount || 0}
                itemDetails={{
                  title: itemDetails.title || itemDetails.name,
                  description: itemDetails.description,
                  thumbnailUrl: itemDetails.thumbnailUrl,
                }}
                onSubmit={handlePaymentSubmit}
                isLoading={purchaseMutation.isPending}
                error={purchaseMutation.error?.message}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}
