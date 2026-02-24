import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderSource = 'testapi' | 'mock';

interface OrderSourceState {
  source: OrderSource;
  setSource: (source: OrderSource) => void;
  toggleSource: () => void;
  isTestApi: () => boolean;
  isMock: () => boolean;
}

/**
 * Global store for managing order data source preference
 * - 'testapi': Real orders from testapi backend
 * - 'mock': Fake streaming orders from mock service
 * 
 * Defaults to 'testapi' and persists to localStorage
 */
export const useOrderSourceStore = create<OrderSourceState>()(
  persist(
    (set, get) => ({
      source: 'testapi',
      
      setSource: (source: OrderSource) => {
        set({ source });
      },
      
      toggleSource: () => {
        const currentSource = get().source;
        set({ source: currentSource === 'testapi' ? 'mock' : 'testapi' });
      },
      
      isTestApi: () => get().source === 'testapi',
      
      isMock: () => get().source === 'mock',
    }),
    {
      name: 'order-source-preference',
    }
  )
);
