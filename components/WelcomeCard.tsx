'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginButton } from '@/components/LoginButton';

export const WelcomeCard: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-4">
            <img 
              width="96" 
              height="96" 
              src="https://img.icons8.com/fluency/96/microsoft-teams-2019.png" 
              alt="microsoft-teams-2019"
              className="w-24 h-24"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Teams Chat Integration
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Please sign in with your Microsoft account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
