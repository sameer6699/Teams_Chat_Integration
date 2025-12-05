'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, Info, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';

/**
 * Admin Consent Page
 * 
 * Provides the correct tenant-specific admin consent URL
 * to grant permissions for the application
 */
export default function AdminConsentPage() {
  const [copied, setCopied] = useState(false);

  // Tenant-specific configuration
  const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '816158a9-dd67-4a38-83b4-6033fa01c2b5';
  const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '3843cf08-a3d1-425c-8d3c-6872729e0a4b';
  const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 
    (typeof window !== 'undefined' ? `${window.location.origin}/callback` : 'http://localhost:3000/callback');

  // Build tenant-specific admin consent URL with full Graph API scopes
  const scopes = [
    'https://graph.microsoft.com/User.Read',
    // 'https://graph.microsoft.com/Chat.ReadWrite',
    // 'https://graph.microsoft.com/ChatMessage.Send',
    // 'https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser',
  ].join(' ');

  // Working URL 
  //https://login.microsoftonline.com/3843cf08-a3d1-425c-8d3c-6872729e0a4b/oauth2/v2.0/authorize?client_id=816158a9-dd67-4a38-83b4-6033fa01c2b5&response_type=code&redirect_uri=http://localhost:3000/callback&scope=https://graph.microsoft.com/User.Read

  const adminConsentUrl = `https://login.microsoftonline.com/${tenantId}/v2.0/adminconsent?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  //const adminConsentUrl =`https://login.microsoftonline.com/3843cf08-a3d1-425c-8d3c-6872729e0a4b/oauth2/v2.0/authorize?client_id=816158a9-dd67-4a38-83b4-6033fa01c2b5&response_type=code&redirect_uri=http://localhost:3000/callback&scope=https://graph.microsoft.com/User.Read`;  
  const handleAdminConsent = () => {
    window.location.href = adminConsentUrl;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(adminConsentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Admin Consent Required
          </CardTitle>
          <CardDescription>
            Grant admin consent for Teams Chat Integration to access Microsoft Graph APIs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Why Admin Consent?</AlertTitle>
            <AlertDescription>
              This application requires permissions that need administrator approval to access:
              <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                <li>User profile information</li>
                <li>Teams chat messages (read/write)</li>
                <li>Send chat messages</li>
                <li>Manage Teams app installations</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Tenant Configuration</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm font-mono">
                <div><span className="text-gray-600">Tenant ID:</span> <span className="text-blue-600">{tenantId}</span></div>
                <div><span className="text-gray-600">Client ID:</span> <span className="text-blue-600">{clientId}</span></div>
                <div><span className="text-gray-600">Redirect URI:</span> <span className="text-blue-600">{redirectUri}</span></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Required Permissions</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <code>https://graph.microsoft.com/User.Read</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <code>https://graph.microsoft.com/Chat.ReadWrite</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <code>https://graph.microsoft.com/ChatMessage.Send</code>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <code>https://graph.microsoft.com/TeamsAppInstallation.ReadWriteForUser</code>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Admin Consent URL</h3>
              <div className="bg-gray-100 p-3 rounded-md border border-gray-300 break-all text-xs font-mono">
                {adminConsentUrl}
              </div>
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Alert className="bg-yellow-50 border-yellow-200">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Important</AlertTitle>
              <AlertDescription className="text-yellow-700">
                You must be signed in as a <strong>Global Administrator</strong> or <strong>Application Administrator</strong> 
                in your Azure AD tenant (meldep.com) to grant consent.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleAdminConsent}
              size="lg"
              className="w-full"
            >
              <Shield className="h-5 w-5 mr-2" />
              Grant Admin Consent
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">After Granting Consent</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>You&apos;ll be redirected to Microsoft login page</li>
              <li>Sign in with your admin account (devapps@meldep.com)</li>
              <li>Review and accept the requested permissions</li>
              <li>You&apos;ll be redirected back to the application</li>
              <li>Go to <a href="/reauthenticate" className="text-blue-600 hover:underline">/reauthenticate</a> page</li>
              <li>Clear cache and re-authenticate with your regular account</li>
            </ol>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>If you still see &quot;Need admin approval&quot; after granting consent:</p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Clear browser cache and cookies completely</li>
                <li>Visit the <a href="/reauthenticate" className="text-blue-600 hover:underline">/reauthenticate</a> page</li>
                <li>Click &quot;Clear Cache &amp; Re-authenticate&quot;</li>
                <li>Sign in with a fresh session</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

