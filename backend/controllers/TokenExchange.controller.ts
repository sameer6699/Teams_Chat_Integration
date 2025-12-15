/**
 * Token Exchange Controller
 * Handles token exchange requests using grant_type=authorization_code
 */

import { NextRequest, NextResponse } from 'next/server';
import { TokenExchangeService } from '../services/TokenExchange.service';

export class TokenExchangeController {
  private tokenExchangeService: TokenExchangeService;

  constructor() {
    this.tokenExchangeService = new TokenExchangeService();
  }

  /**
   * Exchange authorization code for access token
   * Uses grant_type=authorization_code explicitly
   */
  async exchangeToken(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { code, redirectUri, scopes } = body;

      // Validate required parameters
      if (!code) {
        return NextResponse.json(
          { 
            error: 'Missing required parameter: code',
            grant_type: 'authorization_code' // Always indicate the grant type
          },
          { status: 400 }
        );
      }

      if (!redirectUri) {
        return NextResponse.json(
          { 
            error: 'Missing required parameter: redirectUri',
            grant_type: 'authorization_code'
          },
          { status: 400 }
        );
      }

      // Default scopes - All granted permissions
      const defaultScopes = [
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
      ];

      // Exchange authorization code for tokens using grant_type=authorization_code
      const tokenResponse = await this.tokenExchangeService.exchangeAuthorizationCode(
        code,
        redirectUri,
        scopes || defaultScopes
      );

      // Return the token response with explicit grant_type indication
      return NextResponse.json({
        success: true,
        grant_type: 'authorization_code', // Explicitly indicate the grant type used
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        refresh_token: tokenResponse.refresh_token,
        id_token: tokenResponse.id_token,
        scope: tokenResponse.scope,
      });
    } catch (error) {
      console.error('Token exchange error:', error);
      return NextResponse.json(
        {
          error: 'Token exchange failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          grant_type: 'authorization_code', // Still indicate the grant type attempted
        },
        { status: 500 }
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const { refresh_token, scopes } = body;

      if (!refresh_token) {
        return NextResponse.json(
          { error: 'Missing required parameter: refresh_token' },
          { status: 400 }
        );
      }

      const defaultScopes = [
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
      ];

      const tokenResponse = await this.tokenExchangeService.refreshAccessToken(
        refresh_token,
        scopes || defaultScopes
      );

      return NextResponse.json({
        success: true,
        grant_type: 'refresh_token',
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_in: tokenResponse.expires_in,
        refresh_token: tokenResponse.refresh_token,
        id_token: tokenResponse.id_token,
        scope: tokenResponse.scope,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return NextResponse.json(
        {
          error: 'Token refresh failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

