import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, Button, Input } from '@kakraba/shared';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        username: data.username,
        firstName: '',
        lastName: '',
        userType: 'FAN',
      });
      navigate('/dashboard');
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Registration failed',
      });
    }
  };

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

      <div>
        <Input
          {...register('username')}
          placeholder="Username"
          error={errors.username?.message}
        />
      </div>

      <div>
        <Input
          {...register('password')}
          type="password"
          placeholder="Password"
          error={errors.password?.message}
        />
      </div>

      <div>
        <Input
          {...register('confirmPassword')}
          type="password"
          placeholder="Confirm Password"
          error={errors.confirmPassword?.message}
        />
      </div>

      {errors.root && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
          {errors.root.message}
        </div>
      )}

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
