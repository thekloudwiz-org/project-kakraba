import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, Button, Input } from '@kakraba/shared';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    const result = await registerUser(
      data.email,
      data.password,
      data.displayName,
      'CREATOR'
    );

    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else {
      setErrorMessage(result.error || 'Failed to register');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create Creator Account
        </h2>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="creator@example.com"
              className="w-full"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              {...register('displayName')}
              placeholder="Your Creator Name"
              className="w-full"
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-400">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              placeholder="Tell your fans about yourself..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-400">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Must contain uppercase, lowercase, number, and special character
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
