/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/Auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handle login request
   */
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      await this.authService.login();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Login failed', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  /**
   * Handle logout request
   */
  async logout(request: NextRequest): Promise<NextResponse> {
    try {
      await this.authService.logout();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        { error: 'Logout failed', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(request: NextRequest): Promise<NextResponse> {
    try {
      const isAuthenticated = this.authService.isAuthenticated();
      const account = this.authService.getCurrentAccount();

      return NextResponse.json({
        isAuthenticated,
        account: account ? {
          id: account.homeAccountId,
          username: account.username,
          name: account.name,
        } : null,
      });
    } catch (error) {
      console.error('Get auth status error:', error);
      return NextResponse.json(
        { error: 'Failed to get auth status', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  /**
   * Get access token
   */
  async getAccessToken(request: NextRequest): Promise<NextResponse> {
    try {
      const token = await this.authService.getAccessToken();
      
      if (!token) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      return NextResponse.json({ accessToken: token });
    } catch (error) {
      console.error('Get access token error:', error);
      return NextResponse.json(
        { error: 'Failed to get access token', message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }
}

