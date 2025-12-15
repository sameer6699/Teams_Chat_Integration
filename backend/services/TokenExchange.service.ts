/**
 * Token Exchange Service
 * Handles OAuth 2.0 authorization code flow with explicit grant_type=authorization_code
 */

export interface TokenExchangeRequest {
  code: string;
  redirectUri: string;
}

export interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export class TokenExchangeService {
  private clientId: string;
  private clientSecret?: string;
  private tenantId: string;
  private tokenEndpoint: string;

  constructor() {
    this.clientId = process.env.AZURE_CLIENT_ID || process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '';
    this.clientSecret = process.env.AZURE_CLIENT_SECRET || undefined;
    this.tenantId = process.env.AZURE_TENANT_ID || process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '';
    this.tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  }

  /**
   * Exchange authorization code for access token using grant_type=authorization_code
   * This is the explicit OAuth 2.0 authorization code flow
   */
  async exchangeAuthorizationCode(
    code: string,
    redirectUri: string,
    scopes: string[] = [
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
    ]
  ): Promise<TokenExchangeResponse> {
    try {
      // Prepare the token request body with grant_type=authorization_code
      const tokenRequestBody = new URLSearchParams({
        grant_type: 'authorization_code', // Explicitly set grant_type to authorization_code
        client_id: this.clientId,
        code: code,
        redirect_uri: redirectUri,
        scope: scopes.join(' '),
      });

      // If client secret is available (for confidential client), add it
      // Note: For public clients (SPA), client_secret should NOT be used
      if (this.clientSecret) {
        tokenRequestBody.append('client_secret', this.clientSecret);
      }

      // Make the token exchange request
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenRequestBody.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: TokenExchangeResponse = await response.json();

      // Validate the response
      if (!tokenData.access_token) {
        throw new Error('Token exchange response missing access_token');
      }

      console.log('Token exchange successful with grant_type=authorization_code');
      return tokenData;
    } catch (error) {
      console.error('Error exchanging authorization code:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    scopes: string[] = [
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
    ]
  ): Promise<TokenExchangeResponse> {
    try {
      const tokenRequestBody = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        refresh_token: refreshToken,
        scope: scopes.join(' '),
      });

      if (this.clientSecret) {
        tokenRequestBody.append('client_secret', this.clientSecret);
      }

      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenRequestBody.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

