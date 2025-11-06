/**
 * Current User API Route
 * GET /api/user/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserController } from '@/backend/controllers/User.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const userController = new UserController();

export const GET = withErrorHandling(async (request: NextRequest) => {
  return await authMiddleware(request, async (req) => {
    return await userController.getCurrentUser(req);
  });
});

