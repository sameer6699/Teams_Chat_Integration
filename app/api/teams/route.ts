/**
 * Teams API Route
 * GET /api/teams
 */

import { NextRequest, NextResponse } from 'next/server';
import { TeamController } from '@/backend/controllers/Team.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const teamController = new TeamController();

export const GET = withErrorHandling(async (request: NextRequest) => {
  return await authMiddleware(request, async (req) => {
    return await teamController.getTeams(req);
  });
});

