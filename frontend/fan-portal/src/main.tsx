import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureAmplify, getAmplifyConfig, createApiClient } from '@kakraba/shared';
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
