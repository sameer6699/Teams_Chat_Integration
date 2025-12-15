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
    // First, try to get token from Authorization header (client-side token)
    // This is the preferred method for client-side requests
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    let accessToken: string | null = null;
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use token from Authorization header
      accessToken = authHeader.substring(7).trim();
      
      // Basic validation - token should not be empty
      if (!accessToken || accessToken.length === 0) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid access token in header' },
          { status: 401 }
        );
      }
      
      // Token is provided, use it directly
      // The Graph API will validate the token
      console.log('Using access token from Authorization header');
    } else {
      // Fallback to server-side MSAL (for server-to-server calls)
      // Note: This may not work in all server environments
      try {
        const authService = new AuthService();
        
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required. Please provide Authorization header with Bearer token.' },
            { status: 401 }
          );
        }

        // Get access token
        accessToken = await authService.getAccessToken();
        if (!accessToken) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Failed to get access token from server-side auth' },
            { status: 401 }
          );
        }

        // Get current user ID
        const account = authService.getCurrentAccount();
        userId = account?.homeAccountId;
        console.log('Using access token from server-side MSAL');
      } catch (serverAuthError) {
        // Server-side auth failed
        console.error('Server-side auth failed:', serverAuthError);
        return NextResponse.json(
          { 
            error: 'Unauthorized', 
            message: 'Authentication required. Please provide Authorization header with Bearer token.',
            details: serverAuthError instanceof Error ? serverAuthError.message : 'Server-side authentication failed'
          },
          { status: 401 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No access token provided' },
        { status: 401 }
      );
    }

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

