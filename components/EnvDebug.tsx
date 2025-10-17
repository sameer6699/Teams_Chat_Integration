'use client';

export const EnvDebug: React.FC = () => {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debug info in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-xs max-w-sm">
      <h4 className="font-bold mb-2">Environment Debug:</h4>
      <div className="space-y-1">
        <div>
          <strong>Client ID:</strong> {process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ? '✅ Set' : '❌ Missing'}
        </div>
        <div>
          <strong>Tenant ID:</strong> {process.env.NEXT_PUBLIC_AZURE_TENANT_ID ? '✅ Set' : '❌ Missing'}
        </div>
        <div>
          <strong>Redirect URI:</strong> {process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || 'Default'}
        </div>
      </div>
    </div>
  );
};
