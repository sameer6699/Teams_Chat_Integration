import { PublicClientApplication } from '@azure/msal-browser';
import { getMsalInstance } from './msalInstance';

/**
 * Clears all MSAL-related cache and tokens from localStorage and sessionStorage
 * This is useful when admin consent has been granted and you need to force a fresh authentication
 */
export const clearMsalCache = (): void => {
  try {
    const msalInstance = getMsalInstance();
    
    // Get all accounts and remove them
    const accounts = msalInstance.getAllAccounts();
    accounts.forEach((account) => {
      msalInstance.removeAccount(account);
    });

    // Clear all MSAL-related items from localStorage
    const msalKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('msal.') || key.includes('msal'))) {
        msalKeys.push(key);
      }
    }
    msalKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear all MSAL-related items from sessionStorage
    const msalSessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('msal.') || key.includes('msal'))) {
        msalSessionKeys.push(key);
      }
    }
    msalSessionKeys.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    console.log('MSAL cache cleared successfully');
  } catch (error) {
    console.error('Error clearing MSAL cache:', error);
    throw error;
  }
};

/**
 * Clears all authentication-related data including MSAL cache
 * Use this when you need a complete fresh start
 */
export const clearAllAuthData = (): void => {
  try {
    // Clear MSAL cache first
    clearMsalCache();

    // Clear any other auth-related items
    const authKeys = ['auth_token', 'access_token', 'id_token', 'refresh_token', 'user', 'account'];
    authKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('All authentication data cleared');
  } catch (error) {
    console.error('Error clearing authentication data:', error);
    throw error;
  }
};

/**
 * Forces a fresh login with consent prompt
 * This should be used after admin consent has been granted
 */
export const forceReAuthentication = async (): Promise<void> => {
  try {
    // Clear all cache first
    clearAllAuthData();

    const msalInstance = getMsalInstance();
    
    // Force login with consent prompt
    await msalInstance.loginRedirect({
      scopes: [
        'https://graph.microsoft.com/User.Read',
        'https://graph.microsoft.com/Chat.ReadWrite',
        'https://graph.microsoft.com/ChatMessage.Send',
        'https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser',
        'offline_access',
        'openid',
        'profile'
      ],
      prompt: 'consent', // Force consent prompt
    });
  } catch (error) {
    console.error('Error forcing re-authentication:', error);
    throw error;
  }
};

