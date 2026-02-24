/**
 * Traksolid API Connection Status Component
 * Tests and displays the connection status to Traksolid Pro API
 */

import { useState, useEffect, useCallback } from 'react';
import { testTraksolidConnection } from '@/services/dashcam/dashcam.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export function ConnectionStatus({ onStatusChange }: ConnectionStatusProps) {
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  const checkCredentials = useCallback(() => {
    const hasCreds = !!(
      import.meta.env.VITE_TRAKSOLID_ACCOUNT &&
      import.meta.env.VITE_TRAKSOLID_PASSWORD &&
      import.meta.env.VITE_TRAKSOLID_APP_KEY &&
      import.meta.env.VITE_TRAKSOLID_APP_SECRET
    );
    setHasCredentials(hasCreds);
    return hasCreds;
  }, []);

  const testConnection = useCallback(async () => {
    setIsTesting(true);
    try {
      const result = await testTraksolidConnection();
      setStatus(result);
      onStatusChange?.(result.success);
    } finally {
      setIsTesting(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    const hasCreds = checkCredentials();
    // Auto-test if credentials exist (but delay to avoid hydration issues)
    if (hasCreds) {
      const timer = setTimeout(() => {
        testConnection();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []); // Run only once on mount

  // No credentials configured
  if (!hasCredentials) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-yellow-400">Traksolid API Not Configured</h4>
            <p className="text-xs text-gray-400 mt-1">
              Set the following environment variables in <code className="bg-gray-800 px-1 rounded">.env.local</code>:
            </p>
            <code className="block bg-gray-900/50 rounded p-2 mt-2 text-xs text-gray-500 font-mono">
              VITE_TRAKSOLID_API_URL=https://api.jimilink.com<br />
              VITE_TRAKSOLID_ACCOUNT=Admin_ParaXpress<br />
              VITE_TRAKSOLID_PASSWORD=***<br />
              VITE_TRAKSOLID_APP_KEY=***<br />
              VITE_TRAKSOLID_APP_SECRET=***
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Currently showing <span className="px-1.5 py-0.5 text-[10px] border border-gray-600 rounded text-gray-500">Mock Data</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${
      status?.success 
        ? 'bg-green-500/10 border-green-500/30' 
        : status?.success === false 
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-gray-800/50 border-gray-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status?.success ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : status?.success === false ? (
            <WifiOff className="w-5 h-5 text-red-500" />
          ) : (
            <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
          )}
          <div>
            <h4 className={`text-sm font-medium ${
              status?.success ? 'text-green-400' : status?.success === false ? 'text-red-400' : 'text-gray-300'
            }`}>
              {status?.success 
                ? 'Traksolid API Connected' 
                : status?.success === false 
                  ? 'Connection Failed'
                  : 'Testing Connection...'}
            </h4>
            {status?.message && (
              <p className="text-xs text-gray-400 mt-0.5">{status.message}</p>
            )}
            {status?.details?.deviceCount !== undefined && (
              <p className="text-xs text-gray-500 mt-0.5">
                API URL: {String(status.details.apiUrl || 'https://api.jimilink.com')}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={isTesting}
          className="h-8"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Testing...' : 'Test'}
        </Button>
      </div>
      
      {!status?.success && status?.success !== undefined && (
        <div className="mt-3 pt-3 border-t border-red-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="text-xs text-gray-400">
              <p className="font-medium text-red-400">Troubleshooting Tips:</p>
              <p className="text-gray-500 mt-1">Current API URL: <code className="bg-gray-800 px-1 rounded">{import.meta.env.VITE_TRAKSOLID_API_URL || 'https://api.jimilink.com'}</code></p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Check account credentials are correct</li>
                <li>Ensure appKey and appSecret are valid</li>
                <li>Check if the API requires IP whitelisting</li>
                <li>Check browser console (F12) for detailed error</li>
              </ul>
              <p className="mt-2 text-gray-500">
                Falling back to <span className="px-1.5 py-0.5 text-[10px] border border-gray-600 rounded text-gray-500">Mock Data</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;
