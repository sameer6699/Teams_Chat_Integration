'use client';

import { useEffect } from 'react';
import { clearAllAuthData } from '@/lib/authUtils';

export default function LogoutPage() {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear all MSAL cache and authentication data
        clearAllAuthData();
        
        // Small delay to ensure state is cleared before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect to home page (which will show login screen via AuthGuard)
        // Use replace to avoid adding to browser history
        const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000/';
        window.location.replace(redirectUri);
      } catch (error) {
        console.error('Logout error:', error);
        // Redirect to home page even if logout fails
        const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'http://localhost:3000/';
        window.location.replace(redirectUri);
      }
    };

    handleLogout();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Signing out...</h1>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
