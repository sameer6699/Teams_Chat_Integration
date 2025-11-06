/**
 * User API Service
 * Handles user-related API calls
 */

import { apiClient, ApiResponse } from './ApiClient.service';
import { IUser } from '@/backend/models/User.model';

export class UserApiService {
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<IUser>> {
    return await apiClient.get<IUser>('/user/me');
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<IUser>> {
    return await apiClient.get<IUser>(`/user/${userId}`);
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    status: 'online' | 'away' | 'busy' | 'offline'
  ): Promise<ApiResponse<void>> {
    return await apiClient.patch<void>('/user/status', { status });
  }
}

// Export singleton instance
export const userApiService = new UserApiService();

