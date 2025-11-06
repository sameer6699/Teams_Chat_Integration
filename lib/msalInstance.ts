import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './msalConfig';

// Create a singleton MSAL instance
let msalInstance: PublicClientApplication | null = null;
let isInitialized = false;
let initializationPromise: Promise<PublicClientApplication> | null = null;

export const getMsalInstance = (): PublicClientApplication => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
};

// Initialize MSAL instance (should be called once at app startup)
// This function is idempotent - safe to call multiple times
export const initializeMsal = async (): Promise<PublicClientApplication> => {
  if (isInitialized) {
    return msalInstance!;
  }

  // If initialization is in progress, wait for it to complete
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    const instance = getMsalInstance();
    await instance.initialize();
    isInitialized = true;
    return instance;
  })();

  return initializationPromise;
};

