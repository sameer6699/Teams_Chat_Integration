'use client';

import { useAuth } from '@/lib/authContext';
import { WelcomeCard } from '@/components/WelcomeCard';

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
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Teams Chat Integration</h2>
            <p className="text-gray-600 mb-4">Setting up your workspace...</p>
            {/* Loader after the text */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
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
