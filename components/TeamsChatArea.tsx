'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, AtSign, Bold, Italic, Underline, MoreHorizontal, Loader2 } from 'lucide-react';
import { Message } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import { wsClient } from '@/lib/websocket';

interface TeamsChatAreaProps {
  messages: Message[];
  chatId?: string;
  loading?: boolean;
}

export function TeamsChatArea({ messages, chatId, loading = false }: TeamsChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getAccessToken } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || sending) return;

    try {
      setSending(true);
      const accessToken = await getAccessToken();
      if (!accessToken) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        
        // Also send via WebSocket if connected (for real-time delivery)
        if (wsClient.isConnected()) {
          wsClient.send('send_message', {
            chatId: chatId,
            message: newMessage.trim(),
          });
        }
        
        // Messages will be refreshed by the parent component or WebSocket
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', errorData);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    const index = parseInt(id, 10) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages - Grouped by date, sender and time */}
            {(() => {
              // Group messages by date
              const groupedMessages: { [key: string]: typeof messages } = {};
              messages.forEach((msg) => {
                const date = new Date(msg.timestamp);
                const dateKey = date.toDateString();
                if (!groupedMessages[dateKey]) {
                  groupedMessages[dateKey] = [];
                }
                groupedMessages[dateKey].push(msg);
              });

              // Format date label
              const formatDateLabel = (dateString: string) => {
                const date = new Date(dateString);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (date.toDateString() === today.toDateString()) {
                  return 'Today';
                } else if (date.toDateString() === yesterday.toDateString()) {
                  return 'Yesterday';
                } else {
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                }
              };

              return Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                <div key={dateKey}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {formatDateLabel(dateKey)}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Messages for this date */}
                  {dateMessages.map((message, index) => {
              const sender = message.sender;
              const senderName = sender?.name || 'Unknown';
              const senderId = sender?.id || message.id;
              
              // Get initials for avatar
              const getInitials = (name: string) => {
                if (!name) return '??';
                const words = name.trim().split(' ');
                if (words.length >= 2) {
                  return (words[0][0] + words[1][0]).toUpperCase();
                }
                return name.substring(0, 2).toUpperCase();
              };
              const initials = getInitials(senderName);
              
              // Check if this message should show avatar (new sender or time gap)
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const showAvatar = !message.isSender && (
                !prevMessage || 
                prevMessage.isSender || 
                prevMessage.sender?.id !== senderId ||
                new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000 // 5 minutes
              );
              
              // Format timestamp
              const formatTimestamp = (timestamp: string) => {
                try {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  
                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  
                  return date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  });
                } catch {
                  return timestamp;
                }
              };

              return (
                <div key={message.id} className="flex gap-3 group hover:bg-gray-50 -mx-4 px-4 py-1 rounded transition-colors">
                  {/* Avatar - only show for non-sender messages and when needed */}
                  {showAvatar ? (
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(senderId)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                      {initials}
                    </div>
                  ) : (
                    <div className="w-8 flex-shrink-0" />
                  )}

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {senderName}
                        </span>
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    )}
                    {!showAvatar && !message.isSender && (
                      <div className="mb-1">
                        <span className="text-xs text-gray-500 ml-0">{formatTimestamp(message.timestamp)}</span>
                      </div>
                    )}
                    {message.isSender && (
                      <div className="flex items-baseline gap-2 mb-1 justify-end">
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                        <span className="font-semibold text-sm text-gray-900">You</span>
                      </div>
                    )}
                    <div className={`text-sm text-gray-800 leading-relaxed ${message.isSender ? 'text-right' : ''}`}>
                      {message.text}
                    </div>

                    {/* Message Actions (visible on hover) */}
                    <div className={`flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${message.isSender ? 'justify-end' : ''}`}>
                      <button className="text-xs text-indigo-600 hover:underline">Reply</button>
                      <span className="text-xs text-gray-300">•</span>
                      <button className="text-xs text-gray-500 hover:text-gray-700">React</button>
                    </div>
                  </div>

                  {/* More Options */}
                  {!message.isSender && (
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all">
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  {message.isSender && <div className="w-8 flex-shrink-0" />}
                </div>
              );
            })}
                </div>
              ));
            })()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Compose Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Bold">
              <Bold className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Italic">
              <Italic className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Underline">
              <Underline className="w-4 h-4 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Attach file">
              <Paperclip className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Mention">
              <AtSign className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Emoji">
              <Smile className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex items-end gap-2 p-3 bg-white">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none min-h-[40px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || !chatId}
              className={`
                p-2 rounded transition-colors flex-shrink-0
                ${newMessage.trim() && !sending && chatId
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
              title="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

