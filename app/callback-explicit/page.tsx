'use client';

/**
 * Explicit Authorization Code Flow Callback Page
 * 
 * This page handles the OAuth 2.0 callback using explicit grant_type=authorization_code
 * It extracts the authorization code from the URL and exchanges it for tokens
 * 
 * Flow:
 * 1. User is redirected here with ?code=... after Microsoft login
 * 2. Extract authorization code from URL
 * 3. Exchange code for tokens using grant_type=authorization_code
 * 4. Store tokens and redirect to home
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  extractAuthorizationCode, 
  extractErrorFromUrl,
  exchangeAuthorizationCodeForToken 
} from '@/lib/tokenExchangeUtils';

export default function ExplicitCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('loading');

        // Get current URL
        const currentUrl = window.location.href;
        
        // Check for errors first
        const error = extractErrorFromUrl(currentUrl);
        if (error) {
          setStatus('error');
          setErrorMessage(error.errorDescription || error.error || 'Authentication failed');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        // Extract authorization code from URL
        const code = searchParams.get('code') || extractAuthorizationCode(currentUrl);
        
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received from Microsoft');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        console.log('Authorization code received, exchanging for tokens with grant_type=authorization_code...');

        // Get redirect URI from environment or use current origin
        const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 
          `${window.location.origin}/callback-explicit`;

        // Exchange authorization code for tokens using grant_type=authorization_code
        const tokenResult = await exchangeAuthorizationCodeForToken(
          code,
          redirectUri
        );

        if (!tokenResult.success || !tokenResult.access_token) {
          setStatus('error');
          setErrorMessage(tokenResult.error || 'Failed to exchange authorization code for tokens');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        console.log('Token exchange successful with grant_type=authorization_code:', {
          grant_type: tokenResult.grant_type,
          has_access_token: !!tokenResult.access_token,
          has_refresh_token: !!tokenResult.refresh_token,
          expires_in: tokenResult.expires_in,
        });

        // Store tokens (you can customize this based on your storage strategy)
        if (tokenResult.access_token) {
          // Store access token
          sessionStorage.setItem('msal_access_token', tokenResult.access_token);
          
          if (tokenResult.refresh_token) {
            // Store refresh token securely (consider using httpOnly cookies in production)
            sessionStorage.setItem('msal_refresh_token', tokenResult.refresh_token);
          }

          if (tokenResult.id_token) {
            sessionStorage.setItem('msal_id_token', tokenResult.id_token);
          }

          // Store token expiry
          if (tokenResult.expires_in) {
            const expiryTime = Date.now() + (tokenResult.expires_in * 1000);
            sessionStorage.setItem('msal_token_expiry', expiryTime.toString());
          }
        }

        setStatus('success');
        
        // Redirect to home page after successful authentication
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Exchanging Authorization Code...</h1>
            <p className="text-gray-600 mb-2">Using grant_type=authorization_code</p>
            <p className="text-sm text-gray-500">Please wait while we complete your sign-in.</p>
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
            <p className="text-gray-600 mb-2">Token exchange completed successfully</p>
            <p className="text-sm text-green-600 font-medium">grant_type=authorization_code ✓</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
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

