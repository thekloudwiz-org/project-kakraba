import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Input } from '@kakraba/shared';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Invalid ZIP code'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  amount: number;
  itemDetails: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
  };
  onSubmit: (paymentData: any) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function CheckoutForm({
  amount,
  itemDetails,
  onSubmit,
  isLoading,
  error,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const handleFormSubmit = async (data: CheckoutFormData) => {
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
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: data.name,
          email: data.email,
          address: {
            line1: data.address,
            city: data.city,
            state: data.state,
            postal_code: data.zipCode,
          },
        },
      });

      if (stripeError) {
        setCardError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      // Submit payment
      await onSubmit({
        paymentMethodId: paymentMethod.id,
        billingDetails: data,
      });
    } catch (err) {
      setCardError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="flex items-start space-x-4 mb-4">
          {itemDetails.thumbnailUrl && (
            <img
              src={itemDetails.thumbnailUrl}
              alt={itemDetails.title}
              className="w-20 h-20 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{itemDetails.title}</h4>
            {itemDetails.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{itemDetails.description}</p>
            )}
          </div>
        </div>
        <div className="border-t pt-4 flex items-center justify-between">
          <span className="text-gray-700">Total:</span>
          <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</span>
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
        <div className="space-y-4">
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
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Billing Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <Input
              {...register('address')}
              placeholder="123 Main St"
              error={errors.address?.message}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                {...register('city')}
                placeholder="New York"
                error={errors.city?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <Input
                {...register('state')}
                placeholder="NY"
                error={errors.state?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <Input
                {...register('zipCode')}
                placeholder="10001"
                error={errors.zipCode?.message}
              />
            </div>
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
        Complete Purchase ${amount.toFixed(2)}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted. By completing this purchase,
        you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
