/**
 * Chat Hook
 * React hook for chat operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatApiService } from '../services/ChatApi.service';
import { IChat } from '@/backend/models/Chat.model';
import { IMessage } from '@/backend/models/Message.model';

export interface UseChatReturn {
  chats: IChat[];
  messages: IMessage[];
  selectedChat: IChat | null;
  loading: boolean;
  error: string | null;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  refreshChats: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all chats
   */
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatApiService.getAllChats();
      
      if (response.success && response.data) {
        setChats(response.data);
      } else {
        setError(response.message || 'Failed to load chats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load messages for a chat
   */
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatApiService.getChatMessages(chatId);
      
      if (response.success && response.data) {
        setMessages(response.data);
      } else {
        setError(response.message || 'Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a chat and load its messages
   */
  const selectChat = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find chat in current list or load it
      let chat = chats.find(c => c.id === chatId);
      if (!chat) {
        const response = await chatApiService.getChatById(chatId);
        if (response.success && response.data) {
          chat = response.data;
        }
      }
      
      if (chat) {
        setSelectedChat(chat);
        await loadMessages(chatId);
      } else {
        setError('Chat not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select chat');
    } finally {
      setLoading(false);
    }
  }, [chats, loadMessages]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (chatId: string, message: string) => {
    try {
      setError(null);
      const response = await chatApiService.sendMessage(chatId, message);
      
      if (response.success && response.data) {
        // Add message to local state
        setMessages(prev => [...prev, response.data!]);
        
        // Update chat's last message
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, lastMessage: message, lastMessageTime: response.data!.timestamp }
            : chat
        ));
      } else {
        setError(response.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, []);

  /**
   * Refresh chats
   */
  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    messages,
    selectedChat,
    loading,
    error,
    loadChats,
    loadMessages,
    selectChat,
    sendMessage,
    refreshChats,
  };
}

