import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, Button, Spinner } from '@kakraba/shared';
import PaymentForm from './PaymentForm';
import PurchaseConfirmation from './PurchaseConfirmation';

type Step = 'details' | 'payment' | 'confirmation';

interface PaymentData {
  paymentMethodId: string;
  billingDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface ItemDetails {
  id: string;
  title: string;
  description?: string;
  price?: number;
  thumbnailUrl?: string;
  creatorName?: string;
}

interface PurchaseResult {
  orderId: string;
  purchaseDate: string;
  amount: number;
  contentId?: string;
  productId?: string;
}

interface PurchaseFlowProps {
  contentId?: string;
  productId?: string;
  subscriptionPlan?: string;
  onComplete?: () => void;
}

export default function PurchaseFlow({ 
  contentId, 
  productId, 
  subscriptionPlan,
  onComplete 
}: PurchaseFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);

  const { data: itemDetails, isLoading } = useQuery<ItemDetails>({
    queryKey: ['purchase-item', contentId, productId, subscriptionPlan],
    queryFn: async () => {
      if (contentId) {
        const result = await api.content.getContent(contentId);
        return result as ItemDetails;
      } else if (productId) {
        const result = await api.product.getProduct(productId);
        return result as ItemDetails;
      } else if (subscriptionPlan) {
        const result = await api.subscription.getPlanDetails(subscriptionPlan);
        return result as ItemDetails;
      }
      throw new Error('No item specified for purchase');
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (paymentData: PaymentData) => {
      if (contentId) {
        return api.purchase.purchaseContent(contentId, paymentData);
      } else if (productId) {
        return api.purchase.purchaseProduct(productId, paymentData);
      } else if (subscriptionPlan) {
        return api.subscription.subscribe(subscriptionPlan, paymentData);
      }
      throw new Error('No item specified for purchase');
    },
    onSuccess: (result) => {
      setPurchaseResult(result);
      setCurrentStep('confirmation');
    },
  });

  const handlePayment = (paymentData: PaymentData) => {
    purchaseMutation.mutate(paymentData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!itemDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Item not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['details', 'payment', 'confirmation'].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ['details', 'payment', 'confirmation'].indexOf(currentStep) >= index
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    ['details', 'payment', 'confirmation'].indexOf(currentStep) >= index
                      ? 'text-purple-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`h-1 flex-1 ${
                    ['details', 'payment', 'confirmation'].indexOf(currentStep) > index
                      ? 'bg-purple-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {currentStep === 'details' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Purchase Details</h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                {itemDetails.thumbnailUrl && (
                  <img
                    src={itemDetails.thumbnailUrl}
                    alt={itemDetails.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {itemDetails.title}
                  </h3>
                  {itemDetails.creatorName && (
                    <p className="text-gray-600">by {itemDetails.creatorName}</p>
                  )}
                  {itemDetails.description && (
                    <p className="text-gray-600 text-sm">{itemDetails.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${itemDetails.price || itemDetails.amount}
                    {subscriptionPlan && <span className="text-base text-gray-600">/month</span>}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={() => setCurrentStep('payment')} className="w-full">
              Continue to Payment
            </Button>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
            
            <PaymentForm
              amount={itemDetails.price || itemDetails.amount}
              onSubmit={handlePayment}
              isLoading={purchaseMutation.isPending}
              error={purchaseMutation.error?.message}
            />

            <button
              onClick={() => setCurrentStep('details')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Details
            </button>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <PurchaseConfirmation
            purchaseData={purchaseResult}
            itemDetails={itemDetails}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
}
