'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginButton } from '@/components/LoginButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield } from 'lucide-react';
import Link from 'next/link';

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
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <LoginButton />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>First time here?</strong> If you see "Need admin approval" error, 
              visit the <Link href="/admin-consent" className="text-blue-600 hover:underline font-semibold">Admin Consent</Link> page first.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-2 pt-2">
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <Link href="/admin-consent" className="flex items-center gap-1 hover:text-blue-600">
                <Shield className="h-3 w-3" />
                Admin Consent
              </Link>
              <span>•</span>
              <Link href="/reauthenticate" className="hover:text-blue-600">
                Re-authenticate
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
