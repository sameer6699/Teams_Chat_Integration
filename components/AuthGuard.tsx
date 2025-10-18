'use client';

import { useAuth } from '@/lib/authContext';
import { WelcomeCard } from '@/components/WelcomeCard';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="relative">
            <img 
              width="96" 
              height="96" 
              src="https://img.icons8.com/fluency/96/microsoft-teams-2019.png" 
              alt="microsoft-teams-2019"
              className="w-24 h-24"
            />
            <Loader2 className="absolute -bottom-2 -right-2 h-8 w-8 animate-spin text-blue-600" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Teams Chat Integration</h2>
            <p className="text-gray-600">Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <WelcomeCard />;
  }

  return <>{children}</>;
};
