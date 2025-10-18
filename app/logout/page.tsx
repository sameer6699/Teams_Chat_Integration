'use client';

import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear local storage/session storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Sign out from MSAL
        await instance.logoutRedirect({
          postLogoutRedirectUri: 'http://localhost:3000'
        });
      } catch (error) {
        console.error('Logout error:', error);
        // Redirect to home page even if logout fails
        router.push('/');
      }
    };

    handleLogout();
  }, [instance, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Signing out...</h1>
        <p className="text-gray-600">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
