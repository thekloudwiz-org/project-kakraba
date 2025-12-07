import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, configureAmplify, getAmplifyConfig, createApiClient, getCurrentUser } from '@kakraba/shared';
import { fetchAuthSession } from 'aws-amplify/auth';
import App from './App';
import './index.css';

// Configure AWS Amplify
const amplifyConfig = getAmplifyConfig();
configureAmplify(amplifyConfig);

// Initialize API client
const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_ENDPOINT || 'https://1olgwybpe4.execute-api.eu-central-1.amazonaws.com',
});

// Store current token
let currentToken: string | null = null;

// Update token on auth state changes
fetchAuthSession().then(session => {
  currentToken = session.tokens?.idToken?.toString() || null;
}).catch(() => {
  currentToken = null;
});

// Set token getter for API client
apiClient.setTokenGetter(() => currentToken);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Use basename only in production, not in local dev
const basename = import.meta.env.PROD ? '/creator' : '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
