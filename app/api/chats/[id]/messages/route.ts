/**
 * Chat Messages API Route
 * GET /api/chats/[id]/messages - Get messages
 * POST /api/chats/[id]/messages - Send message
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
    return await chatController.getChatMessages(req, params.id);
  });
});

export const POST = withErrorHandling(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const params = await context.params;
  return await authMiddleware(request, async (req) => {
    return await chatController.sendMessage(req, params.id);
  });
});

