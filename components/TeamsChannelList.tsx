'use client';

import { Search, Plus, ChevronDown, ChevronRight, MoreVertical, Loader2, AlertCircle, Sparkles, AtSign, MessageSquare, Hash, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRealtimeChats } from '@/hooks/useRealtimeChats';

// Chat interface matching the API response
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

// Channel interface matching the API response
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

interface TeamsChannelListProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export function TeamsChannelList({
  selectedChatId,
  onChatSelect,
}: TeamsChannelListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFavouritesExpanded, setIsFavouritesExpanded] = useState(true);
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  const [isChannelsExpanded, setIsChannelsExpanded] = useState(true);
  const [isUnreadExpanded, setIsUnreadExpanded] = useState(true);
  const { isAuthenticated, getAccessToken, user } = useAuth();

  // Real-time WebSocket updates for chats and channels
  const { updateChatsRef, updateChannelsRef } = useRealtimeChats({
    enabled: isAuthenticated,
    // Initial load via WebSocket
    onChatsLoaded: (loadedChats) => {
      console.log('Real-time: Initial chats loaded via WebSocket', loadedChats.length);
      setChats(loadedChats);
      updateChatsRef(loadedChats);
      // Only set loading to false if we have both chats and channels, or if channels are already loaded
      if (channels.length > 0 || loadedChats.length > 0) {
        setLoading(false);
      }
    },
    onChannelsLoaded: (loadedChannels) => {
      console.log('Real-time: Initial channels loaded via WebSocket', loadedChannels.length);
      setChannels(loadedChannels);
      updateChannelsRef(loadedChannels);
      // Only set loading to false if we have both chats and channels, or if chats are already loaded
      if (chats.length > 0 || loadedChannels.length > 0) {
        setLoading(false);
      }
    },
    // Real-time updates
    onChatsUpdate: (updatedChats) => {
      console.log('Real-time: Updating chats list', updatedChats.length);
      setChats(updatedChats);
    },
    onChannelsUpdate: (updatedChannels) => {
      console.log('Real-time: Updating channels list', updatedChannels.length);
      setChannels(updatedChannels);
    },
    onChatCreated: (newChat) => {
      console.log('Real-time: New chat created', newChat);
      setChats(prev => {
        // Check if chat already exists
        if (prev.some(chat => chat.id === newChat.id)) {
          return prev;
        }
        return [...prev, newChat];
      });
    },
    onChatUpdated: (updatedChat) => {
      console.log('Real-time: Chat updated', updatedChat);
      setChats(prev => {
        const updated = prev.map(chat =>
          chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
        );
        // If unread count is 0 or undefined, ensure it's set to 0
        return updated.map(chat => 
          chat.id === updatedChat.id && updatedChat.unreadCount === 0
            ? { ...chat, unreadCount: 0 }
            : chat
        );
      });
    },
    onChannelCreated: (newChannel) => {
      console.log('Real-time: New channel created', newChannel);
      setChannels(prev => {
        // Check if channel already exists
        if (prev.some(channel => channel.id === newChannel.id && channel.teamId === newChannel.teamId)) {
          return prev;
        }
        return [...prev, newChannel];
      });
    },
    onChannelUpdated: (updatedChannel) => {
      console.log('Real-time: Channel updated', updatedChannel);
      setChannels(prev => prev.map(channel =>
        channel.id === updatedChannel.id && channel.teamId === updatedChannel.teamId
          ? { ...channel, ...updatedChannel }
          : channel
      ));
    },
  });

  // Fallback: Fetch chats and channels via API if WebSocket doesn't load data within 5 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    // Set a timeout to fetch via API if WebSocket doesn't provide data
    fallbackTimeout = setTimeout(async () => {
      // Only fetch if we still don't have data
      if (isMounted && (chats.length === 0 || channels.length === 0)) {
        console.log('WebSocket timeout: Fetching data via API as fallback');
        
        try {
          const accessToken = await getAccessToken();
          if (!accessToken || !isMounted) return;

          // Fetch chats if not loaded
          if (chats.length === 0) {
            try {
              const chatsResponse = await fetch('/api/chats', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                credentials: 'include',
              });

              if (chatsResponse.ok) {
                const chatsData = await chatsResponse.json();
                if (chatsData.success && chatsData.data && isMounted) {
                  setChats(chatsData.data);
                  updateChatsRef(chatsData.data);
                }
              }
            } catch (err) {
              console.error('Fallback: Error fetching chats:', err);
            }
          }

          // Fetch channels if not loaded
          if (channels.length === 0) {
            try {
              const channelsResponse = await fetch('/api/channels', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                credentials: 'include',
              });

              if (channelsResponse.ok) {
                const channelsData = await channelsResponse.json();
                if (channelsData.success && channelsData.data && isMounted) {
                  setChannels(channelsData.data);
                  updateChannelsRef(channelsData.data);
                }
              }
            } catch (err) {
              console.error('Fallback: Error fetching channels:', err);
            }
          }

          if (isMounted) {
            setLoading(false);
          }
        } catch (err) {
          console.error('Fallback: Error in fetchData:', err);
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    }, 5000); // Wait 5 seconds for WebSocket to load data

    return () => {
      isMounted = false;
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, [isAuthenticated, getAccessToken, chats.length, channels.length, updateChatsRef, updateChannelsRef]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'from-purple-400 to-indigo-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-pink-400 to-rose-500',
      'from-red-400 to-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.topic) return chat.topic;
    
    if (chat.chatType === 'oneOnOne' && chat.members && chat.members.length > 0) {
      return chat.members[0]?.displayName || 'Unknown User';
    }

    if (chat.members && chat.members.length > 0) {
      const memberNames = chat.members.map(m => m.displayName).filter(Boolean);
      if (memberNames.length > 0) {
        return memberNames.join(', ');
      }
    }

    return 'Chat';
  };

  // Filter chats based on search query
  const filterChats = (chatList: Chat[]) => {
    if (!searchQuery) return chatList;
    const searchLower = searchQuery.toLowerCase();
    return chatList.filter(chat => {
      const displayName = getChatDisplayName(chat).toLowerCase();
      return displayName.includes(searchLower) ||
        chat.lastMessage?.toLowerCase().includes(searchLower);
    });
  };

  // Get unread chats (only show chats with unreadCount > 0)
  const unreadChats = chats.filter(chat => 
    chat.unreadCount !== undefined && chat.unreadCount !== null && chat.unreadCount > 0
  );

  // Get favourites (user's own chat or starred chats)
  const favourites = chats.filter(chat => {
    // For now, show user's own chat if available
    // In a real implementation, you'd check for starred/favourited chats
    return chat.chatType === 'oneOnOne' && chat.members && chat.members.some(m => 
      m.userId === user?.homeAccountId || m.displayName === user?.name
    );
  });

  // All chats will be displayed in Chats section
  // No filtering needed - show all chats


  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Chat</h2>
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Access Items */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <Sparkles className="w-4 h-4 text-gray-500" />
            <span>Copilot</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <AtSign className="w-4 h-4 text-gray-500" />
            <span>Mentions</span>
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span>Followed threads</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-red-600 font-medium">Error loading data</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {/* Favourites Section */}
            {favourites.length > 0 && (
              <div>
                <button
                  onClick={() => setIsFavouritesExpanded(!isFavouritesExpanded)}
                  className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {isFavouritesExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>Favourites</span>
                </button>
                {isFavouritesExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {filterChats(favourites).length === 0 ? (
                      <div className="px-2 py-4 text-center">
                        <p className="text-xs text-gray-500">No favourites found</p>
                      </div>
                    ) : (
                      filterChats(favourites).map((chat) => {
                        const displayName = getChatDisplayName(chat);
                        const initials = getInitials(displayName);
                        return (
                          <button
                            key={chat.id}
                            onClick={() => onChatSelect(chat.id)}
                            className={`
                              w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors
                              ${selectedChatId === chat.id ? 'bg-gray-100' : ''}
                            `}
                          >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(chat.id)} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                              {initials}
                            </div>
                            <span className="text-sm text-gray-900 truncate flex-1 text-left">
                              {displayName} {user?.name && `(${user.name})`}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Unread Section */}
            {unreadChats.length > 0 && (
              <div>
                <button
                  onClick={() => setIsUnreadExpanded(!isUnreadExpanded)}
                  className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {isUnreadExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <Circle className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                  <span>Unread</span>
                  {unreadChats.length > 0 && (
                    <span className="ml-auto text-xs text-gray-500">({unreadChats.length})</span>
                  )}
                </button>
                {isUnreadExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {filterChats(unreadChats).length === 0 ? (
                      <div className="px-2 py-4 text-center">
                        <p className="text-xs text-gray-500">No unread chats found</p>
                      </div>
                    ) : (
                      filterChats(unreadChats).map((chat) => {
                        const isSelected = chat.id === selectedChatId;
                        const displayName = getChatDisplayName(chat);
                        const initials = getInitials(displayName);
                        
                        return (
                          <button
                            key={chat.id}
                            onClick={() => onChatSelect(chat.id)}
                            className={`
                              w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors
                              ${isSelected ? 'bg-gray-100' : ''}
                            `}
                          >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(chat.id)} flex items-center justify-center text-white text-xs font-medium flex-shrink-0 relative`}>
                              {initials}
                              {chat.unreadCount && chat.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-[10px] text-white font-bold">{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-sm text-gray-900 truncate">{displayName}</div>
                              {chat.lastMessage && (
                                <div className="text-xs text-gray-500 truncate">{chat.lastMessage}</div>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Channels Section */}
            <div>
              <button
                onClick={() => setIsChannelsExpanded(!isChannelsExpanded)}
                className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {isChannelsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <Hash className="w-3.5 h-3.5 text-gray-500" />
                <span>Channels</span>
                {channels.length > 0 && (
                  <span className="ml-auto text-xs text-gray-500">({channels.length})</span>
                )}
              </button>
              {isChannelsExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {channels.length === 0 ? (
                    <div className="px-2 py-4 text-center">
                      <p className="text-xs text-gray-500">No channels found</p>
                      <p className="text-xs text-gray-400 mt-1">Make sure you're a member of Teams with channels</p>
                    </div>
                  ) : (
                    channels
                      .filter(channel => {
                        // Ensure channel has required properties
                        if (!channel || !channel.id) return false;
                        
                        // Filter channels based on search query
                        if (!searchQuery) return true;
                        const searchLower = searchQuery.toLowerCase();
                        return (
                          (channel.displayName || '').toLowerCase().includes(searchLower) ||
                          (channel.teamName || '').toLowerCase().includes(searchLower) ||
                          (channel.description || '').toLowerCase().includes(searchLower)
                        );
                      })
                      .map((channel) => {
                        // Ensure channel has required properties
                        if (!channel || !channel.id) {
                          console.warn('Invalid channel data:', channel);
                          return null;
                        }
                        
                        const displayName = channel.displayName || channel.name || 'Unnamed Channel';
                        const initials = getInitials(displayName);
                        const channelId = `channel-${channel.teamId || 'unknown'}-${channel.id}`;
                        const isSelected = selectedChatId === channelId;
                        
                        return (
                          <button
                            key={channelId}
                            onClick={() => onChatSelect(channelId)}
                            className={`
                              w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors
                              ${isSelected ? 'bg-gray-100' : ''}
                            `}
                            title={channel.teamName ? `${displayName} (${channel.teamName})` : displayName}
                          >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(channel.id)} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-sm text-gray-900 truncate">{displayName}</div>
                              {channel.teamName && (
                                <div className="text-xs text-gray-500 truncate">{channel.teamName}</div>
                              )}
                            </div>
                          </button>
                        );
                      })
                      .filter(Boolean) // Remove any null entries
                  )}
                </div>
              )}
            </div>

            {/* Chats Section */}
            <div>
              <button
                onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                className="w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {isChatsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                <span>Chats</span>
                {chats.length > 0 && (
                  <span className="ml-auto text-xs text-gray-500">({chats.length})</span>
                )}
              </button>
              {isChatsExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {filterChats(chats).length === 0 ? (
                    <div className="px-2 py-4 text-center">
                      <p className="text-xs text-gray-500">No chats found</p>
                      {chats.length === 0 && (
                        <p className="text-xs text-gray-400 mt-1">Loading chats...</p>
                      )}
                    </div>
                  ) : (
                    filterChats(chats).map((chat) => {
                      const isSelected = chat.id === selectedChatId;
                      const displayName = getChatDisplayName(chat);
                      const initials = getInitials(displayName);
                      
                      return (
                        <button
                          key={chat.id}
                          onClick={() => onChatSelect(chat.id)}
                          className={`
                            w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors
                            ${isSelected ? 'bg-gray-100' : ''}
                          `}
                        >
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(chat.id)} flex items-center justify-center text-white text-xs font-medium flex-shrink-0 relative`}>
                            {initials}
                            {chat.unreadCount && chat.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm text-gray-900 truncate">{displayName}</div>
                            {chat.lastMessage && (
                              <div className="text-xs text-gray-500 truncate">{chat.lastMessage}</div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
