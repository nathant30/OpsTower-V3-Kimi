import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useUIStore } from '@/lib/stores/ui.store';
import { useKeyboardShortcuts, CommonShortcuts, type ShortcutConfig } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils/cn';
import { initAudio } from '@/lib/utils/sound';

export function MainLayout() {
  const navigate = useNavigate();
  const { sidebarCollapsed, sidebarMobileOpen, closeModal, activeModal, setSidebarMobileOpen } = useUIStore();

  // Define keyboard shortcuts
  const shortcuts: ShortcutConfig[] = [
    // CMD+1: Dashboard
    {
      key: '1',
      modifiers: ['cmd'],
      handler: () => navigate('/'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Dashboard',
    },
    // CMD+2: Orders
    {
      key: '2',
      modifiers: ['cmd'],
      handler: () => navigate('/orders'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Orders',
    },
    // CMD+3: Drivers
    {
      key: '3',
      modifiers: ['cmd'],
      handler: () => navigate('/drivers'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Drivers',
    },
    // CMD+4: Fleet
    {
      key: '4',
      modifiers: ['cmd'],
      handler: () => navigate('/fleet'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Fleet',
    },
    // CMD+5: Incidents
    {
      key: '5',
      modifiers: ['cmd'],
      handler: () => navigate('/incidents'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Incidents',
    },
    // CMD+6: Shifts
    {
      key: '6',
      modifiers: ['cmd'],
      handler: () => navigate('/shifts'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Shifts',
    },
    // CMD+7: Bonds
    {
      key: '7',
      modifiers: ['cmd'],
      handler: () => navigate('/bonds'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Bonds',
    },
    // CMD+8: Compliance
    {
      key: '8',
      modifiers: ['cmd'],
      handler: () => navigate('/compliance'),
      preventDefault: true,
      allowInInput: false,
      description: 'Navigate to Compliance',
    },
    // ESC: Close modals and mobile sidebar
    CommonShortcuts.escape(() => {
      if (activeModal) {
        closeModal();
      } else if (sidebarMobileOpen) {
        setSidebarMobileOpen(false);
      }
    }),
    // R: Refresh data (when not in input)
    CommonShortcuts.refresh(() => {
      window.location.reload();
    }),
  ];

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({ shortcuts, global: true });

  return (
    <div 
      className="min-h-screen bg-xpress-bg-primary flex"
      onClick={initAudio} // Initialize audio on first interaction
    >
      {/* Sidebar - Desktop always visible, Mobile slide-out */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          // Desktop: respect sidebar collapsed state
          'lg:ml-16',
          !sidebarCollapsed && 'lg:ml-64',
          // Mobile: no margin, sidebar overlays
          'ml-0'
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default MainLayout;
