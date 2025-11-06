/**
 * User Service
 * Business logic for user operations
 */

import { UserModel, IUser } from '../models/User.model';
import { GraphApiService } from './GraphApi.service';

export interface IUserService {
  getCurrentUser(accessToken: string): Promise<UserModel>;
  getUserById(accessToken: string, userId: string): Promise<UserModel>;
  updateUserStatus(userId: string, status: 'online' | 'away' | 'busy' | 'offline'): Promise<void>;
}

export class UserService implements IUserService {
  private graphApiService: GraphApiService;
  private userCache: Map<string, UserModel> = new Map();

  constructor() {
    this.graphApiService = new GraphApiService();
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(accessToken: string): Promise<UserModel> {
    try {
      return await this.graphApiService.getCurrentUser(accessToken);
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw new Error('Failed to fetch current user');
    }
  }

  /**
   * Get user by ID (placeholder - would need Graph API endpoint)
   */
  async getUserById(accessToken: string, userId: string): Promise<UserModel> {
    // This would typically require a Graph API endpoint like /users/{id}
    // For now, we'll use the current user as a fallback
    try {
      const currentUser = await this.getCurrentUser(accessToken);
      if (currentUser.id === userId) {
        return currentUser;
      }
      
      // If cached, return cached user
      if (this.userCache.has(userId)) {
        return this.userCache.get(userId)!;
      }

      throw new Error('User not found');
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Update user status (local state management)
   */
  async updateUserStatus(
    userId: string,
    status: 'online' | 'away' | 'busy' | 'offline'
  ): Promise<void> {
    // This would typically update a database or cache
    // For now, just update the cache if the user exists
    const user = this.userCache.get(userId);
    if (user) {
      user.status = status;
      this.userCache.set(userId, user);
    }
  }

  /**
   * Cache user data
   */
  cacheUser(user: UserModel): void {
    this.userCache.set(user.id, user);
  }

  /**
   * Get cached user
   */
  getCachedUser(userId: string): UserModel | undefined {
    return this.userCache.get(userId);
  }
}

