/**
 * User Hook
 * React hook for user operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { userApiService } from '../services/UserApi.service';
import { IUser } from '@/backend/models/User.model';

export interface UseUserReturn {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  loadUser: () => Promise<void>;
  updateStatus: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load current user
   */
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApiService.getCurrentUser();
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.message || 'Failed to load user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user status
   */
  const updateStatus = useCallback(async (status: 'online' | 'away' | 'busy' | 'offline') => {
    try {
      setError(null);
      const response = await userApiService.updateUserStatus(status);
      
      if (response.success && user) {
        setUser({ ...user, status });
      } else {
        setError(response.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  }, [user]);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    loadUser,
    updateStatus,
  };
}

