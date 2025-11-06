/**
 * Team by ID API Route
 * GET /api/teams/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { TeamController } from '@/backend/controllers/Team.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const teamController = new TeamController();

export const GET = withErrorHandling(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;
  return await authMiddleware(request, async (req) => {
    return await teamController.getTeamById(req, params.id);
  });
});

