/**
 * Chat API Service
 * Handles chat-related API calls
 */

import { apiClient, ApiResponse } from './ApiClient.service';
import { IChat } from '@/backend/models/Chat.model';
import { IMessage } from '@/backend/models/Message.model';

export class ChatApiService {
  /**
   * Get all chats
   */
  async getAllChats(): Promise<ApiResponse<IChat[]>> {
    return await apiClient.get<IChat[]>('/chats');
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: string): Promise<ApiResponse<IChat>> {
    return await apiClient.get<IChat>(`/chats/${chatId}`);
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(chatId: string): Promise<ApiResponse<IMessage[]>> {
    return await apiClient.get<IMessage[]>(`/chats/${chatId}/messages`);
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, message: string): Promise<ApiResponse<IMessage>> {
    return await apiClient.post<IMessage>(`/chats/${chatId}/messages`, { message });
  }

  /**
   * Mark chat as read
   */
  async markChatAsRead(chatId: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/chats/${chatId}/read`);
  }
}

// Export singleton instance
export const chatApiService = new ChatApiService();

