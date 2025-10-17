import { Configuration, PopupRequest } from '@azure/msal-browser';

// Temporary hardcoded values for testing - replace with env vars once working
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '9538fc54-821c-42da-b17f-51877d56db5a';
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '6ae3d026-e965-483e-8309-8f8f3aca71c8';
const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000';

console.log('MSAL Config Debug:', { clientId, tenantId, redirectUri });

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'Chat.Read', 'Chat.ReadWrite', 'TeamsAppInstallation.ReadWriteForUser'],
  prompt: 'select_account',
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphChatsEndpoint: 'https://graph.microsoft.com/v1.0/me/chats',
  graphTeamsEndpoint: 'https://graph.microsoft.com/v1.0/me/joinedTeams',
};
