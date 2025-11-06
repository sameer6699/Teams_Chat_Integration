/**
 * Access Token API Route
 * GET /api/auth/token
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/backend/controllers/Auth.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';

const authController = new AuthController();

export const GET = withErrorHandling(async (request: NextRequest) => {
  return await authController.getAccessToken(request);
});

