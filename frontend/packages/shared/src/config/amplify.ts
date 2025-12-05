import { Amplify } from 'aws-amplify';

export interface AmplifyConfig {
  userPoolId: string;
  userPoolClientId: string;
  region: string;
}

export function configureAmplify(config: AmplifyConfig) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
        loginWith: {
          email: true,
        },
        signUpVerificationMethod: 'code',
        userAttributes: {
          email: {
            required: true,
          },
        },
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialCharacters: true,
        },
      },
    },
  });
}

// Environment-based configuration
export function getAmplifyConfig(): AmplifyConfig {
  const userPoolId = (import.meta as any).env?.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = (import.meta as any).env?.VITE_COGNITO_USER_POOL_CLIENT_ID;
  const region = (import.meta as any).env?.VITE_AWS_REGION || 'eu-central-1';

  if (!userPoolId || !userPoolClientId) {
    console.warn('Cognito configuration missing. Authentication will not work.');
  }

  return {
    userPoolId: userPoolId || '',
    userPoolClientId: userPoolClientId || '',
    region,
  };
}
