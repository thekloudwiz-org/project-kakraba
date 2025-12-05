import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import type { User } from '../types/api';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: 'CREATOR' | 'FAN';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      const idToken = session.tokens?.idToken?.toString();
      const attributes = session.tokens?.idToken?.payload;
      
      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId || '',
        username: (attributes?.['custom:username'] as string) || currentUser.username,
        firstName: (attributes?.['custom:firstName'] as string) || '',
        lastName: (attributes?.['custom:lastName'] as string) || '',
        displayName: (attributes?.['custom:displayName'] as string) || currentUser.username,
        userType: (attributes?.['custom:userType'] as 'CREATOR' | 'FAN') || 'FAN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setToken(idToken || null);
    } catch (error) {
      console.log('No authenticated user:', error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const signOut = async () => {
    try {
      await amplifySignOut();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await loadUser();
  };

  const signIn = async (email: string, password: string) => {
    const { signIn: amplifySignIn } = await import('aws-amplify/auth');
    await amplifySignIn({ username: email, password });
    await loadUser();
  };

  const signUp = async (data: SignUpData) => {
    const { signUp: amplifySignUp } = await import('aws-amplify/auth');
    await amplifySignUp({
      username: data.email,
      password: data.password,
      options: {
        userAttributes: {
          email: data.email,
          'custom:username': data.username,
          'custom:firstName': data.firstName,
          'custom:lastName': data.lastName,
          'custom:userType': data.userType,
        },
      },
    });
  };

  const resetPassword = async (email: string) => {
    const { resetPassword: amplifyResetPassword } = await import('aws-amplify/auth');
    await amplifyResetPassword({ username: email });
  };

  const confirmPassword = async (email: string, code: string, newPassword: string) => {
    const { confirmResetPassword } = await import('aws-amplify/auth');
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    token,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    resetPassword,
    confirmPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
