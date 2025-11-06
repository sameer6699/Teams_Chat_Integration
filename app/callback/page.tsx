'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeMsal } from '@/lib/msalInstance';

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setStatus('loading');
        
        // Initialize MSAL instance if not already initialized
        const instance = await initializeMsal();
        
        // Handle the redirect promise
        const response = await instance.handleRedirectPromise();
        
        if (response) {
          console.log('Authentication successful:', response);
          setStatus('success');
          
          // Redirect to home page after successful authentication
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          // No response means user might have cancelled or there was an error
          console.log('No authentication response received');
          setStatus('error');
          setErrorMessage('Authentication was cancelled or failed');
          
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Authenticating...</h1>
            <p className="text-gray-600">Please wait while we complete your sign-in.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600">You have been successfully authenticated. Redirecting...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Failed</h1>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </>
        )}
      </div>
    </div>
  );
}
