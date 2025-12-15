import { PublicClientApplication } from '@azure/msal-browser';
import { getMsalInstance } from './msalInstance';

/**
 * Clears all MSAL-related cache and tokens from localStorage and sessionStorage
 * This is useful when admin consent has been granted and you need to force a fresh authentication
 */
export const clearMsalCache = (): void => {
  const errors: Error[] = [];
  
  try {
    // Step 1: Remove MSAL accounts
    try {
      const msalInstance = getMsalInstance();
      const accounts = msalInstance.getAllAccounts();
      
      accounts.forEach((account) => {
        try {
          msalInstance.removeAccount(account);
        } catch (accountError) {
          const error = accountError instanceof Error 
            ? accountError 
            : new Error(`Failed to remove account: ${String(accountError)}`);
          errors.push(error);
          console.warn('⚠️ Failed to remove account:', account.username, error.message);
        }
      });
      
      if (accounts.length > 0) {
        console.log(`✅ Removed ${accounts.length} MSAL account(s)`);
      }
    } catch (msalError) {
      const error = msalError instanceof Error 
        ? msalError 
        : new Error(`MSAL instance error: ${String(msalError)}`);
      errors.push(error);
      console.error('⚠️ Error accessing MSAL instance:', error.message);
    }

    // Step 2: Clear localStorage (with error handling for quota exceeded, etc.)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const msalKeys: string[] = [];
        
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('msal.') || key.includes('msal'))) {
              msalKeys.push(key);
            }
          }
        } catch (keyError) {
          console.warn('⚠️ Error reading localStorage keys:', keyError);
        }
        
        msalKeys.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (removeError) {
            const error = removeError instanceof Error 
              ? removeError 
              : new Error(`Failed to remove localStorage key ${key}: ${String(removeError)}`);
            errors.push(error);
            console.warn('⚠️ Failed to remove localStorage key:', key, error.message);
          }
        });
        
        if (msalKeys.length > 0) {
          console.log(`✅ Cleared ${msalKeys.length} localStorage item(s)`);
        }
      }
    } catch (storageError) {
      const error = storageError instanceof Error 
        ? storageError 
        : new Error(`localStorage error: ${String(storageError)}`);
      errors.push(error);
      console.error('⚠️ Error clearing localStorage:', error.message);
    }

    // Step 3: Clear sessionStorage (with error handling)
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const msalSessionKeys: string[] = [];
        
        try {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.startsWith('msal.') || key.includes('msal'))) {
              msalSessionKeys.push(key);
            }
          }
        } catch (keyError) {
          console.warn('⚠️ Error reading sessionStorage keys:', keyError);
        }
        
        msalSessionKeys.forEach((key) => {
          try {
            sessionStorage.removeItem(key);
          } catch (removeError) {
            const error = removeError instanceof Error 
              ? removeError 
              : new Error(`Failed to remove sessionStorage key ${key}: ${String(removeError)}`);
            errors.push(error);
            console.warn('⚠️ Failed to remove sessionStorage key:', key, error.message);
          }
        });
        
        if (msalSessionKeys.length > 0) {
          console.log(`✅ Cleared ${msalSessionKeys.length} sessionStorage item(s)`);
        }
      }
    } catch (storageError) {
      const error = storageError instanceof Error 
        ? storageError 
        : new Error(`sessionStorage error: ${String(storageError)}`);
      errors.push(error);
      console.error('⚠️ Error clearing sessionStorage:', error.message);
    }

    // Log summary
    if (errors.length === 0) {
      console.log('✅ MSAL cache cleared successfully');
    } else {
      console.warn(`⚠️ MSAL cache cleared with ${errors.length} warning(s)`);
      // Don't throw if we cleared most things - partial success is acceptable
      if (errors.length > 5) {
        throw new Error(`Multiple errors occurred while clearing MSAL cache: ${errors.map(e => e.message).join('; ')}`);
      }
    }
  } catch (error) {
    const finalError = error instanceof Error 
      ? error 
      : new Error(`Unexpected error clearing MSAL cache: ${String(error)}`);
    console.error('❌ Error clearing MSAL cache:', finalError);
    throw finalError;
  }
};

/**
 * Clears all authentication-related data including MSAL cache
 * Use this when you need a complete fresh start
 */
export const clearAllAuthData = (): void => {
  const errors: Error[] = [];
  
  try {
    // Step 1: Clear MSAL cache
    try {
      clearMsalCache();
    } catch (msalError) {
      const error = msalError instanceof Error 
        ? msalError 
        : new Error(`MSAL cache clear failed: ${String(msalError)}`);
      errors.push(error);
      console.error('⚠️ MSAL cache clear failed, continuing with other cleanup:', error.message);
      // Continue with other cleanup even if MSAL clear fails
    }

    // Step 2: Clear additional auth-related items from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const authKeys = ['auth_token', 'access_token', 'id_token', 'refresh_token', 'user', 'account', 'msal.authenticated', 'msal.user'];
        
        authKeys.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (removeError) {
            const error = removeError instanceof Error 
              ? removeError 
              : new Error(`Failed to remove localStorage key ${key}: ${String(removeError)}`);
            errors.push(error);
            console.warn('⚠️ Failed to remove localStorage key:', key);
          }
        });
      }
    } catch (localStorageError) {
      const error = localStorageError instanceof Error 
        ? localStorageError 
        : new Error(`localStorage cleanup failed: ${String(localStorageError)}`);
      errors.push(error);
      console.error('⚠️ localStorage cleanup error:', error.message);
    }

    // Step 3: Clear additional auth-related items from sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const authKeys = ['auth_token', 'access_token', 'id_token', 'refresh_token', 'user', 'account', 'msal_access_token', 'msal_refresh_token', 'msal_id_token', 'msal_token_expiry'];
        
        authKeys.forEach((key) => {
          try {
            sessionStorage.removeItem(key);
          } catch (removeError) {
            const error = removeError instanceof Error 
              ? removeError 
              : new Error(`Failed to remove sessionStorage key ${key}: ${String(removeError)}`);
            errors.push(error);
            console.warn('⚠️ Failed to remove sessionStorage key:', key);
          }
        });
      }
    } catch (sessionStorageError) {
      const error = sessionStorageError instanceof Error 
        ? sessionStorageError 
        : new Error(`sessionStorage cleanup failed: ${String(sessionStorageError)}`);
      errors.push(error);
      console.error('⚠️ sessionStorage cleanup error:', error.message);
    }

    // Log summary
    if (errors.length === 0) {
      console.log('✅ All authentication data cleared successfully');
    } else {
      console.warn(`⚠️ Authentication data cleared with ${errors.length} warning(s)`);
      // Only throw if critical errors occurred
      const criticalErrors = errors.filter(e => 
        e.message.includes('MSAL instance') || 
        e.message.includes('Critical')
      );
      
      if (criticalErrors.length > 0) {
        throw new Error(`Critical errors during auth data cleanup: ${criticalErrors.map(e => e.message).join('; ')}`);
      }
    }
  } catch (error) {
    const finalError = error instanceof Error 
      ? error 
      : new Error(`Unexpected error clearing authentication data: ${String(error)}`);
    console.error('❌ Error clearing authentication data:', finalError);
    // Re-throw to allow caller to handle
    throw finalError;
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
    
    // Force login with consent prompt - All granted permissions
    await msalInstance.loginRedirect({
      scopes: [
        // Standard OAuth permissions
        'openid',
        'email',
        'offline_access',
        'profile',
        
        // User permissions
        'https://graph.microsoft.com/User.Read',
        'https://graph.microsoft.com/User.ReadBasic.All',
        'https://graph.microsoft.com/User.Read.All',
        
        // Chat permissions
        'https://graph.microsoft.com/Chat.Read',
        'https://graph.microsoft.com/Chat.ReadBasic',
        'https://graph.microsoft.com/Chat.ReadWrite',
        'https://graph.microsoft.com/Chat.ReadWrite.All',
        'https://graph.microsoft.com/Chat.Create',
        
        // Chat message permissions
        'https://graph.microsoft.com/ChatMessage.Read',
        'https://graph.microsoft.com/ChatMessage.Send',
        
        // Channel permissions
        'https://graph.microsoft.com/Channel.ReadBasic.All',
        'https://graph.microsoft.com/ChannelMessage.Read.All',
        'https://graph.microsoft.com/ChannelMessage.Send',
        
        // Team permissions
        'https://graph.microsoft.com/Team.ReadBasic.All',
        
        // Presence permissions
        'https://graph.microsoft.com/Presence.Read',
        'https://graph.microsoft.com/Presence.Read.All',
      ],
      prompt: 'consent', // Force consent prompt
    });
  } catch (error) {
    console.error('Error forcing re-authentication:', error);
    throw error;
  }
};

