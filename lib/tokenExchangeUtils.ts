/**
 * Token Exchange Utilities
 * Helper functions for handling OAuth 2.0 authorization code flow
 * with explicit grant_type=authorization_code
 */

/**
 * Extract authorization code from URL query parameters
 */
export function extractAuthorizationCode(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('code');
  } catch (error) {
    console.error('Error extracting authorization code:', error);
    return null;
  }
}

/**
 * Extract error from URL query parameters
 */
export function extractErrorFromUrl(url: string): { error: string; errorDescription?: string } | null {
  try {
    const urlObj = new URL(url);
    const error = urlObj.searchParams.get('error');
    const errorDescription = urlObj.searchParams.get('error_description');
    
    if (error) {
      return {
        error,
        errorDescription: errorDescription || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('Error extracting error from URL:', error);
    return null;
  }
}

/**
 * Exchange authorization code for access token using grant_type=authorization_code
 * This function explicitly uses the OAuth 2.0 authorization code flow
 */
export async function exchangeAuthorizationCodeForToken(
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
  try {
    const response = await fetch('/api/auth/token-exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirectUri,
        scopes: scopes || [
          // Standard OAuth permissions
          'openid',
          'email',
          'offline_access',
          'profile',
          
          // User permissions
          'https://graph.microsoft.com/User.Read',
          'https://graph.microsoft.com/User.ReadBasic.All',
          'https://graph.microsoft.com/User.Read.All',
          
          // Chat permissions
          'https://graph.microsoft.com/Chat.Read',
          'https://graph.microsoft.com/Chat.ReadBasic',
          'https://graph.microsoft.com/Chat.ReadWrite',
          'https://graph.microsoft.com/Chat.ReadWrite.All',
          'https://graph.microsoft.com/Chat.Create',
          
          // Chat message permissions
          'https://graph.microsoft.com/ChatMessage.Read',
          'https://graph.microsoft.com/ChatMessage.Send',
          
          // Channel permissions
          'https://graph.microsoft.com/Channel.ReadBasic.All',
          'https://graph.microsoft.com/ChannelMessage.Read.All',
          'https://graph.microsoft.com/ChannelMessage.Send',
          
          // Team permissions
          'https://graph.microsoft.com/Team.ReadBasic.All',
          
          // Presence permissions
          'https://graph.microsoft.com/Presence.Read',
          'https://graph.microsoft.com/Presence.Read.All',
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Token exchange failed',
        grant_type: 'authorization_code',
      };
    }

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      id_token: data.id_token,
      expires_in: data.expires_in,
      grant_type: data.grant_type || 'authorization_code',
    };
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      grant_type: 'authorization_code',
    };
  }
}

/**
 * Build Microsoft OAuth authorization URL with authorization code flow
 * This explicitly uses the authorization code flow (grant_type=authorization_code)
 */
export function buildAuthorizationUrl(
  clientId: string,
  tenantId: string,
  redirectUri: string,
  scopes: string[] = [
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Chat.ReadWrite',
    'https://graph.microsoft.com/ChatMessage.Send',
    'https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser',
    'offline_access',
    'openid',
    'profile'
  ],
  state?: string,
  prompt: 'select_account' | 'consent' | 'login' = 'select_account'
): string {
  const authority = `https://login.microsoftonline.com/${tenantId}`;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code', // Authorization code flow
    redirect_uri: redirectUri,
    response_mode: 'query', // Return code in query string
    scope: scopes.join(' '),
    prompt: prompt,
  });

  if (state) {
    params.append('state', state);
  }

  // Note: grant_type=authorization_code is used during token exchange, not in the authorization URL
  // The authorization URL uses response_type=code to request an authorization code
  return `${authority}/oauth2/v2.0/authorize?${params.toString()}`;
}

