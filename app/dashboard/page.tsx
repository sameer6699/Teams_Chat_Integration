'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { TeamsNavRail } from '@/components/TeamsNavRail';
import { TeamsChannelList } from '@/components/TeamsChannelList';
import { TeamsHeader } from '@/components/TeamsHeader';
import { TeamsChatArea } from '@/components/TeamsChatArea';
import { useAuth } from '@/lib/authContext';
import { Message } from '@/lib/types';

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

  // Fetch messages when a chat is selected
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
            const transformedMessages: Message[] = data.data.map((msg: any) => {
              // Extract sender information from various possible structures
              let senderInfo = null;
              if (msg.sender) {
                senderInfo = {
                  id: msg.sender.id || msg.senderId || msg.sender.userId || '',
                  name: msg.sender.displayName || msg.sender.name || msg.sender.givenName || 'Unknown',
                  email: msg.sender.email || msg.sender.userPrincipalName || msg.sender.mail || '',
                };
              } else if (msg.from?.user) {
                senderInfo = {
                  id: msg.from.user.id || '',
                  name: msg.from.user.displayName || msg.from.user.givenName || 'Unknown',
                  email: msg.from.user.userPrincipalName || msg.from.user.mail || '',
                };
              }
              
              return {
                id: msg.id,
                text: msg.text || msg.body?.content || msg.content || '',
                timestamp: msg.timestamp || msg.createdDateTime || new Date().toISOString(),
                isSender: msg.isSender || false,
                sender: senderInfo,
              };
            });
            
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

    // Set up polling interval: 20 seconds to prevent excessive API calls
    intervalId = setInterval(() => {
      if (selectedChatId && isAuthenticated && isMounted) {
        fetchMessages();
      }
    }, 20000); // 20 seconds interval
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [selectedChatId, isAuthenticated, getAccessToken]);

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
        <div className="flex-1 flex flex-col bg-white">
          {/* Teams-style Header */}
          <TeamsHeader
            channelName={getChatDisplayName(selectedChat)}
            membersCount={getMembersCount(selectedChat)}
          />

          {/* Teams-style Chat Area */}
          <TeamsChatArea
            messages={messages}
            chatId={selectedChatId || undefined}
            loading={loadingMessages}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
