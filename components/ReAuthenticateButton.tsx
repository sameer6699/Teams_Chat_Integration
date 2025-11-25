'use client';

import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * Component for Step 5: Re-authenticate after admin consent
 * 
 * This button clears all local tokens/cache and forces a fresh authentication
 * with consent prompt. Use this after admin consent has been granted.
 */
export const ReAuthenticateButton: React.FC = () => {
  const { reAuthenticate, clearCache, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleReAuthenticate = async () => {
    try {
      setError(null);
      // Clear cache first, then force re-authentication
      clearCache();
      await reAuthenticate();
    } catch (err) {
      console.error('Re-authentication error:', err);
      setError(err instanceof Error ? err.message : 'Failed to re-authenticate');
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleReAuthenticate} 
        disabled={loading}
        variant="outline"
        className="flex items-center gap-2 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Re-authenticating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Clear Cache & Re-authenticate
          </>
        )}
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      <p className="text-xs text-gray-500">
        Use this after admin consent has been granted. This will clear all cached tokens and force a fresh login.
      </p>
    </div>
  );
};

