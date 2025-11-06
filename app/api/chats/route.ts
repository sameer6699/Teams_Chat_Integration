/**
 * Chats API Route
 * GET /api/chats
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatController } from '@/backend/controllers/Chat.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';
import { authMiddleware } from '@/backend/middleware/auth.middleware';

const chatController = new ChatController();

export const GET = withErrorHandling(async (request: NextRequest) => {
  return await authMiddleware(request, async (req) => {
    return await chatController.getChats(req);
  });
});

