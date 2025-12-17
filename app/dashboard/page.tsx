'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { TeamsNavRail } from '@/components/TeamsNavRail';
import { TeamsChannelList } from '@/components/TeamsChannelList';
import { TeamsHeader } from '@/components/TeamsHeader';
import { TeamsChatArea } from '@/components/TeamsChatArea';
import { useAuth } from '@/lib/authContext';
import { Message } from '@/lib/types';
import { processMessage, isSystemMessage } from '@/lib/messageUtils';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Chat {
  id: string;
  topic?: string;
  chatType: 'oneOnOne' | 'group' | 'meeting';
  members?: Array<{
    id: string;
    displayName: string;
    userId: string;
  }>;
}

export default function DashboardPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { isAuthenticated, getAccessToken } = useAuth();

  // Fetch chat details when a chat is selected
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!selectedChatId || !isAuthenticated) {
        setSelectedChat(null);
        return;
      }

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;

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
          }
        }
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    };

    fetchChatDetails();
  }, [selectedChatId, isAuthenticated, getAccessToken]);

  // WebSocket connection for real-time messages
  const { isConnected: wsConnected, messages: wsMessages } = useWebSocket({
    chatId: selectedChatId,
    enabled: isAuthenticated && !!selectedChatId,
    onMessage: (newMessage) => {
      // Add new message from WebSocket
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev; // Message already exists
        }
        return [...prev, newMessage];
      });
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
    if (!chat) return 'Select a chat';
    
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
