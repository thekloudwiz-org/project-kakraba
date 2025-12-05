import { useState } from 'react';
import { signIn, signUp, resetPassword, confirmResetPassword, confirmSignUp } from 'aws-amplify/auth';
import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAuth } = useAuthContext();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn({
        username: email,
        password,
      });

      await refreshAuth();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, password: string, displayName: string, userType: 'CREATOR' | 'FAN') => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: displayName,
            'custom:userType': userType,
          },
        },
      });

      return {
        success: true,
        userId: result.userId,
        nextStep: result.nextStep,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRegistration = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to confirm registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, confirmRegistration, isLoading, error };
};

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuthContext();

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      return { success: true };
    } catch (err: any) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({ username: email });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to request password reset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReset = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { requestReset, confirmReset, isLoading, error };
};
