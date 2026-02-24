import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a custom render function that includes providers
interface AllTheProvidersProps {
  children: ReactNode;
  initialRoute?: string;
  useMemoryRouter?: boolean;
}

function AllTheProviders({ 
  children, 
  initialRoute = '/', 
  useMemoryRouter = false 
}: AllTheProvidersProps) {
  // Create a new QueryClient for each test to avoid cache pollution
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Router = useMemoryRouter ? MemoryRouter : BrowserRouter;
  const routerProps = useMemoryRouter ? { initialEntries: [initialRoute] } : {};

  return (
    <QueryClientProvider client={queryClient}>
      <Router {...routerProps}>
        {children}
      </Router>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  useMemoryRouter?: boolean;
}

function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { route = '/', useMemoryRouter = false, ...renderOptions } = options;

  // Set initial route if provided for BrowserRouter
  if (route !== '/' && !useMemoryRouter && typeof window !== 'undefined') {
    window.history.pushState({}, 'Test page', route);
  }

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        initialRoute={route} 
        useMemoryRouter={useMemoryRouter}
        {...props} 
      />
    ),
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Helper to create mock auth store state
export const createMockAuthState = (overrides = {}) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  ...overrides,
});

// Helper to create mock user
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'Viewer' as const,
  permissions: ['view:dashboard'] as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Helper to wait for promises to resolve
export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to create a mock QueryClient for tests
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Helper to mock localStorage
export function mockLocalStorage(storage: Record<string, string> = {}) {
  const getItem = vi.fn((key: string) => storage[key] ?? null);
  const setItem = vi.fn((key: string, value: string) => {
    storage[key] = value;
  });
  const removeItem = vi.fn((key: string) => {
    delete storage[key];
  });
  const clear = vi.fn(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
  });

  Object.defineProperty(window, 'localStorage', {
    value: { getItem, setItem, removeItem, clear },
    writable: true,
  });

  return { getItem, setItem, removeItem, clear };
}

// Helper to create mock fetch response
export function createMockFetchResponse<T>(data: T, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}
