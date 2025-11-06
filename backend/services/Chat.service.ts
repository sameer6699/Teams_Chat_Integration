/**
 * Chat Service
 * Business logic for chat operations
 */

import { ChatModel, IChat } from '../models/Chat.model';
import { MessageModel, IMessage } from '../models/Message.model';
import { GraphApiService } from './GraphApi.service';

export interface IChatService {
  getAllChats(accessToken: string, userId?: string): Promise<ChatModel[]>;
  getChatById(accessToken: string, chatId: string, userId?: string): Promise<ChatModel>;
  getChatMessages(accessToken: string, chatId: string, userId?: string): Promise<MessageModel[]>;
  sendMessage(accessToken: string, chatId: string, message: string, userId?: string): Promise<MessageModel>;
  markChatAsRead(accessToken: string, chatId: string): Promise<void>;
}

export class ChatService implements IChatService {
  private graphApiService: GraphApiService;

  constructor() {
    this.graphApiService = new GraphApiService();
  }

  /**
   * Get all chats for user
   */
  async getAllChats(accessToken: string, userId?: string): Promise<ChatModel[]> {
    try {
      const chats = await this.graphApiService.getChats(accessToken);
      
      // Enrich chats with last message and unread count
      const enrichedChats = await Promise.all(
        chats.map(async (chat) => {
          try {
            const messages = await this.graphApiService.getChatMessages(
              accessToken,
              chat.id,
              userId
            );
            
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              chat.lastMessage = lastMessage.text;
              chat.lastMessageTime = lastMessage.timestamp;
              
              // Calculate unread count (messages not from current user)
              chat.unreadCount = messages.filter(
                (msg) => !msg.isSender && new Date(msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length;
            }
          } catch (error) {
            console.warn(`Failed to enrich chat ${chat.id}:`, error);
          }
          
          return chat;
        })
      );

      // Sort by last message time
      return enrichedChats.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Failed to get chats:', error);
      throw new Error('Failed to fetch chats');
    }
  }

  /**
   * Get chat by ID
   */
  async getChatById(accessToken: string, chatId: string, userId?: string): Promise<ChatModel> {
    try {
      const chats = await this.graphApiService.getChats(accessToken);
      const chat = chats.find((c) => c.id === chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Enrich with messages
      const messages = await this.graphApiService.getChatMessages(accessToken, chatId, userId);
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        chat.lastMessage = lastMessage.text;
        chat.lastMessageTime = lastMessage.timestamp;
      }

      return chat;
    } catch (error) {
      console.error('Failed to get chat:', error);
      throw new Error('Failed to fetch chat');
    }
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(
    accessToken: string,
    chatId: string,
    userId?: string
  ): Promise<MessageModel[]> {
    try {
      const messages = await this.graphApiService.getChatMessages(accessToken, chatId, userId);
      
      // Sort by timestamp (oldest first)
      return messages.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      throw new Error('Failed to fetch chat messages');
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    accessToken: string,
    chatId: string,
    message: string,
    userId?: string
  ): Promise<MessageModel> {
    try {
      // Validate message
      if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      if (message.length > 8000) {
        throw new Error('Message is too long (max 8000 characters)');
      }

      return await this.graphApiService.sendMessage(accessToken, chatId, message.trim());
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error instanceof Error ? error : new Error('Failed to send message');
    }
  }

  /**
   * Mark chat as read (placeholder - would need Graph API support)
   */
  async markChatAsRead(accessToken: string, chatId: string): Promise<void> {
    // This would require additional Graph API permissions and endpoints
    // For now, it's a placeholder
    console.log(`Marking chat ${chatId} as read`);
  }
}

