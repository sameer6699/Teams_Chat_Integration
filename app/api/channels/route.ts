/**
 * Channels API Route
 * GET /api/channels
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChannelController } from '@/backend/controllers/Channel.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const channelController = new ChannelController();

export const GET = withErrorHandling(async (request: NextRequest) => {
  return await authMiddleware(request, async (req) => {
    return await channelController.getChannels(req);
  });
});
