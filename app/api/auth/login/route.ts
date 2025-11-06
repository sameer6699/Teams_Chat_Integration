/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/backend/controllers/Auth.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';

const authController = new AuthController();

export const POST = withErrorHandling(async (request: NextRequest) => {
  return await authController.login(request);
});

