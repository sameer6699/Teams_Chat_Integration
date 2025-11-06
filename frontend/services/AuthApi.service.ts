/**
 * Authentication API Service
 * Handles authentication-related API calls
 */

import { apiClient, ApiResponse } from './ApiClient.service';

export interface AuthStatus {
  isAuthenticated: boolean;
  account: {
    id: string;
    username: string;
    name: string;
  } | null;
}

export interface AccessTokenResponse {
  accessToken: string;
}

export class AuthApiService {
  /**
   * Get authentication status
   */
  async getAuthStatus(): Promise<ApiResponse<AuthStatus>> {
    return await apiClient.get<AuthStatus>('/auth/status');
  }

  /**
   * Login user
   */
  async login(): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/auth/login');
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/auth/logout');
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<ApiResponse<AccessTokenResponse>> {
    return await apiClient.get<AccessTokenResponse>('/auth/token');
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();

