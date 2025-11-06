/**
 * Chat by ID API Route
 * GET /api/chats/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatController } from '@/backend/controllers/Chat.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const chatController = new ChatController();

export const GET = withErrorHandling(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;
  return await authMiddleware(request, async (req) => {
    return await chatController.getChatById(req, params.id);
  });
});

