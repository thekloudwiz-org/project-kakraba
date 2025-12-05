import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import * as amplifyAuth from 'aws-amplify/auth';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

// Mock AWS Amplify auth functions
vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

// Mock shared hooks
vi.mock('@kakraba/shared', async () => {
  const actual = await vi.importActual('@kakraba/shared');
  return {
    ...actual,
    useLogin: () => ({
      login: async (email: string, password: string) => {
        try {
          await amplifyAuth.signIn({ username: email, password });
          return { success: true };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return { success: false, error: message };
        }
      },
      isLoading: false,
      error: null,
    }),
    useRegister: () => ({
      register: async (email: string, password: string, displayName: string, userType: string) => {
        try {
          const result = await amplifyAuth.signUp({
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
          return { success: true, userId: result.userId };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          return { success: false, error: message };
        }
      },
      isLoading: false,
      error: null,
    }),
  };
});

/**
 * Feature: creator-fan-portals, Property 1: Valid registration creates Cognito account
 * Validates: Requirements 1.2
 * 
 * For any valid registration data, submitting the registration form should 
 * result in a Cognito user account being created
 */
describe('Property 1: Valid registration creates Cognito account', () => {
  it('should call signUp when form is submitted with valid data', async () => {
    const user = userEvent.setup();

    vi.mocked(amplifyAuth.signUp).mockResolvedValue({
      isSignUpComplete: false,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP' as const },
      userId: 'test-user-id',
    });

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'creator@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test Creator');
    await user.type(screen.getByLabelText(/^password/i), 'Test1234!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Verify signUp was called
    await waitFor(() => {
      expect(amplifyAuth.signUp).toHaveBeenCalledWith({
        username: 'creator@example.com',
        password: 'Test1234!',
        options: {
          userAttributes: {
            email: 'creator@example.com',
            name: 'Test Creator',
            'custom:userType': 'CREATOR',
          },
        },
      });
    });
  });

  it('should display error message when registration fails', async () => {
    const user = userEvent.setup();

    vi.mocked(amplifyAuth.signUp).mockRejectedValue(
      new Error('User already exists')
    );

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test Creator');
    await user.type(screen.getByLabelText(/^password/i), 'Test1234!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
    });
  });
});

/**
 * Feature: creator-fan-portals, Property 2: Valid credentials establish session
 * Validates: Requirements 1.4
 * 
 * For any valid user credentials, successful authentication should establish a session
 */
describe('Property 2: Valid credentials establish session', () => {
  it('should call signIn when form is submitted with valid credentials', async () => {
    const user = userEvent.setup();

    vi.mocked(amplifyAuth.signIn).mockResolvedValue({
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' as const },
    });

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'creator@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test1234!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify signIn was called
    await waitFor(() => {
      expect(amplifyAuth.signIn).toHaveBeenCalledWith({
        username: 'creator@example.com',
        password: 'Test1234!',
      });
    });
  });

  it('should display error message when login fails', async () => {
    const user = userEvent.setup();

    vi.mocked(amplifyAuth.signIn).mockRejectedValue(
      new Error('Incorrect username or password')
    );

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'WrongPass123!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/incorrect username or password/i)).toBeInTheDocument();
    });
  });
});

/**
 * Additional tests for form validation
 */
describe('Form validation', () => {
  it('should validate password requirements in registration form', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    // Enter weak password
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/display name/i), 'Test User');
    await user.type(screen.getByLabelText(/^password/i), 'weak');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
