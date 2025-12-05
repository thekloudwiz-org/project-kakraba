import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureAmplify, getAmplifyConfig } from '@kakraba/shared';
import App from './App';
import './index.css';

// Configure AWS Amplify
const amplifyConfig = getAmplifyConfig();
configureAmplify(amplifyConfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
