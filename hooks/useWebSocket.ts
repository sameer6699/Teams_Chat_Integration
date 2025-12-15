/**
 * React Hook for WebSocket Connection
 * Manages WebSocket connection lifecycle and message handling
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { wsClient, WebSocketStatus, WebSocketMessage } from '@/lib/websocket';
import { useAuth } from '@/lib/authContext';
import { Message } from '@/lib/types';
import { isSystemMessage, processMessage } from '@/lib/messageUtils';

interface UseWebSocketOptions {
  chatId?: string | null;
  enabled?: boolean;
  onMessage?: (message: Message) => void;
  onMessageSent?: (message: Message) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { chatId, enabled = true, onMessage, onMessageSent, onTyping } = options;
  const { getAccessToken, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);
  const accessTokenRef = useRef<string | null>(null);
  const chatIdRef = useRef<string | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!enabled || !isAuthenticated || !chatId) {
      wsClient.disconnect();
      return;
    }

    const connect = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          accessTokenRef.current = token;
          chatIdRef.current = chatId;
          wsClient.connect(token, chatId);
        }
      } catch (error) {
        console.error('Error getting access token for WebSocket:', error);
      }
    };

    connect();

    return () => {
      wsClient.disconnect();
    };
  }, [enabled, isAuthenticated, chatId, getAccessToken]);

  // Update connection when chatId changes
  useEffect(() => {
    if (chatId && chatId !== chatIdRef.current && wsClient.isConnected()) {
      wsClient.switchChat(chatId);
      chatIdRef.current = chatId;
    }
  }, [chatId]);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = wsClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = wsClient.on('message', (data: WebSocketMessage) => {
      if (data.message && data.chatId === chatId) {
        // Process and filter system messages
        if (isSystemMessage(data.message)) {
          return; // Skip system messages
        }

        const processedMsg = processMessage(data.message);
        if (!processedMsg) {
          return; // Skip if processing failed
        }

        // Extract sender information
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

        if (!senderInfo) {
          return; // Skip messages without sender
        }

        const newMessage: Message = {
          id: processedMsg.id,
          text: processedMsg.text,
          timestamp: processedMsg.timestamp || processedMsg.createdDateTime || new Date().toISOString(),
          isSender: processedMsg.isSender || false,
          sender: senderInfo,
        };

        setMessages(prev => {
          // Check if message already exists
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Call custom callback if provided
        if (onMessage) {
          onMessage(newMessage);
        }
      }
    });

    return unsubscribe;
  }, [chatId, onMessage]);

  // Subscribe to message sent confirmation
  useEffect(() => {
    const unsubscribe = wsClient.on('message_sent', (data: WebSocketMessage) => {
      if (data.message && data.chatId === chatId && onMessageSent) {
        // Process message similar to above
        const processedMsg = processMessage(data.message);
        if (processedMsg) {
          // Extract sender info and create Message object
          // Similar to above...
          if (onMessageSent) {
            // onMessageSent(newMessage);
          }
        }
      }
    });

    return unsubscribe;
  }, [chatId, onMessageSent]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!onTyping) return;

    const unsubscribe = wsClient.on('typing', (data: { userId: string; isTyping: boolean; chatId?: string }) => {
      if (data.chatId === chatId) {
        onTyping(data.userId, data.isTyping);
      }
    });

    return unsubscribe;
  }, [chatId, onTyping]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    if (chatId && wsClient.isConnected()) {
      wsClient.send('typing', { chatId, isTyping });
    }
  }, [chatId]);

  return {
    status,
    isConnected: status === 'connected',
    messages,
    sendTyping,
  };
}

