import { Configuration, PopupRequest } from '@azure/msal-browser';

// Temporary hardcoded values for testing - replace with env vars once working
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '816158a9-dd67-4a38-83b4-6033fa01c2b5';
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '3843cf08-a3d1-425c-8d3c-6872729e0a4b';
const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000/callback';

console.log('MSAL Config Debug:', { clientId, tenantId, redirectUri });

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
    navigateToLoginRequestUrl: false, // Prevents redirect to login request URL
  },
  cache: {
    cacheLocation: 'localStorage', // Use localStorage for better persistence
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            break;
          case 1: // LogLevel.Warning
            console.warn(message);
            break;
          case 2: // LogLevel.Info
            console.info(message);
            break;
          case 3: // LogLevel.Verbose
            console.debug(message);
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: 1, // Only show warnings and errors
    },
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: [
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Chat.ReadWrite',
    'https://graph.microsoft.com/ChatMessage.Send',
    'https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser',
    'offline_access',
    'openid',
    'profile'
  ],
  prompt: 'select_account',
};

// Login request with forced consent (use after admin consent is granted)
export const loginRequestWithConsent: PopupRequest = {
  scopes: [
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Chat.ReadWrite',
    'https://graph.microsoft.com/ChatMessage.Send',
    'https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser',
    'offline_access',
    'openid',
    'profile'
  ],
  prompt: 'consent', // Force consent prompt to ensure fresh consent after admin approval
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphChatsEndpoint: 'https://graph.microsoft.com/v1.0/me/chats',
  graphTeamsEndpoint: 'https://graph.microsoft.com/v1.0/me/joinedTeams',
};
