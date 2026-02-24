import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { queryClient } from '@/lib/api/queryClient';
import { router } from '@/app/routes';
import { ToastProvider } from '@/components/auth';
import { WebSocketProvider } from '@/lib/ws';
import { setupMocks } from '@/lib/mocks/browser';
import { MonitoringProvider } from '@/lib/monitoring';
import './index.css';

/**
 * Initialize the application
 * Sets up mocks if VITE_ENABLE_MOCK_DATA is set to 'true'
 */
const initApp = async () => {
  // Setup mocks before rendering if enabled
  await setupMocks();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider 
          autoSubscribe 
          eventTypes={['orders', 'drivers', 'vehicles', 'incidents']}
        >
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
};

// Start the application
initApp();
// CI/CD Trigger: Tue 24 Feb 2026 08:37:56 PST
