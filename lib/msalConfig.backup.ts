import { Configuration, PopupRequest } from '@azure/msal-browser';

// Temporary hardcoded values for testing
const clientId = '816158a9-dd67-4a38-83b4-6033fa01c2b5';
const tenantId = '3843cf08-a3d1-425c-8d3c-6872729e0a4b';
const redirectUri = 'https://localhost:3000/callback';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
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

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphChatsEndpoint: 'https://graph.microsoft.com/v1.0/me/chats',
  graphTeamsEndpoint: 'https://graph.microsoft.com/v1.0/me/joinedTeams',
};
