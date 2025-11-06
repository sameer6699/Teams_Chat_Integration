/**
 * Microsoft Graph API Service
 * Handles all Microsoft Graph API interactions
 */

import { GraphApiClient } from '@/lib/graphApi';
import { UserModel, IUser } from '../models/User.model';
import { ChatModel, IChat } from '../models/Chat.model';
import { MessageModel, IMessage } from '../models/Message.model';
import { TeamModel, ITeam } from '../models/Team.model';

export interface IGraphApiService {
  getCurrentUser(accessToken: string): Promise<UserModel>;
  getChats(accessToken: string): Promise<ChatModel[]>;
  getChatMessages(accessToken: string, chatId: string, userId?: string): Promise<MessageModel[]>;
  sendMessage(accessToken: string, chatId: string, message: string): Promise<MessageModel>;
  getTeams(accessToken: string): Promise<TeamModel[]>;
}

export class GraphApiService implements IGraphApiService {
  /**
   * Get current user information
   */
  async getCurrentUser(accessToken: string): Promise<UserModel> {
    try {
      const client = new GraphApiClient(accessToken);
      const graphUser = await client.getCurrentUser();
      return UserModel.fromGraphApi(graphUser);
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * Get all chats for current user
   */
  async getChats(accessToken: string): Promise<ChatModel[]> {
    try {
      const client = new GraphApiClient(accessToken);
      const response = await client.getChats();
      return response.value.map((chat: any) => ChatModel.fromGraphApi(chat));
    } catch (error) {
      console.error('Failed to get chats:', error);
      throw new Error('Failed to fetch chats');
    }
  }

  /**
   * Get messages for a specific chat
   */
  async getChatMessages(
    accessToken: string,
    chatId: string,
    userId?: string
  ): Promise<MessageModel[]> {
    try {
      const client = new GraphApiClient(accessToken);
      const response = await client.getChatMessages(chatId);
      return response.value.map((msg: any) =>
        MessageModel.fromGraphApi(msg, chatId, userId)
      );
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      throw new Error('Failed to fetch chat messages');
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(
    accessToken: string,
    chatId: string,
    message: string
  ): Promise<MessageModel> {
    try {
      const client = new GraphApiClient(accessToken);
      const response = await client.sendChatMessage(chatId, message);
      
      // Create a message model from the response
      return new MessageModel({
        id: response.id,
        chatId: chatId,
        text: message,
        timestamp: response.createdDateTime || new Date().toISOString(),
        isSender: true,
        contentType: 'text',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get all teams for current user
   */
  async getTeams(accessToken: string): Promise<TeamModel[]> {
    try {
      const client = new GraphApiClient(accessToken);
      const response = await client.getTeams();
      return response.value.map((team: any) => TeamModel.fromGraphApi(team));
    } catch (error) {
      console.error('Failed to get teams:', error);
      throw new Error('Failed to fetch teams');
    }
  }
}

