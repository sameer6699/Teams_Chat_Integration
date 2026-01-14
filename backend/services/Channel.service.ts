/**
 * Channel Service
 * Handles channel-related business logic
 */

import { GraphApiService } from './GraphApi.service';
import { ChannelModel, IChannel } from '../models/Channel.model';

export interface IChannelService {
  getAllChannels(accessToken: string): Promise<ChannelModel[]>;
}

export class ChannelService implements IChannelService {
  private graphApiService: GraphApiService;

  constructor() {
    this.graphApiService = new GraphApiService();
  }

  /**
   * Get all channels from all teams
   */
  async getAllChannels(accessToken: string): Promise<ChannelModel[]> {
    try {
      return await this.graphApiService.getChannels(accessToken);
    } catch (error) {
      console.error('ChannelService: Failed to get channels:', error);
      throw error;
    }
  }
}
