import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, Button, Input } from '@kakraba/shared';
import { useState } from 'react';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function PasswordResetForm() {
  const { resetPassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetPassword(data.email);
      setIsSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      setError('root', {
        message,
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-green-400">
        Password reset email sent! Check your inbox for instructions.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('email')}
          type="email"
          placeholder="Email"
          error={errors.email?.message}
        />
      </div>

      {errors.root && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
          {errors.root.message}
        </div>
      )}

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send Reset Link
      </Button>
    </form>
  );
}
