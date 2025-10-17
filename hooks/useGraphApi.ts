'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { GraphApiClient, GraphUser, GraphChat, GraphTeam } from '@/lib/graphApi';

export const useGraphApi = () => {
  const { getAccessToken, isAuthenticated } = useAuth();
  const [user, setUser] = useState<GraphUser | null>(null);
  const [chats, setChats] = useState<GraphChat[]>([]);
  const [teams, setTeams] = useState<GraphTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const client = new GraphApiClient(token);
      const userData = await client.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const client = new GraphApiClient(token);
      const chatsData = await client.getChats();
      setChats(chatsData.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const client = new GraphApiClient(token);
      const teamsData = await client.getTeams();
      setTeams(teamsData.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (chatId: string, message: string) => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const client = new GraphApiClient(token);
      return await client.sendChatMessage(chatId, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
      fetchChats();
      fetchTeams();
    }
  }, [isAuthenticated]);

  return {
    user,
    chats,
    teams,
    loading,
    error,
    fetchUserData,
    fetchChats,
    fetchTeams,
    sendMessage,
  };
};
