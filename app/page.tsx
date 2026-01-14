'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '../components/AuthGuard';
import { TeamsNavRail } from '../components/TeamsNavRail';
import { TeamsChannelList } from '../components/TeamsChannelList';
import { TeamsHeader } from '../components/TeamsHeader';
import { TeamsChatArea } from '../components/TeamsChatArea';
import { useAuth } from '../lib/authContext';
import { Message } from '../lib/types';
import { processMessage, isSystemMessage } from '../lib/messageUtils';
import { useWebSocket } from '../hooks/useWebSocket';

interface Chat {
  id: string;
  topic?: string;
  chatType: 'oneOnOne' | 'group' | 'meeting';
  members?: Array<{
    id: string;
    displayName: string;
    userId: string;
  }>;
  channelData?: any; // Store channel data if it's a channel
}

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { isAuthenticated, getAccessToken } = useAuth();

  // Function to mark chat as read
  const markChatAsRead = async (chatId: string, accessToken: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log(`Chat ${chatId} marked as read`);
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  };

  // Fetch chat or channel details when selected
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!selectedChatId || !isAuthenticated) {
        setSelectedChat(null);
        return;
      }

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

        // Check if it's a channel (format: channel-{teamId}-{channelId})
        if (selectedChatId.startsWith('channel-')) {
          // Extract channel ID from the format: channel-{teamId}-{channelId}
          // The format is: channel-{teamId}-{channelId}
          // We need to find the last occurrence of the pattern
          const match = selectedChatId.match(/^channel-(.+?)-(.+)$/);
          
          if (match) {
            const teamId = match[1];
            const channelId = match[2];
            
            // Fetch channels to find the selected channel
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
              if (channelsData.success && channelsData.data) {
                // Find the channel that matches - check both by ID and by constructed ID
                const channel = channelsData.data.find((ch: any) => {
                  const constructedId = `channel-${ch.teamId || 'unknown'}-${ch.id}`;
                  return ch.id === channelId || constructedId === selectedChatId;
                });
                
                if (channel) {
                  // Convert channel to Chat-like format for display
                  setSelectedChat({
                    id: selectedChatId,
                    topic: channel.displayName || channel.name || 'Unnamed Channel',
                    chatType: 'group' as const,
                    members: [], // Channels don't have members in the same way
                    channelData: channel, // Store original channel data
                  });
                  console.log('Channel selected:', channel.displayName, 'Initials:', getInitials(channel.displayName || channel.name || ''));
                } else {
                  console.warn('Channel not found:', channelId, 'in channels list');
                }
              }
            }
          }
        } else {
          // Regular chat - fetch chat details
          const response = await fetch(`/api/chats/${selectedChatId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setSelectedChat(data.data);
              
              // Automatically mark chat as read when selected (even if not displayed)
              // This happens in background
              markChatAsRead(selectedChatId, accessToken).catch(err => {
                console.error('Error auto-marking chat as read on selection:', err);
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching chat/channel details:', error);
      }
    };

    fetchChatDetails();
  }, [selectedChatId, isAuthenticated, getAccessToken]);

  // WebSocket connection for real-time messages
  const { isConnected: wsConnected, messages: wsMessages } = useWebSocket({
    chatId: selectedChatId,
    enabled: isAuthenticated && !!selectedChatId,
    onMessage: async (newMessage) => {
      console.log('Real-time: New message received via WebSocket', newMessage);
      
      // Add new message from WebSocket
      setMessages(prev => {
        // Check if message already exists
        if (prev.some(msg => msg.id === newMessage.id)) {
          console.log('Message already exists, skipping:', newMessage.id);
          return prev; // Message already exists
        }
        console.log('Adding new message to state:', newMessage.id);
        return [...prev, newMessage];
      });

      // Automatically mark chat as read when new message arrives (if chat is selected)
      // This happens in background - chat doesn't need to be displayed
      if (selectedChatId && !newMessage.isSender) {
        // Only mark as read if message is not from current user
        try {
          const accessToken = await getAccessToken();
          if (accessToken) {
            await markChatAsRead(selectedChatId, accessToken);
          }
        } catch (error) {
          console.error('Error auto-marking chat as read:', error);
        }
      }
    },
  });

  // Fetch messages when a chat is selected (initial load + fallback if WebSocket fails)
  useEffect(() => {
    // Don't set up polling if chat is not selected or user is not authenticated
    if (!selectedChatId || !isAuthenticated) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchMessages = async () => {
      if (!isMounted || !selectedChatId || !isAuthenticated) {
        return;
      }

      try {
        setLoadingMessages(true);
        const accessToken = await getAccessToken();
        if (!accessToken || !isMounted) {
          return;
        }

        const response = await fetch(`/api/chats/${selectedChatId}/messages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          if (!isMounted) return;

          if (data.success && data.data) {
            // Transform API messages to component Message format
            // Filter out system messages and clean HTML
            const transformedMessages: Message[] = data.data
              .map((msg: any) => {
                // Check if system message first
                if (isSystemMessage(msg)) {
                  return null; // Filter out system messages
                }
                
                // Process and clean message
                const processedMsg = processMessage(msg);
                if (!processedMsg) {
                  return null; // Filter out if processing failed
                }

                // Extract sender information from various possible structures
                let senderInfo = null;
                if (processedMsg.sender) {
                  senderInfo = {
                    id: processedMsg.sender.id || processedMsg.senderId || processedMsg.sender.userId || '',
                    name: processedMsg.sender.displayName || processedMsg.sender.name || processedMsg.sender.givenName || 'Unknown',
                    email: processedMsg.sender.email || processedMsg.sender.userPrincipalName || processedMsg.sender.mail || '',
                  };
                } else if (processedMsg.from?.user) {
                  senderInfo = {
                    id: processedMsg.from.user.id || '',
                    name: processedMsg.from.user.displayName || processedMsg.from.user.givenName || 'Unknown',
                    email: processedMsg.from.user.userPrincipalName || processedMsg.from.user.mail || '',
                  };
                }
                
                // If no sender info, it's likely a system message - filter it out
                if (!senderInfo) {
                  return null;
                }
                
                return {
                  id: processedMsg.id,
                  text: processedMsg.text, // Already cleaned by processMessage
                  timestamp: processedMsg.timestamp || processedMsg.createdDateTime || new Date().toISOString(),
                  isSender: processedMsg.isSender || false,
                  sender: senderInfo,
                };
              })
              .filter((msg: Message | null): msg is Message => msg !== null); // Remove null entries
            
            if (isMounted) {
              setMessages(transformedMessages);
              
              // Automatically mark chat as read when messages are loaded
              // This happens in the background, chat doesn't need to be displayed
              if (selectedChatId && transformedMessages.length > 0) {
                markChatAsRead(selectedChatId, accessToken).catch(err => {
                  console.error('Error marking chat as read:', err);
                });
              }
            }
          }
        } else {
          if (isMounted) {
            setMessages([]);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    // Initial fetch
    fetchMessages();

    // Set up polling interval as fallback if WebSocket is not connected
    // Poll less frequently if WebSocket is connected (60 seconds vs 20 seconds)
    const pollInterval = wsConnected ? 60000 : 20000;
    
    intervalId = setInterval(() => {
      // Only poll if WebSocket is not connected or as backup
      if (selectedChatId && isAuthenticated && isMounted) {
        if (!wsConnected) {
          // WebSocket not connected, use polling
          fetchMessages();
        } else {
          // WebSocket connected, but do a periodic sync every 60 seconds
          fetchMessages();
        }
      }
    }, pollInterval);
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [selectedChatId, isAuthenticated, getAccessToken, wsConnected]);

  const getChatDisplayName = (chat: Chat | null): string => {
    if (!chat) {
      // If no chat but selectedChatId exists, try to get from channels
      if (selectedChatId && selectedChatId.startsWith('channel-')) {
        return 'Loading...';
      }
      return 'Select a chat';
    }
    
    // If it's a channel, use channel display name
    if (chat.channelData) {
      return chat.channelData.displayName || chat.channelData.name || chat.topic || 'Unnamed Channel';
    }
    
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

  const getMembersCount = (chat: Chat | null): number => {
    if (!chat || !chat.members) return 0;
    return chat.members.length;
  };

  // Helper function to get initials from a name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first 2 characters
      return name.substring(0, 2).toUpperCase();
    }
    // Multiple words - take first letter of first two words
    return (words[0][0] + (words[1]?.[0] || '')).toUpperCase();
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">
        {/* Teams-style Navigation Rail */}
        <TeamsNavRail />

        {/* Teams-style Chat List */}
        <TeamsChannelList
          selectedChatId={selectedChatId || undefined}
          onChatSelect={setSelectedChatId}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Teams-style Header - Fixed at top */}
          <div className="flex-shrink-0">
            <TeamsHeader
              channelName={getChatDisplayName(selectedChat)}
              membersCount={getMembersCount(selectedChat)}
            />
          </div>

          {/* Teams-style Chat Area - Scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <TeamsChatArea
              messages={messages}
              chatId={selectedChatId || undefined}
              loading={loadingMessages}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
