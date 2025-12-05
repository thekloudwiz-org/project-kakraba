import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, Button, Input } from '@kakraba/shared';

const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { confirmRegistration, isLoading } = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const onSubmit = async (data: VerificationFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Email address is missing');
      return;
    }

    const result = await confirmRegistration(email, data.code);

    if (result.success) {
      setSuccessMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setErrorMessage(result.error || 'Failed to verify email');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Verify Your Email
        </h2>

        <p className="text-gray-300 text-center mb-6">
          We've sent a verification code to <strong>{email}</strong>
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              {...register('code')}
              placeholder="123456"
              maxLength={6}
              className="w-full text-center text-2xl tracking-widest"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-400">{errors.code.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400 text-sm">
            Didn't receive the code?{' '}
            <button className="text-purple-400 hover:text-purple-300 font-medium">
              Resend
            </button>
          </p>
          <Link to="/login" className="block text-sm text-purple-400 hover:text-purple-300">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
