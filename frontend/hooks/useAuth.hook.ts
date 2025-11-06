/**
 * Authentication Hook
 * React hook for authentication state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApiService } from '../services/AuthApi.service';
import { AuthStatus } from '../services/AuthApi.service';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthStatus: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh authentication status
   */
  const refreshAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApiService.getAuthStatus();
      
      if (response.success && response.data) {
        setIsAuthenticated(response.data.isAuthenticated);
      } else {
        setIsAuthenticated(false);
        setError(response.message || 'Failed to get auth status');
      }
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login
   */
  const login = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApiService.login();
      
      if (!response.success) {
        setError(response.message || 'Login failed');
      }
      // Note: Login redirects, so we don't update state here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApiService.logout();
      
      if (response.success) {
        setIsAuthenticated(false);
      } else {
        setError(response.message || 'Logout failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load auth status on mount
  useEffect(() => {
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refreshAuthStatus,
  };
}

