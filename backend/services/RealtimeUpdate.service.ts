/**
 * Realtime Update Service
 * Polls Microsoft Graph API for chat and channel updates and broadcasts via WebSocket
 */

import { GraphApiService } from './GraphApi.service';
import { ChannelService } from './Channel.service';
import { ChatService } from './Chat.service';

interface ChatSnapshot {
  id: string;
  lastUpdatedDateTime: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface ChannelSnapshot {
  id: string;
  teamId: string;
  displayName: string;
}

export class RealtimeUpdateService {
  private graphApiService: GraphApiService;
  private chatService: ChatService;
  private channelService: ChannelService;
  // Per-user snapshots and polling intervals
  private userChatSnapshots: Map<string, Map<string, ChatSnapshot>> = new Map();
  private userChannelSnapshots: Map<string, Map<string, ChannelSnapshot>> = new Map();
  private userPollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private userPollingStatus: Map<string, boolean> = new Map();

  constructor() {
    this.graphApiService = new GraphApiService();
    this.chatService = new ChatService();
    this.channelService = new ChannelService();
  }

  /**
   * Start polling for updates for a specific user
   */
  startPolling(userId: string, accessToken: string, intervalMs: number = 30000): void {
    if (this.userPollingStatus.get(userId)) {
      console.log(`RealtimeUpdateService: Already polling for user ${userId}`);
      return;
    }

    this.userPollingStatus.set(userId, true);
    console.log(`RealtimeUpdateService: Starting polling for user ${userId}`);

    // Initialize user-specific snapshots
    if (!this.userChatSnapshots.has(userId)) {
      this.userChatSnapshots.set(userId, new Map());
    }
    if (!this.userChannelSnapshots.has(userId)) {
      this.userChannelSnapshots.set(userId, new Map());
    }

    // Initial snapshot
    this.takeSnapshot(accessToken, userId).catch(err => {
      console.error(`RealtimeUpdateService: Error taking initial snapshot for user ${userId}:`, err);
    });

    // Poll for updates
    const interval = setInterval(async () => {
      try {
        await this.checkForUpdates(accessToken, userId);
      } catch (error) {
        console.error(`RealtimeUpdateService: Error checking for updates for user ${userId}:`, error);
      }
    }, intervalMs);

    this.userPollingIntervals.set(userId, interval);
  }

  /**
   * Stop polling for updates for a specific user
   */
  stopPolling(userId?: string): void {
    if (userId) {
      // Stop polling for specific user
      const interval = this.userPollingIntervals.get(userId);
      if (interval) {
        clearInterval(interval);
        this.userPollingIntervals.delete(userId);
      }
      this.userPollingStatus.set(userId, false);
      this.userChatSnapshots.delete(userId);
      this.userChannelSnapshots.delete(userId);
      console.log(`RealtimeUpdateService: Stopped polling for user ${userId}`);
    } else {
      // Stop all polling
      for (const [uid, interval] of this.userPollingIntervals) {
        clearInterval(interval);
      }
      this.userPollingIntervals.clear();
      this.userPollingStatus.clear();
      this.userChatSnapshots.clear();
      this.userChannelSnapshots.clear();
      console.log('RealtimeUpdateService: Stopped all polling');
    }
  }

  /**
   * Take initial snapshot of chats and channels for a user
   */
  private async takeSnapshot(accessToken: string, userId: string): Promise<void> {
    try {
      const chatSnapshots = this.userChatSnapshots.get(userId) || new Map();
      const channelSnapshots = this.userChannelSnapshots.get(userId) || new Map();

      // Get chats
      const chats = await this.chatService.getAllChats(accessToken, userId);
      chats.forEach(chat => {
        chatSnapshots.set(chat.id, {
          id: chat.id,
          lastUpdatedDateTime: chat.lastUpdatedDateTime,
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount,
        });
      });

      // Get channels
      const channels = await this.channelService.getAllChannels(accessToken);
      channels.forEach(channel => {
        const key = `${channel.teamId}-${channel.id}`;
        channelSnapshots.set(key, {
          id: channel.id,
          teamId: channel.teamId,
          displayName: channel.displayName,
        });
      });

      this.userChatSnapshots.set(userId, chatSnapshots);
      this.userChannelSnapshots.set(userId, channelSnapshots);

      console.log(`RealtimeUpdateService: Snapshot taken for user ${userId} - ${chats.length} chats, ${channels.length} channels`);
    } catch (error) {
      console.error(`RealtimeUpdateService: Error taking snapshot for user ${userId}:`, error);
    }
  }

  /**
   * Check for updates and broadcast changes for a user
   */
  private async checkForUpdates(accessToken: string, userId: string): Promise<void> {
    try {
      // Dynamically import to avoid circular dependencies
      const { broadcastChatUpdate, broadcastChannelUpdate, broadcastNewChat, broadcastNewChannel } = await import('../../server');

      const chatSnapshots = this.userChatSnapshots.get(userId) || new Map();
      const channelSnapshots = this.userChannelSnapshots.get(userId) || new Map();

      // Check chats for updates
      const chats = await this.chatService.getAllChats(accessToken, userId);
      const currentChatIds = new Set(chats.map(chat => chat.id));

      // Check for new or updated chats
      for (const chat of chats) {
        const snapshot = chatSnapshots.get(chat.id);
        
        if (!snapshot) {
          // New chat
          console.log(`RealtimeUpdateService: New chat detected for user ${userId}: ${chat.id}`);
          broadcastNewChat(userId, chat.toJSON());
          chatSnapshots.set(chat.id, {
            id: chat.id,
            lastUpdatedDateTime: chat.lastUpdatedDateTime,
            lastMessage: chat.lastMessage,
            unreadCount: chat.unreadCount,
          });
        } else if (
          snapshot.lastUpdatedDateTime !== chat.lastUpdatedDateTime ||
          snapshot.lastMessage !== chat.lastMessage ||
          snapshot.unreadCount !== chat.unreadCount
        ) {
          // Updated chat
          console.log(`RealtimeUpdateService: Chat updated for user ${userId}: ${chat.id}`);
          broadcastChatUpdate(userId, chat.toJSON());
          chatSnapshots.set(chat.id, {
            id: chat.id,
            lastUpdatedDateTime: chat.lastUpdatedDateTime,
            lastMessage: chat.lastMessage,
            unreadCount: chat.unreadCount,
          });
        }
      }

      // Check for removed chats
      for (const [chatId] of chatSnapshots) {
        if (!currentChatIds.has(chatId)) {
          console.log(`RealtimeUpdateService: Chat removed for user ${userId}: ${chatId}`);
          chatSnapshots.delete(chatId);
          // Optionally broadcast chat deletion
        }
      }

      // Check channels for updates
      const channels = await this.channelService.getAllChannels(accessToken);
      const currentChannelKeys = new Set(
        channels.map(channel => `${channel.teamId}-${channel.id}`)
      );

      // Check for new or updated channels
      for (const channel of channels) {
        const key = `${channel.teamId}-${channel.id}`;
        const snapshot = channelSnapshots.get(key);
        
        if (!snapshot) {
          // New channel
          console.log(`RealtimeUpdateService: New channel detected for user ${userId}: ${channel.id}`);
          broadcastNewChannel(userId, channel.toJSON());
          channelSnapshots.set(key, {
            id: channel.id,
            teamId: channel.teamId,
            displayName: channel.displayName,
          });
        } else if (snapshot.displayName !== channel.displayName) {
          // Updated channel
          console.log(`RealtimeUpdateService: Channel updated for user ${userId}: ${channel.id}`);
          broadcastChannelUpdate(userId, channel.toJSON());
          channelSnapshots.set(key, {
            id: channel.id,
            teamId: channel.teamId,
            displayName: channel.displayName,
          });
        }
      }

      // Check for removed channels
      for (const [key] of channelSnapshots) {
        if (!currentChannelKeys.has(key)) {
          console.log(`RealtimeUpdateService: Channel removed for user ${userId}: ${key}`);
          channelSnapshots.delete(key);
          // Optionally broadcast channel deletion
        }
      }

      // Update maps
      this.userChatSnapshots.set(userId, chatSnapshots);
      this.userChannelSnapshots.set(userId, channelSnapshots);
    } catch (error) {
      console.error(`RealtimeUpdateService: Error checking for updates for user ${userId}:`, error);
    }
  }
}

// Singleton instance
export const realtimeUpdateService = new RealtimeUpdateService();
