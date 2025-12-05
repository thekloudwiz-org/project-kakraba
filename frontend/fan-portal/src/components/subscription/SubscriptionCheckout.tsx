import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Input } from '@kakraba/shared';

const subscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionCheckoutProps {
  creatorInfo: {
    userId: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
  planDetails: {
    price: number;
    interval: 'month' | 'year';
    benefits: string[];
  };
  onSubmit: (paymentData: { paymentMethodId: string; email: string; name: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function SubscriptionCheckout({
  creatorInfo,
  planDetails,
  onSubmit,
  isLoading,
  error,
}: SubscriptionCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
  });

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    if (!stripe || !elements) {
      setCardError('Payment system not ready. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card information is required.');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: data.name,
          email: data.email,
        },
      });

      if (stripeError) {
        setCardError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      await onSubmit({
        paymentMethodId: paymentMethod.id,
        email: data.email,
        name: data.name,
      });
    } catch (err) {
      setCardError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Creator Info */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          {creatorInfo.avatarUrl ? (
            <img
              src={creatorInfo.avatarUrl}
              alt={creatorInfo.displayName}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {creatorInfo.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{creatorInfo.displayName}</h3>
            <p className="text-gray-600">@{creatorInfo.username}</p>
          </div>
        </div>

        <div className="border-t border-purple-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Subscription Price:</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${planDetails.price}
                <span className="text-base text-gray-600">/{planDetails.interval}</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
            <ul className="space-y-2">
              {planDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(error || cardError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error || cardError}</p>
        </div>
      )}

      {/* Contact Information */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send subscription confirmations and receipts to this email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              {...register('name')}
              placeholder="John Doe"
              error={errors.name?.message}
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your card will be charged ${planDetails.price} every {planDetails.interval}
          </p>
        </div>
      </div>

      {/* Subscription Terms */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Subscription Terms:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You can cancel anytime from your subscription settings</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>You'll retain access to content until the subscription expires</li>
              <li>No refunds for partial months</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading || processing}
        disabled={!stripe || isLoading || processing}
      >
        Subscribe for ${planDetails.price}/{planDetails.interval}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted. By subscribing,
        you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
