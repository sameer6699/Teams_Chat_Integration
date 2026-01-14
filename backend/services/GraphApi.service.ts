/**
 * Microsoft Graph API Service
 * Handles all Microsoft Graph API interactions
 */

import { GraphApiClient } from '@/lib/graphApi';
import { UserModel, IUser } from '../models/User.model';
import { ChatModel, IChat } from '../models/Chat.model';
import { MessageModel, IMessage } from '../models/Message.model';
import { TeamModel, ITeam } from '../models/Team.model';
import { ChannelModel, IChannel } from '../models/Channel.model';

export interface IGraphApiService {
  getCurrentUser(accessToken: string): Promise<UserModel>;
  getChats(accessToken: string): Promise<ChatModel[]>;
  getChatMessages(accessToken: string, chatId: string, userId?: string): Promise<MessageModel[]>;
  sendMessage(accessToken: string, chatId: string, message: string): Promise<MessageModel>;
  getTeams(accessToken: string): Promise<TeamModel[]>;
  getChannels(accessToken: string): Promise<ChannelModel[]>;
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
      console.log('GraphApiService: Getting chats...');
      const client = new GraphApiClient(accessToken);
      const response = await client.getChats();
      console.log(`GraphApiService: Received ${response.value?.length || 0} chats from Graph API`);
      
      if (!response.value) {
        console.warn('GraphApiService: No chats in response, returning empty array');
        return [];
      }
      
      const chats = response.value.map((chat: any) => {
        try {
          return ChatModel.fromGraphApi(chat);
        } catch (error) {
          console.error(`Failed to transform chat ${chat.id}:`, error);
          // Return a basic chat model if transformation fails
          return ChatModel.fromGraphApi(chat);
        }
      });
      
      console.log(`GraphApiService: Successfully transformed ${chats.length} chats`);
      return chats;
    } catch (error) {
      console.error('GraphApiService: Failed to get chats - Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('GraphApiService: Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to fetch chats from Graph API: ${errorMessage}`);
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
      
      // Filter out system messages and transform
      const messages = response.value
        .map((msg: any) => MessageModel.fromGraphApi(msg, chatId, userId))
        .filter((msg: MessageModel) => {
          // Filter out system messages (no sender or system event messages)
          return msg.sender && msg.sender.id && 
                 !msg.text.includes('systemEventMessage') &&
                 msg.text.trim().length > 0;
        });
      
      return messages;
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
      
      // Handle empty response or missing value property
      if (!response || !response.value) {
        console.warn('Teams API returned empty or invalid response:', response);
        return [];
      }
      
      return response.value.map((team: any) => TeamModel.fromGraphApi(team));
    } catch (error) {
      console.error('Failed to get teams - Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch teams: ${errorMessage}`);
    }
  }

  /**
   * Get all channels from all teams for current user
   */
  async getChannels(accessToken: string): Promise<ChannelModel[]> {
    try {
      console.log('GraphApiService: Getting channels...');
      const client = new GraphApiClient(accessToken);
      const channelsData = await client.getChannels();
      
      console.log(`GraphApiService: Received ${channelsData.length} channels from Graph API`);
      
      // Transform to ChannelModel
      const channels = channelsData.map(({ channel, teamId, teamName }) => {
        try {
          return ChannelModel.fromGraphApi(channel, teamId, teamName);
        } catch (error) {
          console.error(`Failed to transform channel ${channel.id}:`, error);
          // Return a basic channel model if transformation fails
          return ChannelModel.fromGraphApi(channel, teamId, teamName);
        }
      });
      
      console.log(`GraphApiService: Successfully transformed ${channels.length} channels`);
      return channels;
    } catch (error) {
      console.error('GraphApiService: Failed to get channels - Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch channels: ${errorMessage}`);
    }
  }
}

