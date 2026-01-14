/**
 * Channel Controller
 * Handles channel-related HTTP requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChannelService } from '../services/Channel.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ChannelController {
  private channelService: ChannelService;

  constructor() {
    this.channelService = new ChannelService();
  }

  /**
   * Get all channels from all teams for current user
   * GET /api/channels
   */
  async getChannels(request: AuthenticatedRequest): Promise<NextResponse> {
    try {
      // Get access token from authenticated request (set by middleware)
      const accessToken = request.accessToken;
      if (!accessToken) {
        console.error('ChannelController: No access token provided');
        return NextResponse.json({ error: 'Unauthorized', message: 'No access token provided' }, { status: 401 });
      }

      console.log('ChannelController: Fetching channels...');
      // Get channels
      const channels = await this.channelService.getAllChannels(accessToken);

      console.log(`ChannelController: Successfully fetched ${channels.length} channels`);

      return NextResponse.json({
        success: true,
        data: channels.map(channel => channel.toJSON()),
      });
    } catch (error) {
      console.error('ChannelController: Get channels error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // If it's a permission error or no teams error, return empty array instead of error
      // This allows the UI to show "No channels found" instead of an error message
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || 
          errorMessage.includes('No teams') || errorMessage.includes('not found')) {
        console.warn('ChannelController: Returning empty channels array due to:', errorMessage);
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch channels',
          message: errorMessage,
        },
        { status: 500 }
      );
    }
  }
}
