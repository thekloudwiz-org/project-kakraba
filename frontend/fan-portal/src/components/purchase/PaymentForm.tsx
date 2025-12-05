import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@kakraba/shared';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const paymentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Invalid ZIP code'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentData: any) => void;
  isLoading?: boolean;
  error?: string;
}

export default function PaymentForm({ amount, onSubmit, isLoading, error }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setCardError(null);

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
      return;
    }

    onSubmit({
      paymentMethodId: paymentMethod.id,
      billingDetails: data,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {(error || cardError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error || cardError}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Total Amount:</span>
          <span className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name
        </label>
        <Input
          {...register('name')}
          placeholder="John Doe"
          error={errors.name?.message}
        />
      </div>

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
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Billing Address
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

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={!stripe || isLoading}
      >
        Complete Purchase
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}
