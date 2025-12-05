'use client';

/**
 * Login Component with Explicit Authorization Code Flow
 * 
 * This component demonstrates how to use the explicit grant_type=authorization_code
 * OAuth 2.0 flow for Microsoft authentication
 */

import { useState } from 'react';
import { initiateAuthorizationCodeLogin, getAuthorizationCodeFlowConfig } from '@/lib/authWithAuthorizationCode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, LogIn } from 'lucide-react';

export function LoginWithAuthorizationCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get configuration from environment variables
      const config = getAuthorizationCodeFlowConfig();

      console.log('Initiating authorization code flow:', {
        grant_type: 'authorization_code', // Will be used during token exchange
        response_type: 'code', // Used in authorization URL
        client_id: config.clientId,
        tenant_id: config.tenantId,
        redirect_uri: config.redirectUri,
        scopes: config.scopes,
      });

      // Initiate login - this will redirect to Microsoft
      initiateAuthorizationCodeLogin(config);
    } catch (err) {
      console.error('Login initiation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Microsoft Login
        </CardTitle>
        <CardDescription>
          Login using OAuth 2.0 Authorization Code Flow with explicit grant_type=authorization_code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This login uses the explicit <strong>grant_type=authorization_code</strong> OAuth 2.0 flow.
            After clicking login, you'll be redirected to Microsoft, then back to the callback page
            where the authorization code will be exchanged for tokens.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <div className="flex items-center gap-1 mr-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              Redirecting...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Login with Microsoft
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Flow:</strong> Authorization Code</p>
          <p><strong>Grant Type:</strong> authorization_code</p>
          <p><strong>Response Type:</strong> code</p>
        </div>
      </CardContent>
    </Card>
  );
}

