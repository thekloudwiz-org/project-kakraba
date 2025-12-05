import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePasswordReset, Button, Input } from '@kakraba/shared';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const confirmResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

type RequestResetFormData = z.infer<typeof requestResetSchema>;
type ConfirmResetFormData = z.infer<typeof confirmResetSchema>;

export default function PasswordResetForm() {
  const navigate = useNavigate();
  const { requestReset, confirmReset, isLoading } = usePasswordReset();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
  });

  const {
    register: registerConfirm,
    handleSubmit: handleSubmitConfirm,
    formState: { errors: confirmErrors },
  } = useForm<ConfirmResetFormData>({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: { email },
  });

  const onRequestSubmit = async (data: RequestResetFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const result = await requestReset(data.email);

    if (result.success) {
      setEmail(data.email);
      setStep('confirm');
      setSuccessMessage('Verification code sent to your email');
    } else {
      setErrorMessage(result.error || 'Failed to request password reset');
    }
  };

  const onConfirmSubmit = async (data: ConfirmResetFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const result = await confirmReset(data.email, data.code, data.newPassword);

    if (result.success) {
      setSuccessMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setErrorMessage(result.error || 'Failed to reset password');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Reset Password
        </h2>

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

        {step === 'request' ? (
          <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...registerRequest('email')}
                placeholder="creator@example.com"
                className="w-full"
              />
              {requestErrors.email && (
                <p className="mt-1 text-sm text-red-400">{requestErrors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending code...' : 'Send Verification Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmitConfirm(onConfirmSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...registerConfirm('email')}
                defaultValue={email}
                className="w-full"
                readOnly
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                {...registerConfirm('code')}
                placeholder="123456"
                maxLength={6}
                className="w-full"
              />
              {confirmErrors.code && (
                <p className="mt-1 text-sm text-red-400">{confirmErrors.code.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                {...registerConfirm('newPassword')}
                placeholder="••••••••"
                className="w-full"
              />
              {confirmErrors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{confirmErrors.newPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Resetting password...' : 'Reset Password'}
            </Button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-sm text-gray-400 hover:text-gray-300"
            >
              Back to email entry
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-purple-400 hover:text-purple-300">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
