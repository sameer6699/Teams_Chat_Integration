'use client';

import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
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
        <Loader2 className="h-4 w-4 animate-spin" />
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
