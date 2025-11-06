'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { loginRequest, graphConfig } from './msalConfig';
import { getMsalInstance, initializeMsal } from './msalInstance';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [msalInstance] = useState(() => getMsalInstance());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('MSAL initialization timeout');
          setLoading(false);
        }, 10000); // 10 second timeout

        await initializeMsal();
        
        // Handle redirect promise first
        const response = await msalInstance.handleRedirectPromise();
        
        if (response && response.account) {
          setUser(response.account);
          setIsAuthenticated(true);
        } else {
          // Check for existing accounts
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setUser(accounts[0]);
            setIsAuthenticated(true);
          }
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [msalInstance]);

  const login = async () => {
    try {
      setLoading(true);
      // Use redirect instead of popup for better UX
      await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await msalInstance.logoutRedirect({
        postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000',
      });
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      if (!user) return null;

      const request = {
        ...loginRequest,
        account: user,
      };

      const response = await msalInstance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      console.error('Failed to acquire token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    getAccessToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
