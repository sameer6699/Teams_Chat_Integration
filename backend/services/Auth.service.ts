/**
 * Authentication Service
 * Handles authentication logic and token management
 */

import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/lib/msalConfig';
import { getMsalInstance } from '@/lib/msalInstance';

export interface IAuthService {
  login(): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getCurrentAccount(): AccountInfo | null;
  isAuthenticated(): boolean;
}

export class AuthService implements IAuthService {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = getMsalInstance();
  }

  /**
   * Login user
   */
  async login(): Promise<void> {
    try {
      await this.msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000';
      await this.msalInstance.logoutRedirect({
        postLogoutRedirectUri: redirectUri,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Logout failed');
    }
  }

  /**
   * Get access token for current user
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const account = this.getCurrentAccount();
      if (!account) return null;

      const request = {
        ...loginRequest,
        account: account,
      };

      const response = await this.msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token:', error);
      // Try interactive login if silent fails
      try {
        const response = await this.msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error('Failed to acquire token via popup:', popupError);
        return null;
      }
    }
  }

  /**
   * Get current authenticated account
   */
  getCurrentAccount(): AccountInfo | null {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentAccount() !== null;
  }

  /**
   * Handle redirect promise (for OAuth redirect)
   */
  async handleRedirectPromise(): Promise<AuthenticationResult | null> {
    try {
      return await this.msalInstance.handleRedirectPromise();
    } catch (error) {
      console.error('Failed to handle redirect:', error);
      return null;
    }
  }
}

