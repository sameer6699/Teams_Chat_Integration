'use client';

import { Search, Plus, ChevronDown, ChevronRight, MoreVertical, Loader2, AlertCircle, Sparkles, AtSign, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';

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

interface TeamsChannelListProps {
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
}

export function TeamsChannelList({
  selectedChatId,
  onChatSelect,
}: TeamsChannelListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'unread' | 'channels' | 'chats'>('chats');
  const [isFavouritesExpanded, setIsFavouritesExpanded] = useState(true);
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  const { isAuthenticated, getAccessToken, user } = useAuth();

  // Fetch chats and teams from Microsoft Graph API
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error('No access token available');
        }

        // Fetch chats
        const chatsResponse = await fetch('/api/chats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (!chatsResponse.ok) {
          const errorData = await chatsResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || `Failed to fetch chats: ${chatsResponse.status}`);
        }

        const chatsData = await chatsResponse.json();
        if (chatsData.success && chatsData.data) {
          setChats(chatsData.data);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, getAccessToken]);

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

  // Filter chats based on selected tab
  const filteredChats = chats.filter(chat => {
    const displayName = getChatDisplayName(chat).toLowerCase();
    const matchesSearch = displayName.includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === 'unread') {
      return matchesSearch && (chat.unreadCount && chat.unreadCount > 0);
    } else if (filterTab === 'channels') {
      return matchesSearch && (chat.chatType === 'group' || chat.chatType === 'meeting');
    } else if (filterTab === 'chats') {
      return matchesSearch && chat.chatType === 'oneOnOne';
    }
    return matchesSearch;
  });

  // Get favourites (user's own chat or starred chats)
  const favourites = chats.filter(chat => {
    // For now, show user's own chat if available
    // In a real implementation, you'd check for starred/favourited chats
    return chat.chatType === 'oneOnOne' && chat.members && chat.members.some(m => 
      m.userId === user?.homeAccountId || m.displayName === user?.name
    );
  });


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

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-2">
          {(['unread', 'channels', 'chats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`
                flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${filterTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
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
                    {favourites.map((chat) => {
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
                    })}
                  </div>
                )}
              </div>
            )}

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
                <span>Chats</span>
              </button>
              {isChatsExpanded && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {filteredChats.length === 0 ? (
                    <div className="px-2 py-4 text-center">
                      <p className="text-xs text-gray-500">No chats found</p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => {
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
