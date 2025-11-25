/**
 * Authentication with Explicit Authorization Code Flow
 * 
 * This module provides functions to authenticate with Microsoft using
 * explicit grant_type=authorization_code OAuth 2.0 flow
 */

import { buildAuthorizationUrl } from './tokenExchangeUtils';

/**
 * Configuration for authorization code flow
 */
export interface AuthorizationCodeFlowConfig {
  clientId: string;
  tenantId: string;
  redirectUri: string;
  scopes?: string[];
  state?: string;
  prompt?: 'select_account' | 'consent' | 'login';
}

/**
 * Initiate Microsoft OAuth login using explicit authorization code flow
 * This function redirects the user to Microsoft login page
 * After login, user will be redirected back with an authorization code
 * The code will be exchanged for tokens using grant_type=authorization_code
 * 
 * @param config - Configuration for authorization code flow
 */
export function initiateAuthorizationCodeLogin(config: AuthorizationCodeFlowConfig): void {
  const {
    clientId,
    tenantId,
    redirectUri,
    scopes = [
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Chat.ReadWrite',
      'https://graph.microsoft.com/ChatMessage.Send',
      'https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser',
      'offline_access',
      'openid',
      'profile'
    ],
    state,
    prompt = 'select_account',
  } = config;

  // Build the authorization URL with response_type=code (authorization code flow)
  const authUrl = buildAuthorizationUrl(
    clientId,
    tenantId,
    redirectUri,
    scopes,
    state,
    prompt
  );

  console.log('Initiating authorization code flow:', {
    grant_type: 'authorization_code', // Will be used during token exchange
    response_type: 'code', // Used in authorization URL
    redirect_uri: redirectUri,
    scopes: scopes.join(' '),
  });

  // Redirect to Microsoft login page
  window.location.href = authUrl;
}

/**
 * Get authorization code flow configuration from environment variables
 */
export function getAuthorizationCodeFlowConfig(): AuthorizationCodeFlowConfig {
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '';
  const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '';
  const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 
    `${typeof window !== 'undefined' ? window.location.origin : ''}/callback-explicit`;

  if (!clientId || !tenantId) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_AZURE_CLIENT_ID or NEXT_PUBLIC_AZURE_TENANT_ID');
  }

  return {
    clientId,
    tenantId,
    redirectUri,
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
}

/**
 * Complete authentication flow using authorization code
 * This should be called from the callback page after receiving the authorization code
 * 
 * @param code - Authorization code received from Microsoft
 * @param redirectUri - Redirect URI used in the authorization request
 * @param scopes - Scopes requested
 */
export async function completeAuthorizationCodeFlow(
  code: string,
  redirectUri: string,
  scopes?: string[]
): Promise<{
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  error?: string;
  grant_type: string;
}> {
  const { exchangeAuthorizationCodeForToken } = await import('./tokenExchangeUtils');
  
  return await exchangeAuthorizationCodeForToken(
    code,
    redirectUri,
    scopes
  );
}

