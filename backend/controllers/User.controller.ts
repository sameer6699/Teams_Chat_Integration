/**
 * User Controller
 * Handles user-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../services/User.service';
import { AuthService } from '../services/Auth.service';

export class UserController {
  private userService: UserService;
  private authService: AuthService;

  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
  }

  /**
   * Get current user
   * GET /api/user/me
   */
  async getCurrentUser(request: NextRequest): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current user
      const user = await this.userService.getCurrentUser(accessToken);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch user',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get user by ID
   * GET /api/user/[id]
   */
  async getUserById(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user
      const user = await this.userService.getUserById(accessToken, userId);

      return NextResponse.json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      console.error('Get user error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch user',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Update user status
   * PATCH /api/user/status
   */
  async updateUserStatus(request: NextRequest): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current user
      const user = await this.userService.getCurrentUser(accessToken);

      // Parse request body
      const body = await request.json();
      const { status } = body;

      if (!status || !['online', 'away', 'busy', 'offline'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: online, away, busy, offline' },
          { status: 400 }
        );
      }

      // Update status
      await this.userService.updateUserStatus(user.id, status);

      return NextResponse.json({
        success: true,
        message: 'Status updated successfully',
      });
    } catch (error) {
      console.error('Update user status error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update status',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

