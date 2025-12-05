'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { loginRequest, loginRequestWithConsent, graphConfig } from './msalConfig';
import { getMsalInstance, initializeMsal } from './msalInstance';
import { clearAllAuthData, forceReAuthentication } from './authUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  loginWithConsent: () => Promise<void>; // Force consent prompt
  logout: () => Promise<void>;
  clearCache: () => void; // Clear all auth cache
  reAuthenticate: () => Promise<void>; // Clear cache and force re-authentication
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

  const loginWithConsent = async () => {
    try {
      setLoading(true);
      // Force consent prompt - use this after admin consent is granted
      await msalInstance.loginRedirect(loginRequestWithConsent);
    } catch (error) {
      console.error('Login with consent failed:', error);
      setLoading(false);
    }
  };

  const clearCache = () => {
    try {
      clearAllAuthData();
      setUser(null);
      setIsAuthenticated(false);
      console.log('Auth cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const reAuthenticate = async () => {
    try {
      setLoading(true);
      await forceReAuthentication();
    } catch (error) {
      console.error('Re-authentication failed:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    let redirectAttempted = false;
    const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000/';
    
    try {
      setLoading(true);
      console.log('🔄 Starting logout process...');
      
      // Step 1: Clear MSAL cache and authentication data
      try {
        clearAllAuthData();
        console.log('✅ Authentication data cleared successfully');
      } catch (clearError) {
        console.error('⚠️ Error clearing auth data:', clearError);
        // Continue with logout even if clearing fails partially
        // Try to clear state manually as fallback
        try {
          if (msalInstance) {
            const accounts = msalInstance.getAllAccounts();
            accounts.forEach((account) => {
              try {
                msalInstance.removeAccount(account);
              } catch (removeError) {
                console.warn('⚠️ Failed to remove account:', removeError);
              }
            });
          }
        } catch (fallbackError) {
          console.error('⚠️ Fallback account removal failed:', fallbackError);
        }
      }
      
      // Step 2: Clear React state (always execute, even if previous step failed)
      try {
        setUser(null);
        setIsAuthenticated(false);
        console.log('✅ User state cleared');
      } catch (stateError) {
        console.error('⚠️ Error clearing React state:', stateError);
        // Force clear state
        setUser(null);
        setIsAuthenticated(false);
      }
      
      // Step 3: Reset loading state
      try {
        setLoading(false);
      } catch (loadingError) {
        console.error('⚠️ Error resetting loading state:', loadingError);
        // Force reset
        setLoading(false);
      }
      
      // Step 4: Small delay to ensure state is cleared before redirect
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (delayError) {
        console.warn('⚠️ Delay error (non-critical):', delayError);
      }
      
      // Step 5: Redirect to home page
      try {
        if (typeof window !== 'undefined' && window.location) {
          console.log('🔄 Redirecting to login screen...');
          window.location.replace(redirectUri);
          redirectAttempted = true;
        } else {
          throw new Error('Window object not available');
        }
      } catch (redirectError) {
        console.error('❌ Redirect failed:', redirectError);
        // Try alternative redirect method
        try {
          if (typeof window !== 'undefined') {
            window.location.href = redirectUri;
            redirectAttempted = true;
          }
        } catch (fallbackRedirectError) {
          console.error('❌ Fallback redirect also failed:', fallbackRedirectError);
          throw new Error('Unable to redirect after logout');
        }
      }
      
    } catch (error) {
      // Comprehensive error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { error };
      
      console.error('❌ Logout process encountered an error:', {
        error: errorDetails,
        timestamp: new Date().toISOString(),
        userWasAuthenticated: isAuthenticated,
        hasUser: !!user
      });
      
      // Always attempt to clear state, even on error
      try {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        console.log('✅ State cleared after error');
      } catch (stateClearError) {
        console.error('❌ Critical: Failed to clear state after error:', stateClearError);
      }
      
      // Always attempt redirect, even if logout had errors
      if (!redirectAttempted) {
        try {
          console.log('🔄 Attempting redirect after error...');
          if (typeof window !== 'undefined' && window.location) {
            window.location.replace(redirectUri);
            redirectAttempted = true;
          }
        } catch (finalRedirectError) {
          console.error('❌ Critical: Final redirect attempt failed:', finalRedirectError);
          // Last resort: try href redirect
          try {
            if (typeof window !== 'undefined') {
              window.location.href = redirectUri;
            }
          } catch (lastResortError) {
            console.error('❌ Critical: All redirect methods failed:', lastResortError);
            // At this point, we've done everything we can
            // The user may need to manually navigate
            throw new Error(`Logout completed but redirect failed: ${errorMessage}. Please navigate to ${redirectUri} manually.`);
          }
        }
      }
      
      // If we still couldn't redirect, throw to notify caller
      if (!redirectAttempted) {
        throw new Error(`Logout state cleared but redirect failed: ${errorMessage}`);
      }
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
    loginWithConsent,
    logout,
    clearCache,
    reAuthenticate,
    getAccessToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
