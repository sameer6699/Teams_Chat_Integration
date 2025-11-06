/**
 * Authentication Middleware
 * Validates authentication for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/Auth.service';

export interface AuthenticatedRequest extends NextRequest {
  accessToken?: string;
  userId?: string;
}

export async function authMiddleware(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authService = new AuthService();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get access token
    const accessToken = await authService.getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Failed to get access token' },
        { status: 401 }
      );
    }

    // Get current user ID
    const account = authService.getCurrentAccount();
    const userId = account?.homeAccountId;

    // Add token and user ID to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.accessToken = accessToken;
    authenticatedRequest.userId = userId;

    // Call the handler
    return await handler(authenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 401 }
    );
  }
}

