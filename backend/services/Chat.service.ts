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
  markChatAsRead(accessToken: string, chatId: string, userId?: string): Promise<ChatModel | null>;
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
      console.log('Fetching chats with access token:', accessToken ? 'Token present' : 'No token');
      const chats = await this.graphApiService.getChats(accessToken);
      console.log(`Successfully fetched ${chats.length} chats`);
      
      // Enrich chats with last message and unread count
      // Use Promise.allSettled to continue even if some enrichments fail
      const enrichmentResults = await Promise.allSettled(
        chats.map(async (chat) => {
          try {
            // Only fetch last message for preview, limit to 1 message
            const messages = await this.graphApiService.getChatMessages(
              accessToken,
              chat.id,
              userId
            );
            
            // Filter out system messages
            const userMessages = messages.filter(msg => {
              // Filter out messages with no sender (system messages)
              return msg.sender && msg.sender.id;
            });
            
            if (userMessages.length > 0) {
              const lastMessage = userMessages[userMessages.length - 1];
              // Clean HTML from last message preview
              const cleanPreview = lastMessage.text
                ?.replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 100) || '';
              chat.lastMessage = cleanPreview;
              chat.lastMessageTime = lastMessage.timestamp;
              
              // Calculate unread count (messages not from current user in last 24 hours, excluding system messages)
              chat.unreadCount = userMessages.filter(
                (msg) => !msg.isSender && new Date(msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length;
            }
          } catch (error) {
            console.warn(`Failed to enrich chat ${chat.id}:`, error instanceof Error ? error.message : error);
            // Continue without enrichment rather than failing
          }
          
          return chat;
        })
      );

      // Extract successful enrichments
      const enrichedChats = enrichmentResults
        .filter((result): result is PromiseFulfilledResult<ChatModel> => result.status === 'fulfilled')
        .map(result => result.value);

      // Sort by last message time
      const sortedChats = enrichedChats.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });

      console.log(`Returning ${sortedChats.length} enriched chats`);
      return sortedChats;
    } catch (error) {
      console.error('Failed to get chats - Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch chats: ${errorMessage}`);
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
   * Mark chat as read and update unread count
   */
  async markChatAsRead(accessToken: string, chatId: string, userId?: string): Promise<ChatModel | null> {
    try {
      // Get the chat to update its unread count
      const chat = await this.getChatById(accessToken, chatId, userId);
      
      if (chat && chat.unreadCount && chat.unreadCount > 0) {
        // Decrease unread count (set to 0 when marked as read)
        chat.unreadCount = 0;
        
        console.log(`Marked chat ${chatId} as read - unread count reset to 0`);
        
        // Return updated chat model for broadcasting
        return chat;
      }
      
      return chat;
    } catch (error) {
      console.error(`Error marking chat ${chatId} as read:`, error);
      // Still return null to indicate failure, but don't throw
      return null;
    }
  }
}

