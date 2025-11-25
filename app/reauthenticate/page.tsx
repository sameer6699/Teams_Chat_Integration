'use client';

import { ReAuthenticateButton } from '@/components/ReAuthenticateButton';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle2 } from 'lucide-react';

/**
 * Step 5: Re-authenticate Page
 * 
 * This page provides a way to clear all cached tokens and force a fresh authentication
 * after admin consent has been granted.
 * 
 * Instructions:
 * 1. After admin consent is granted in Azure Portal
 * 2. Visit this page
 * 3. Click "Clear Cache & Re-authenticate"
 * 4. You will be redirected to Microsoft login
 * 5. After successful login, you should have access
 */
export default function ReAuthenticatePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Step 5: Re-authenticate After Admin Consent
          </CardTitle>
          <CardDescription>
            Clear cached tokens and force a fresh authentication after admin consent has been granted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAuthenticated && user && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Currently Authenticated</AlertTitle>
              <AlertDescription>
                You are currently logged in as: <strong>{user.name || user.username}</strong>
                <br />
                If you're still seeing "Need admin approval" errors, use the button below to clear cache and re-authenticate.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">When to use this:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>After admin consent has been granted in Azure Portal</li>
                <li>When you see "Need admin approval" error even after admin consent</li>
                <li>When authentication tokens are stale or cached</li>
                <li>When you need to force a fresh consent prompt</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What this does:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Clears all MSAL cache from localStorage and sessionStorage</li>
                <li>Removes all cached authentication tokens</li>
                <li>Forces a fresh login with consent prompt</li>
                <li>Redirects you to Microsoft login page</li>
              </ul>
            </div>

            <ReAuthenticateButton />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Important Notes</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                <strong>Before using this:</strong> Make sure admin consent has been granted in Azure Portal.
                Visit: Azure Portal → Azure Active Directory → App registrations → Your App → API permissions → Grant admin consent
              </p>
              <p>
                <strong>If you still see errors:</strong> Verify that:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Admin consent was granted for all required permissions</li>
                <li>The app registration redirect URI matches your app URL</li>
                <li>You're using the correct tenant ID and client ID</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

