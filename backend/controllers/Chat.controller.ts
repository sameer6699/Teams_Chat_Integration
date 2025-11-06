/**
 * Chat Controller
 * Handles chat-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '../services/Chat.service';
import { AuthService } from '../services/Auth.service';

export class ChatController {
  private chatService: ChatService;
  private authService: AuthService;

  constructor() {
    this.chatService = new ChatService();
    this.authService = new AuthService();
  }

  /**
   * Get all chats for current user
   * GET /api/chats
   */
  async getChats(request: NextRequest): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current user ID
      const account = this.authService.getCurrentAccount();
      const userId = account?.homeAccountId;

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
  async getChatById(request: NextRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current user ID
      const account = this.authService.getCurrentAccount();
      const userId = account?.homeAccountId;

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
  async getChatMessages(request: NextRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current user ID
      const account = this.authService.getCurrentAccount();
      const userId = account?.homeAccountId;

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
  async sendMessage(request: NextRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get current user ID
      const account = this.authService.getCurrentAccount();
      const userId = account?.homeAccountId;

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
  async markChatAsRead(request: NextRequest, chatId: string): Promise<NextResponse> {
    try {
      // Get access token
      const accessToken = await this.authService.getAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Mark as read
      await this.chatService.markChatAsRead(accessToken, chatId);

      return NextResponse.json({ success: true });
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

