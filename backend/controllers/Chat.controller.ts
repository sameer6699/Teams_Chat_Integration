/**
 * Chat Controller
 * Handles chat-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '../services/Chat.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Get all chats for current user
   * GET /api/chats
   */
  async getChats(request: AuthenticatedRequest): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
      }

      // Get user ID from authenticated request
      const userId = request.userId;

      // Get chats
      const chats = await this.chatService.getAllChats(accessToken, userId);

      return NextResponse.json({
        success: true,
        data: chats.map(chat => chat.toJSON()),
      });
    } catch (error) {
      console.error('Get chats error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch chats',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get chat by ID
   * GET /api/chats/[id]
   */
  async getChatById(request: AuthenticatedRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
      }

      // Get user ID from authenticated request
      const userId = request.userId;

      // Get chat
      const chat = await this.chatService.getChatById(accessToken, chatId, userId);

      return NextResponse.json({
        success: true,
        data: chat.toJSON(),
      });
    } catch (error) {
      console.error('Get chat error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch chat',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get messages for a chat
   * GET /api/chats/[id]/messages
   */
  async getChatMessages(request: AuthenticatedRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
      }

      // Get user ID from authenticated request
      const userId = request.userId;

      // Get messages
      const messages = await this.chatService.getChatMessages(accessToken, chatId, userId);

      return NextResponse.json({
        success: true,
        data: messages.map(msg => msg.toJSON()),
      });
    } catch (error) {
      console.error('Get chat messages error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch messages',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Send a message to a chat
   * POST /api/chats/[id]/messages
   */
  async sendMessage(request: AuthenticatedRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
      }

      // Get user ID from authenticated request
      const userId = request.userId;

      // Parse request body
      const body = await request.json();
      const { message } = body;

      if (!message || typeof message !== 'string') {
        return NextResponse.json(
          { error: 'Message is required and must be a string' },
          { status: 400 }
        );
      }

      // Send message
      const sentMessage = await this.chatService.sendMessage(accessToken, chatId, message, userId);

      // Broadcast message via WebSocket to all connected clients in this chat
      try {
        const { broadcastMessage } = await import('../../server');
        const messageData = sentMessage.toJSON();
        broadcastMessage(chatId, messageData);
      } catch (wsError) {
        console.error('Error broadcasting message via WebSocket:', wsError);
        // Continue even if WebSocket broadcast fails
      }

      return NextResponse.json({
        success: true,
        data: sentMessage.toJSON(),
      }, { status: 201 });
    } catch (error) {
      console.error('Send message error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send message',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  /**
   * Mark chat as read
   * POST /api/chats/[id]/read
   */
  async markChatAsRead(request: AuthenticatedRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
      }

      // Get user ID from authenticated request
      const userId = request.userId;

      // Mark as read and get updated chat
      const updatedChat = await this.chatService.markChatAsRead(accessToken, chatId, userId);

      // Broadcast the update via WebSocket if available
      if (updatedChat && userId) {
        try {
          const { broadcastChatUpdate } = await import('../../server');
          broadcastChatUpdate(userId, updatedChat.toJSON());
        } catch (wsError) {
          console.error('Error broadcasting chat update:', wsError);
          // Continue even if WebSocket broadcast fails
        }
      }

      return NextResponse.json({ 
        success: true,
        data: updatedChat ? updatedChat.toJSON() : null,
      });
    } catch (error) {
      console.error('Mark chat as read error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to mark chat as read',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}

