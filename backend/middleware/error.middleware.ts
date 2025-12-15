/**
 * Error Handling Middleware
 * Centralized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known error types
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    // Handle validation errors
    if (apiError.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: apiError.message,
        },
        { status: 400 }
      );
    }

    // Handle authentication errors
    if (apiError.code === 'AUTH_ERROR' || apiError.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication Error',
          message: apiError.message,
        },
        { status: 401 }
      );
    }

    // Handle not found errors
    if (apiError.code === 'NOT_FOUND' || apiError.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: apiError.message,
        },
        { status: 404 }
      );
    }

    // Handle custom status codes
    if (apiError.statusCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error',
          message: apiError.message,
        },
        { status: apiError.statusCode }
      );
    }
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Wrapper for async route handlers with error handling
 * Supports both single-argument and dynamic route handlers
 */

// Overload for single-argument handlers (non-dynamic routes)
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse>;

// Overload for two-argument handlers (dynamic routes with params)
export function withErrorHandling<T extends { [key: string]: string }>(
  handler: (
    request: NextRequest,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>
): (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>;

// Implementation
export function withErrorHandling<T extends { [key: string]: string }>(
  handler: (
    request: NextRequest,
    context?: { params: Promise<T> }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context?: { params: Promise<T> }
  ): Promise<NextResponse> => {
    try {
      if (context) {
        return await handler(request, context);
      } else {
        return await handler(request);
      }
    } catch (error) {
      return handleError(error);
    }
  };
}

