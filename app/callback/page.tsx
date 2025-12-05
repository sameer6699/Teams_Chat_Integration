'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initializeMsal } from '@/lib/msalInstance';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [authDetails, setAuthDetails] = useState<{
    userName?: string;
    userEmail?: string;
  }>({});

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        setStatus('loading');
        console.log('🔄 Starting authentication callback...');
        
        // Check for error parameters in URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('❌ Authentication error from URL:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription || error);
          
          setTimeout(() => {
            router.push('/');
          }, 5000);
          return;
        }
        
        // Initialize MSAL instance if not already initialized
        const instance = await initializeMsal();
        console.log('✅ MSAL instance initialized');
        
        // Handle the redirect promise
        const response = await instance.handleRedirectPromise();
        
        if (response && response.account) {
          console.log('✅ Authentication successful:', {
            username: response.account.username,
            name: response.account.name,
            tenantId: response.account.tenantId,
          });
          
          setAuthDetails({
            userName: response.account.name || response.account.username,
            userEmail: response.account.username,
          });
          
          setStatus('success');
          
          // Store user info in localStorage for persistence
          localStorage.setItem('msal.authenticated', 'true');
          localStorage.setItem('msal.user', JSON.stringify({
            name: response.account.name,
            email: response.account.username,
          }));
          
          // Redirect to dashboard after successful authentication
          console.log('🚀 Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          // No response means user might have cancelled or there was an error
          console.warn('⚠️ No authentication response received');
          
          // Check if already authenticated
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            console.log('✅ User already authenticated, redirecting to dashboard');
            setStatus('success');
            setAuthDetails({
              userName: accounts[0].name || accounts[0].username,
              userEmail: accounts[0].username,
            });
            
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          } else {
            setStatus('error');
            setErrorMessage('Authentication was cancelled or failed. Please try again.');
            
            setTimeout(() => {
              router.push('/');
            }, 4000);
          }
        }
      } catch (error) {
        console.error('❌ Authentication error:', error);
        setStatus('error');
        
        // Parse MSAL errors
        let errorMsg = 'An unknown error occurred';
        if (error instanceof Error) {
          errorMsg = error.message;
          
          // Check for specific Azure AD errors
          if (errorMsg.includes('AADSTS9002326')) {
            errorMsg = '⚠️ Azure AD Configuration Error: Your app needs to be configured as a Single-Page Application (SPA) in Azure Portal. Please check the authentication settings.';
          } else if (errorMsg.includes('AADSTS50058')) {
            errorMsg = '⚠️ Admin consent is required. Please visit /admin-consent to grant permissions.';
          } else if (errorMsg.includes('AADSTS65001')) {
            errorMsg = '⚠️ User or admin has not consented to use the application.';
          }
        }
        
        setErrorMessage(errorMsg);
        
        // Redirect to home page after 5 seconds
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    };

    handleRedirect();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">Authenticating...</h1>
            <p className="text-gray-600">Please wait while we complete your sign-in.</p>
            <div className="flex justify-center items-center gap-2 pt-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full animate-ping opacity-75"></div>
              </div>
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto relative" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Success!</h1>
            <div className="space-y-2">
              <p className="text-gray-600">Welcome back!</p>
              {authDetails.userName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">{authDetails.userName}</p>
                  <p className="text-xs text-green-700">{authDetails.userEmail}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="relative">
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Authentication Failed</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-left text-red-800">{errorMessage}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium">What to do next:</p>
              <ul className="text-left list-disc list-inside space-y-1 text-xs">
                <li>Ensure your Azure AD app is configured as a <strong>Single-Page Application (SPA)</strong></li>
                <li>Check that redirect URI matches: <code className="bg-gray-100 px-1 py-0.5 rounded">http://localhost:3000/callback</code></li>
                <li>Visit <a href="/admin-consent" className="text-blue-600 hover:underline">/admin-consent</a> if you need to grant permissions</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
