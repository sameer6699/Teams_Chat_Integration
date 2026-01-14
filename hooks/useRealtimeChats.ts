/**
 * React Hook for Real-time Chat and Channel List Updates
 * Uses WebSocket to receive real-time updates for chats and channels
 */

import { useEffect, useCallback, useRef } from 'react';
import { wsClient } from '@/lib/websocket';
import { useAuth } from '@/lib/authContext';

interface Chat {
  id: string;
  topic?: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  chatType: 'oneOnOne' | 'group' | 'meeting';
  webUrl: string;
  members?: Array<{
    id: string;
    displayName: string;
    userId: string;
  }>;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  participants?: Array<{
    id: string;
    displayName: string;
    email?: string;
  }>;
}

interface Channel {
  id: string;
  displayName: string;
  description?: string;
  email?: string;
  webUrl?: string;
  membershipType?: 'standard' | 'private' | 'shared' | 'public';
  teamId: string;
  teamName?: string;
  createdDateTime?: string;
  isFavoriteByDefault?: boolean;
}

interface UseRealtimeChatsOptions {
  enabled?: boolean;
  onChatsLoaded?: (chats: Chat[]) => void;
  onChannelsLoaded?: (channels: Channel[]) => void;
  onChatsUpdate?: (chats: Chat[]) => void;
  onChannelsUpdate?: (channels: Channel[]) => void;
  onChatCreated?: (chat: Chat) => void;
  onChatUpdated?: (chat: Chat) => void;
  onChannelCreated?: (channel: Channel) => void;
  onChannelUpdated?: (channel: Channel) => void;
}

export function useRealtimeChats(options: UseRealtimeChatsOptions = {}) {
  const {
    enabled = true,
    onChatsLoaded,
    onChannelsLoaded,
    onChatsUpdate,
    onChannelsUpdate,
    onChatCreated,
    onChatUpdated,
    onChannelCreated,
    onChannelUpdated,
  } = options;

  const { isAuthenticated, getAccessToken, user } = useAuth();
  const chatsRef = useRef<Chat[]>([]);
  const channelsRef = useRef<Channel[]>([]);
  const isConnectedRef = useRef(false);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    const connect = async () => {
      try {
        const token = await getAccessToken();
        if (token && !wsClient.isConnected()) {
          // Connect without specific chatId for list updates
          wsClient.connect(token);
          isConnectedRef.current = true;
        }
      } catch (error) {
        console.error('Error connecting WebSocket for real-time updates:', error);
      }
    };

    connect();

    return () => {
      // Don't disconnect if there are other active connections
      // The WebSocket client manages its own lifecycle
    };
  }, [enabled, isAuthenticated, getAccessToken]);

  // Subscribe to initial data load
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    // Listen for initial chats load
    const unsubscribeChatsLoaded = wsClient.on('chats_loaded', (data: { chats: Chat[] }) => {
      console.log('Real-time: Initial chats loaded via WebSocket', data.chats.length);
      chatsRef.current = data.chats;
      if (onChatsLoaded) {
        onChatsLoaded(data.chats);
      }
      // Also update via onChatsUpdate if provided
      if (onChatsUpdate) {
        onChatsUpdate(data.chats);
      }
    });

    // Listen for initial channels load
    const unsubscribeChannelsLoaded = wsClient.on('channels_loaded', (data: { channels: Channel[] }) => {
      console.log('Real-time: Initial channels loaded via WebSocket', data.channels.length);
      channelsRef.current = data.channels;
      if (onChannelsLoaded) {
        onChannelsLoaded(data.channels);
      }
      // Also update via onChannelsUpdate if provided
      if (onChannelsUpdate) {
        onChannelsUpdate(data.channels);
      }
    });

    return () => {
      unsubscribeChatsLoaded();
      unsubscribeChannelsLoaded();
    };
  }, [enabled, isAuthenticated, onChatsLoaded, onChannelsLoaded, onChatsUpdate, onChannelsUpdate]);

  // Subscribe to chat updates
  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const unsubscribeChatCreated = wsClient.on('chat_created', (data: { chat: Chat }) => {
      console.log('Real-time: New chat created', data.chat);
      if (onChatCreated) {
        onChatCreated(data.chat);
      }
      // Update chats list
      if (onChatsUpdate) {
        const updatedChats = [...chatsRef.current, data.chat];
        chatsRef.current = updatedChats;
        onChatsUpdate(updatedChats);
      }
    });

    const unsubscribeChatUpdated = wsClient.on('chat_updated', (data: { chat: Chat }) => {
      console.log('Real-time: Chat updated', data.chat);
      if (onChatUpdated) {
        onChatUpdated(data.chat);
      }
      // Update chats list
      if (onChatsUpdate) {
        const updatedChats = chatsRef.current.map(chat =>
          chat.id === data.chat.id ? { ...chat, ...data.chat } : chat
        );
        chatsRef.current = updatedChats;
        onChatsUpdate(updatedChats);
      }
    });

    const unsubscribeChannelCreated = wsClient.on('channel_created', (data: { channel: Channel }) => {
      console.log('Real-time: New channel created', data.channel);
      if (onChannelCreated) {
        onChannelCreated(data.channel);
      }
      // Update channels list
      if (onChannelsUpdate) {
        const updatedChannels = [...channelsRef.current, data.channel];
        channelsRef.current = updatedChannels;
        onChannelsUpdate(updatedChannels);
      }
    });

    const unsubscribeChannelUpdated = wsClient.on('channel_updated', (data: { channel: Channel }) => {
      console.log('Real-time: Channel updated', data.channel);
      if (onChannelUpdated) {
        onChannelUpdated(data.channel);
      }
      // Update channels list
      if (onChannelsUpdate) {
        const updatedChannels = channelsRef.current.map(channel =>
          channel.id === data.channel.id ? { ...channel, ...data.channel } : channel
        );
        channelsRef.current = updatedChannels;
        onChannelsUpdate(updatedChannels);
      }
    });

    return () => {
      unsubscribeChatCreated();
      unsubscribeChatUpdated();
      unsubscribeChannelCreated();
      unsubscribeChannelUpdated();
    };
  }, [enabled, isAuthenticated, onChatsUpdate, onChannelsUpdate, onChatCreated, onChatUpdated, onChannelCreated, onChannelUpdated]);

  // Update refs when external updates occur
  const updateChatsRef = useCallback((chats: Chat[]) => {
    chatsRef.current = chats;
  }, []);

  const updateChannelsRef = useCallback((channels: Channel[]) => {
    channelsRef.current = channels;
  }, []);

  return {
    isConnected: wsClient.isConnected(),
    updateChatsRef,
    updateChannelsRef,
  };
}
