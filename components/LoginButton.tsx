'use client';

import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export const LoginButton: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <Button 
      onClick={login} 
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? (
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      ) : (
        <Image 
          width={24} 
          height={24} 
          src="https://img.icons8.com/fluency/96/microsoft-teams-2019.png" 
          alt="microsoft-teams-2019"
          className="h-6 w-6"
        />
      )}
      Sign in with Microsoft Teams 
    </Button>
  );
};
