import { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrdersTable } from '@/features/orders/components/OrdersTable';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { OrderFilters, type OrderFiltersState } from '@/features/orders/components/OrderFilters';
import { AssignDriverModal } from '@/features/orders/components/AssignDriverModal';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressCard } from '@/components/ui/XpressCard';
import { Input } from '@/components/ui/Input';
import {
  useOrders,
  useBulkCancelOrders,
  useBulkAssignDriver,
  useLastUpdatedText,
  type NearbyDriver,
} from '@/features/orders/hooks/useOrders';
import { useAssignDriver, useAssignDriverFlow } from '@/features/orders/hooks/useAssignDriver';
import { OrdersBatchActions } from '@/components/batch';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { useKeyboardShortcuts, CommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Modal } from '@/components/ui/Modal';
import { showSuccess, showInfo, showError } from '@/lib/stores/ui.store';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  XCircle, 
  LayoutGrid, 
  List,
  Package,
  CheckCircle2,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Ban,
  CreditCard,
} from 'lucide-react';
import type { Order } from '@/types/domain.types';
import { cn } from '@/lib/utils/cn';

// Default filter state
const defaultFilters: OrderFiltersState = {
  searchQuery: '',
  statuses: [],
  serviceTypes: [],
  dateRange: null,
  startDate: '',
  endDate: '',
  priority: [],
};

// View mode type
type ViewMode = 'table' | 'grid';
type OrderTab = 'all' | 'active' | 'completed' | 'cancelled';

// Mock orders data for demo
const mockOrders: Order[] = [
  {
    orderId: 'ORD-2025-001',
    transactionId: 'TXN-7842156',
    status: 'Completed',
    serviceType: 'Delivery',
    priority: 'Normal',
    customer: {
      customerId: 'CUST-001',
      name: 'Maria Santos',
      phone: '+63 912 345 6789',
      email: 'maria.santos@email.com',
      rating: 4.8,
    },
    driver: {
      driverId: 'DRV-101',
      name: 'Juan Dela Cruz',
      vehicle: 'Honda Beat - ABC 1234',
      phone: '+63 923 456 7890',
      assignedAt: '2025-02-16T08:30:00Z',
      acceptedAt: '2025-02-16T08:32:00Z',
      pickedUpAt: '2025-02-16T08:45:00Z',
    },
    route: {
      pickup: {
        address: '123 Main St, Makati City',
        lat: 14.5547,
        lng: 121.0244,
      },
      dropoff: {
        address: '456 Ayala Ave, Makati City',
        lat: 14.5505,
        lng: 121.0307,
      },
      distance: 2.5,
      estimatedDuration: 15,
    },
    timeline: {
      bookedAt: '2025-02-16T08:30:00Z',
      assignedAt: '2025-02-16T08:30:00Z',
      acceptedAt: '2025-02-16T08:32:00Z',
      arrivedAt: '2025-02-16T08:40:00Z',
      pickedUpAt: '2025-02-16T08:45:00Z',
      completedAt: '2025-02-16T09:00:00Z',
    },
    pricing: {
      baseFare: 50,
      distanceFare: 25,
      timeFare: 10,
      surge: 0,
      discount: 0,
      total: 85,
      paymentMethod: 'GCash',
      isPaid: true,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    notes: 'Fragile items, handle with care',
    createdAt: '2025-02-16T08:30:00Z',
    updatedAt: '2025-02-16T09:00:00Z',
  },
  {
    orderId: 'ORD-2025-002',
    transactionId: 'TXN-7842157',
    status: 'OnTrip',
    serviceType: 'Taxi',
    priority: 'Normal',
    customer: {
      customerId: 'CUST-002',
      name: 'Jose Reyes',
      phone: '+63 913 456 7890',
      rating: 4.5,
    },
    driver: {
      driverId: 'DRV-102',
      name: 'Pedro Garcia',
      vehicle: 'Toyota Vios - XYZ 5678',
      phone: '+63 934 567 8901',
      assignedAt: '2025-02-16T09:15:00Z',
      acceptedAt: '2025-02-16T09:17:00Z',
      pickedUpAt: '2025-02-16T09:25:00Z',
    },
    route: {
      pickup: {
        address: 'BGC, Taguig City',
        lat: 14.5408,
        lng: 121.0503,
      },
      dropoff: {
        address: 'Ninoy Aquino Airport Terminal 3',
        lat: 14.5086,
        lng: 121.0194,
      },
      distance: 8.2,
      estimatedDuration: 35,
    },
    timeline: {
      bookedAt: '2025-02-16T09:15:00Z',
      assignedAt: '2025-02-16T09:15:00Z',
      acceptedAt: '2025-02-16T09:17:00Z',
      arrivedAt: '2025-02-16T09:22:00Z',
      pickedUpAt: '2025-02-16T09:25:00Z',
    },
    pricing: {
      baseFare: 45,
      distanceFare: 82,
      timeFare: 25,
      surge: 15,
      discount: 0,
      total: 167,
      paymentMethod: 'Cash',
      isPaid: false,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    createdAt: '2025-02-16T09:15:00Z',
    updatedAt: '2025-02-16T09:25:00Z',
  },
  {
    orderId: 'ORD-2025-003',
    transactionId: 'TXN-7842158',
    status: 'Searching',
    serviceType: 'Moto',
    priority: 'High',
    customer: {
      customerId: 'CUST-003',
      name: 'Anna Lim',
      phone: '+63 914 567 8901',
      email: 'anna.lim@email.com',
      rating: 4.9,
    },
    route: {
      pickup: {
        address: 'Ortigas Center, Pasig City',
        lat: 14.5853,
        lng: 121.0614,
      },
      dropoff: {
        address: 'Cubao, Quezon City',
        lat: 14.6177,
        lng: 121.0570,
      },
      distance: 5.3,
      estimatedDuration: 22,
    },
    timeline: {
      bookedAt: '2025-02-16T09:30:00Z',
    },
    pricing: {
      baseFare: 30,
      distanceFare: 42,
      timeFare: 15,
      surge: 10,
      discount: 5,
      total: 92,
      paymentMethod: 'Maya',
      isPaid: true,
    },
    flags: {
      isPrioritized: true,
      isScheduled: false,
      hasSpecialRequirements: true,
      requiresVerification: false,
    },
    notes: 'Priority delivery - medical supplies',
    createdAt: '2025-02-16T09:30:00Z',
    updatedAt: '2025-02-16T09:30:00Z',
  },
  {
    orderId: 'ORD-2025-004',
    transactionId: 'TXN-7842159',
    status: 'Assigned',
    serviceType: 'Delivery',
    priority: 'Normal',
    customer: {
      customerId: 'CUST-004',
      name: 'Carlos Tan',
      phone: '+63 915 678 9012',
      rating: 4.2,
    },
    driver: {
      driverId: 'DRV-103',
      name: 'Miguel Santos',
      vehicle: 'Yamaha Mio - DEF 9012',
      phone: '+63 945 678 9012',
      assignedAt: '2025-02-16T09:35:00Z',
    },
    route: {
      pickup: {
        address: 'Greenhills Shopping Center, San Juan',
        lat: 14.6005,
        lng: 121.0480,
      },
      dropoff: {
        address: 'Mandaluyong City Hall',
        lat: 14.5794,
        lng: 121.0359,
      },
      distance: 3.8,
      estimatedDuration: 18,
    },
    timeline: {
      bookedAt: '2025-02-16T09:30:00Z',
      assignedAt: '2025-02-16T09:35:00Z',
    },
    pricing: {
      baseFare: 40,
      distanceFare: 30,
      timeFare: 12,
      surge: 0,
      discount: 0,
      total: 82,
      paymentMethod: 'GCash',
      isPaid: true,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    createdAt: '2025-02-16T09:30:00Z',
    updatedAt: '2025-02-16T09:35:00Z',
  },
  {
    orderId: 'ORD-2025-005',
    transactionId: 'TXN-7842160',
    status: 'Cancelled',
    serviceType: 'Car',
    priority: 'Normal',
    customer: {
      customerId: 'CUST-005',
      name: 'Elena Cruz',
      phone: '+63 916 789 0123',
      email: 'elena.cruz@email.com',
      rating: 4.6,
    },
    route: {
      pickup: {
        address: 'SM Mall of Asia, Pasay City',
        lat: 14.5350,
        lng: 120.9820,
      },
      dropoff: {
        address: 'Intramuros, Manila',
        lat: 14.5919,
        lng: 120.9736,
      },
      distance: 9.5,
      estimatedDuration: 45,
    },
    timeline: {
      bookedAt: '2025-02-16T08:45:00Z',
      assignedAt: '2025-02-16T08:47:00Z',
      cancelledAt: '2025-02-16T08:50:00Z',
      cancelledBy: 'Customer',
      cancellationReason: 'Change of plans',
    },
    pricing: {
      baseFare: 60,
      distanceFare: 95,
      timeFare: 35,
      surge: 0,
      discount: 0,
      total: 190,
      paymentMethod: 'Card',
      isPaid: false,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    createdAt: '2025-02-16T08:45:00Z',
    updatedAt: '2025-02-16T08:50:00Z',
  },
  {
    orderId: 'ORD-2025-006',
    transactionId: 'TXN-7842161',
    status: 'EnRoute',
    serviceType: 'Delivery',
    priority: 'Urgent',
    customer: {
      customerId: 'CUST-006',
      name: 'Ramon Villanueva',
      phone: '+63 917 890 1234',
      rating: 4.7,
    },
    driver: {
      driverId: 'DRV-104',
      name: 'Antonio Reyes',
      vehicle: 'Honda Click - GHI 3456',
      phone: '+63 956 789 0123',
      assignedAt: '2025-02-16T09:20:00Z',
      acceptedAt: '2025-02-16T09:21:00Z',
    },
    route: {
      pickup: {
        address: 'Divisoria Market, Manila',
        lat: 14.6087,
        lng: 120.9722,
      },
      dropoff: {
        address: 'Bonifacio Global City, Taguig',
        lat: 14.5408,
        lng: 121.0503,
      },
      distance: 12.4,
      estimatedDuration: 55,
    },
    timeline: {
      bookedAt: '2025-02-16T09:20:00Z',
      assignedAt: '2025-02-16T09:20:00Z',
      acceptedAt: '2025-02-16T09:21:00Z',
    },
    pricing: {
      baseFare: 50,
      distanceFare: 124,
      timeFare: 45,
      surge: 25,
      discount: 0,
      total: 244,
      paymentMethod: 'Wallet',
      isPaid: true,
    },
    flags: {
      isPrioritized: true,
      isScheduled: false,
      hasSpecialRequirements: true,
      requiresVerification: true,
    },
    notes: 'Urgent business documents - requires signature',
    createdAt: '2025-02-16T09:20:00Z',
    updatedAt: '2025-02-16T09:21:00Z',
  },
  {
    orderId: 'ORD-2025-007',
    transactionId: 'TXN-7842162',
    status: 'Completed',
    serviceType: 'Taxi',
    priority: 'Normal',
    customer: {
      customerId: 'CUST-007',
      name: 'Sofia Mendoza',
      phone: '+63 918 901 2345',
      rating: 5.0,
    },
    driver: {
      driverId: 'DRV-105',
      name: 'Roberto Lim',
      vehicle: 'Toyota Innova - JKL 7890',
      phone: '+63 967 890 1234',
      assignedAt: '2025-02-16T07:30:00Z',
      acceptedAt: '2025-02-16T07:32:00Z',
      pickedUpAt: '2025-02-16T07:40:00Z',
    },
    route: {
      pickup: {
        address: 'Quezon Memorial Circle, Quezon City',
        lat: 14.6514,
        lng: 121.0498,
      },
      dropoff: {
        address: 'Makati Medical Center',
        lat: 14.5542,
        lng: 121.0154,
      },
      distance: 7.8,
      estimatedDuration: 32,
    },
    timeline: {
      bookedAt: '2025-02-16T07:30:00Z',
      assignedAt: '2025-02-16T07:30:00Z',
      acceptedAt: '2025-02-16T07:32:00Z',
      arrivedAt: '2025-02-16T07:38:00Z',
      pickedUpAt: '2025-02-16T07:40:00Z',
      completedAt: '2025-02-16T08:12:00Z',
    },
    pricing: {
      baseFare: 45,
      distanceFare: 78,
      timeFare: 28,
      surge: 0,
      discount: 10,
      total: 141,
      paymentMethod: 'Card',
      isPaid: true,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    createdAt: '2025-02-16T07:30:00Z',
    updatedAt: '2025-02-16T08:12:00Z',
  },
  {
    orderId: 'ORD-2025-008',
    transactionId: 'TXN-7842163',
    status: 'Arrived',
    serviceType: 'Moto',
    priority: 'Normal',
    customer: {
      customerId: 'CUST-008',
      name: 'Daniel Park',
      phone: '+63 919 012 3456',
      email: 'daniel.park@email.com',
      rating: 4.3,
    },
    driver: {
      driverId: 'DRV-106',
      name: 'Fernando Cruz',
      vehicle: 'Yamaha NMAX - MNO 2468',
      phone: '+63 978 901 2345',
      assignedAt: '2025-02-16T09:40:00Z',
      acceptedAt: '2025-02-16T09:42:00Z',
    },
    route: {
      pickup: {
        address: 'Eastwood City, Quezon City',
        lat: 14.6093,
        lng: 121.0794,
      },
      dropoff: {
        address: 'Gateway Mall, Araneta City',
        lat: 14.6208,
        lng: 121.0532,
      },
      distance: 4.2,
      estimatedDuration: 16,
    },
    timeline: {
      bookedAt: '2025-02-16T09:40:00Z',
      assignedAt: '2025-02-16T09:40:00Z',
      acceptedAt: '2025-02-16T09:42:00Z',
      arrivedAt: '2025-02-16T09:48:00Z',
    },
    pricing: {
      baseFare: 30,
      distanceFare: 33,
      timeFare: 10,
      surge: 0,
      discount: 0,
      total: 73,
      paymentMethod: 'Cash',
      isPaid: false,
    },
    flags: {
      isPrioritized: false,
      isScheduled: false,
      hasSpecialRequirements: false,
      requiresVerification: false,
    },
    createdAt: '2025-02-16T09:40:00Z',
    updatedAt: '2025-02-16T09:48:00Z',
  },
];

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  isLoading?: boolean;
}

function KpiCard({ title, value, subtext, icon, color, isLoading }: KpiCardProps) {
  const colorStyles = {
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-orange-500/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
  };

  if (isLoading) {
    return (
      <div className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div className={cn(
      "relative h-24 rounded-xl border bg-gradient-to-br p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg bg-current/10 shrink-0",
          color === 'green' && 'text-green-400',
          color === 'blue' && 'text-blue-400',
          color === 'amber' && 'text-amber-400',
          color === 'red' && 'text-red-400',
          color === 'purple' && 'text-purple-400'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Orders Map Panel Component (simplified for order locations)
function OrdersMapPanel({ orders }: { orders: Order[] }) {
  const activeOrders = orders.filter(o => 
    ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'].includes(o.status)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-xpress-text-primary flex items-center gap-2">
          <MapPin className="w-4 h-4 text-xpress-accent-blue" />
          Order Locations
        </h3>
        <span className="text-xs text-xpress-text-muted">
          {activeOrders.length} active
        </span>
      </div>
      
      {/* Map Placeholder - Using styled div as visual representation */}
      <div className="flex-1 bg-[#0a0a0f] rounded-xl border border-white/10 relative overflow-hidden min-h-[300px]">
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Mock map markers */}
        {activeOrders.slice(0, 5).map((order, idx) => (
          <div
            key={order.orderId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + (idx * 15) + Math.random() * 10}%`,
              top: `${30 + (idx % 3) * 20 + Math.random() * 10}%`,
            }}
          >
            <div className={cn(
              "w-4 h-4 rounded-full border-2 border-[#12121a] shadow-lg",
              order.status === 'OnTrip' && "bg-blue-500",
              order.status === 'EnRoute' && "bg-purple-500",
              order.status === 'Arrived' && "bg-green-500",
              order.status === 'Searching' && "bg-amber-500",
              order.status === 'Assigned' && "bg-cyan-500",
            )} />
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] text-gray-400 bg-[#1a1a2e]/90 px-1.5 py-0.5 rounded">
                {order.orderId.split('-')[2]}
              </span>
            </div>
          </div>
        ))}
        
        {/* Center marker (Manila area) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
        </div>
        
        {/* Map overlay info */}
        <div className="absolute bottom-3 left-3 bg-[#1a1a2e]/90 border border-white/10 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400">Metro Manila Area</p>
          <p className="text-xs text-white font-medium">Live Order Tracking</p>
        </div>
      </div>
      
      {/* Order Details List */}
      <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
        {activeOrders.slice(0, 3).map(order => (
          <div 
            key={order.orderId}
            className="bg-[#1a1a2e] border border-white/10 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">{order.orderId}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                order.status === 'OnTrip' && "bg-blue-500/20 text-blue-400",
                order.status === 'EnRoute' && "bg-purple-500/20 text-purple-400",
                order.status === 'Arrived' && "bg-green-500/20 text-green-400",
                order.status === 'Searching' && "bg-amber-500/20 text-amber-400",
                order.status === 'Assigned' && "bg-cyan-500/20 text-cyan-400",
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 truncate">
              {order.route.pickup.address}
            </p>
            {order.driver && (
              <p className="text-[10px] text-gray-500 mt-0.5">
                Driver: {order.driver.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateClick }: { onCreateClick?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No orders found</h3>
      <p className="text-sm text-gray-400 text-center max-w-md mb-6">
        There are no orders matching your current filters. Try adjusting your search or create a new order.
      </p>
      <div className="flex items-center gap-3">
        <XpressButton
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => window.location.reload()}
        >
          Refresh
        </XpressButton>
        {onCreateClick && (
          <XpressButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreateClick}
          >
            Create Order
          </XpressButton>
        )}
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Failed to load orders</h3>
      <p className="text-sm text-gray-400 text-center max-w-md mb-6">{error}</p>
      <XpressButton
        variant="primary"
        icon={<RefreshCw className="w-4 h-4" />}
        onClick={onRetry}
      >
        Try Again
      </XpressButton>
    </div>
  );
}

// Skeleton Loading Component
function OrdersSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl">
      <div className="text-sm text-gray-400">
        Showing <span className="text-white font-medium">{startItem}</span> to{' '}
        <span className="text-white font-medium">{endItem}</span> of{' '}
        <span className="text-white font-medium">{totalItems}</span> orders
      </div>
      
      <div className="flex items-center gap-2">
        <XpressButton
          variant="ghost"
          size="xs"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </XpressButton>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                  currentPage === pageNum
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <XpressButton
          variant="ghost"
          size="xs"
          trailingIcon={<ChevronRight className="w-4 h-4" />}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </XpressButton>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [filters, setFilters] = useState<OrderFiltersState>(defaultFilters);
  const [showHelp, setShowHelp] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const pageSize = 50;

  // Use mock data for demo - in production, this would come from API
  const [useMockData] = useState(true);
  
  // Build API filters
  const apiFilters = useMemo(() => {
    const result: Record<string, unknown> = {
      pageNumber: currentPage,
      pageSize,
    };

    if (filters.searchQuery) {
      result.searchQuery = filters.searchQuery;
    }
    if (filters.statuses.length > 0) {
      result.status = filters.statuses;
    }
    if (filters.serviceTypes.length > 0) {
      result.serviceType = filters.serviceTypes;
    }
    if (filters.priority.length > 0) {
      result.priority = filters.priority;
    }
    if (filters.startDate) {
      result.startDate = filters.startDate;
    }
    if (filters.endDate) {
      result.endDate = filters.endDate;
    }

    return result;
  }, [filters, currentPage]);

  // Fetch orders with auto-refresh
  const { 
    data: ordersData, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useOrders(apiFilters);
  
  // Use mock data if enabled, otherwise use API data
  const orders = useMockData ? mockOrders : (ordersData?.items || []);
  const totalPages = useMockData ? 1 : (ordersData?.totalPages || 1);
  const totalItems = useMockData ? mockOrders.length : (ordersData?.total || 0);
  
  const lastUpdatedText = useLastUpdatedText(dataUpdatedAt);

  // Filter orders based on active tab
  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return orders.filter(o => ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'].includes(o.status));
      case 'completed':
        return orders.filter(o => o.status === 'Completed');
      case 'cancelled':
        return orders.filter(o => o.status === 'Cancelled');
      default:
        return orders;
    }
  }, [orders, activeTab]);

  // Batch selection
  const selection = useBatchSelection({
    items: filteredOrders,
    getItemId: (order) => order.orderId,
  });

  // Mutations
  const assignDriverMutation = useAssignDriver();
  const bulkCancelMutation = useBulkCancelOrders();
  const bulkAssignMutation = useBulkAssignDriver();

  // Assign driver flow for single order
  const assignFlow = useAssignDriverFlow(
    selectedOrderForAssign?.orderId || '',
    selectedOrderForAssign?.route.pickup
      ? { lat: selectedOrderForAssign.route.pickup.lat, lng: selectedOrderForAssign.route.pickup.lng }
      : null
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      CommonShortcuts.search(() => {
        searchInputRef.current?.focus();
      }),
      CommonShortcuts.refresh(() => {
        refetch();
        showInfo('Refreshing orders...');
      }),
      CommonShortcuts.help(() => setShowHelp(true)),
      CommonShortcuts.selectAll(() => selection.selectAll()),
      CommonShortcuts.deselectAll(() => selection.deselectAll()),
      {
        key: 'v',
        handler: () => setViewMode(prev => prev === 'table' ? 'grid' : 'table'),
        description: 'Toggle view mode',
      },
      {
        key: 'Escape',
        handler: () => {
          if (showHelp) setShowHelp(false);
          else if (assignModalOpen) setAssignModalOpen(false);
          else if (cancelModalOpen) setCancelModalOpen(false);
          else if (selection.hasSelection) selection.deselectAll();
        },
        allowInInput: true,
      },
    ],
  });

  // Filter handlers
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  // Action handlers
  const handleAssignClick = useCallback((orderId: string) => {
    const order = filteredOrders.find((o) => o.orderId === orderId);
    if (order) {
      setSelectedOrderForAssign(order);
      setAssignModalOpen(true);
    }
  }, [filteredOrders]);

  const handleCancelClick = useCallback((orderId: string) => {
    selection.select(orderId);
    setCancelModalOpen(true);
  }, [selection]);

  const handleBulkCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      showError('Please provide a cancellation reason');
      return;
    }

    try {
      await bulkCancelMutation.mutateAsync({
        orderIds: selection.selectedIds,
        reason: cancelReason,
      });
      showSuccess(`Cancelled ${selection.selectedCount} orders`);
      selection.deselectAll();
      setCancelModalOpen(false);
      setCancelReason('');
    } catch {
      // Error handled by mutation
    }
  }, [bulkCancelMutation, selection, cancelReason]);

  const handleBulkAssign = useCallback(() => {
    if (selection.selectedIds.length > 0) {
      const firstOrder = filteredOrders.find((o) => o.orderId === selection.selectedIds[0]);
      if (firstOrder) {
        setSelectedOrderForAssign(firstOrder);
        setAssignModalOpen(true);
      }
    }
  }, [selection.selectedIds, filteredOrders]);

  const handleAssignDriver = useCallback(async (): Promise<boolean> => {
    if (!assignFlow.selectedDriver) return false;

    try {
      if (selection.selectedIds.length > 1) {
        await bulkAssignMutation.mutateAsync({
          orderIds: selection.selectedIds,
          riderId: assignFlow.selectedDriver.riderId || assignFlow.selectedDriver.driverId,
        });
        selection.deselectAll();
      } else if (selectedOrderForAssign) {
        await assignDriverMutation.mutateAsync({
          orderId: selectedOrderForAssign.orderId,
          riderId: assignFlow.selectedDriver.riderId || assignFlow.selectedDriver.driverId,
          notes: assignFlow.assignNotes,
        });
      }
      setAssignModalOpen(false);
      setSelectedOrderForAssign(null);
      return true;
    } catch {
      return false;
    }
  }, [
    assignFlow.selectedDriver,
    assignFlow.assignNotes,
    selection.selectedIds,
    selectedOrderForAssign,
    bulkAssignMutation,
    assignDriverMutation,
    selection,
  ]);

  const handleSelectDriver = useCallback((driver: NearbyDriver) => {
    assignFlow.handleSelectDriver(driver);
  }, [assignFlow]);

  // Stats for KPI Ribbon
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter((o) => ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'].includes(o.status)).length;
    const completedToday = orders.filter((o) => o.status === 'Completed').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
    const revenueToday = orders
      .filter((o) => o.status === 'Completed')
      .reduce((sum, o) => sum + o.pricing.total, 0);
    
    return { total, active, completedToday, cancelled, revenueToday };
  }, [orders]);

  const kpiData = [
    {
      title: 'Total Orders',
      shortTitle: 'Total',
      value: stats.total,
      subtext: 'All time orders',
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Active / Pending',
      shortTitle: 'Active',
      value: stats.active,
      subtext: 'Orders in progress',
      icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'amber' as const,
    },
    {
      title: 'Completed Today',
      shortTitle: 'Completed',
      value: stats.completedToday,
      subtext: 'Successfully delivered',
      icon: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'green' as const,
    },
    {
      title: 'Cancelled / Failed',
      shortTitle: 'Cancelled',
      value: stats.cancelled,
      subtext: 'Requires attention',
      icon: <Ban className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'red' as const,
    },
    {
      title: 'Revenue Today',
      shortTitle: 'Revenue',
      value: `₱${stats.revenueToday.toLocaleString()}`,
      subtext: 'Total earnings',
      icon: <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'purple' as const,
    },
  ];

  const tabs = [
    { id: 'all' as OrderTab, label: 'All Orders', count: orders.length },
    { id: 'active' as OrderTab, label: 'Active', count: stats.active },
    { id: 'completed' as OrderTab, label: 'Completed', count: stats.completedToday },
    { id: 'cancelled' as OrderTab, label: 'Cancelled', count: stats.cancelled },
  ];

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <OrdersSkeleton viewMode={viewMode} />;
    }

    if (error) {
      return <ErrorState error={error.message} onRetry={() => refetch()} />;
    }

    if (filteredOrders.length === 0) {
      return <EmptyState onCreateClick={() => navigate('/orders/create')} />;
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              onAssignClick={handleAssignClick}
              onCancelClick={handleCancelClick}
            />
          ))}
        </div>
      );
    }

    return (
      <XpressCard className="overflow-hidden p-0">
        <OrdersTable
          orders={filteredOrders}
          isLoading={false}
          onSelectionChange={selection.toggleSelection}
          selectedIds={selection.selectedIds}
          onAssignClick={handleAssignClick}
          onCancelClick={handleCancelClick}
        />
      </XpressCard>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-xpress-text-primary">Orders Management</h1>
          <p className="text-sm text-xpress-text-muted">
            Track and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Last updated indicator - hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-xpress-text-muted">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdatedText}</span>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={() => {
              refetch();
              showInfo('Refreshing orders...');
            }}
            disabled={isFetching}
            className={cn(
              'flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-sm',
              'bg-xpress-bg-tertiary border border-xpress-border',
              'text-xpress-text-secondary hover:text-xpress-text-primary',
              'transition-colors disabled:opacity-50',
              isFetching && 'cursor-wait'
            )}
            title="Refresh data (R)"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <XpressButton 
            variant="primary" 
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/orders/create')}
            className="min-h-[44px]"
          >
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
          </XpressButton>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} isLoading={isLoading} />
        ))}
      </div>

      {/* Loading indicator for background refresh */}
      {isFetching && !isLoading && (
        <div className="flex items-center gap-2 text-xs text-xpress-text-muted animate-pulse">
          <div className="w-2 h-2 bg-xpress-accent-blue rounded-full" />
          <span>Syncing data...</span>
        </div>
      )}

      {/* Main Content: Responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: Full width on mobile, 60% on desktop */}
        <div className="w-full lg:w-[60%] flex flex-col min-h-0 overflow-hidden">
          {/* Search + View Toggle Bar */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <Input
                ref={searchInputRef}
                placeholder="Search orders... (Ctrl+K)"
                fullWidth
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                icon={<Search className="w-4 h-4 text-gray-500" />}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="bg-[#12121a] border-white/10"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#12121a] border border-white/10 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 rounded-md transition-all min-h-[36px] min-w-[36px] flex items-center justify-center",
                  viewMode === 'table' 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-gray-400 hover:text-white"
                )}
                title="Table view (V)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all min-h-[36px] min-w-[36px] flex items-center justify-center",
                  viewMode === 'grid' 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "text-gray-400 hover:text-white"
                )}
                title="Grid view (V)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            
            <XpressButton
              variant="ghost"
              size="xs"
              onClick={() => setShowHelp(true)}
              title="Keyboard shortcuts (?)"
            >
              ?
            </XpressButton>
          </div>

          {/* Filters */}
          <OrderFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
            resultCount={filteredOrders.length}
          />

          {/* Tab Navigation - Scrollable on mobile */}
          <div className="border-b border-white/10 mb-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap min-h-[44px]",
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  )}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'all' ? 'All' : tab.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px]",
                    activeTab === tab.id 
                      ? "bg-blue-500/20 text-blue-400" 
                      : "bg-white/10 text-gray-400"
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders Content */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {renderContent()}
          </div>

          {/* Pagination */}
          {!isLoading && !error && filteredOrders.length > 0 && !useMockData && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Right Panel: Hidden on mobile, 40% on desktop */}
        <div className="hidden lg:flex w-[40%] flex-col min-h-0 overflow-hidden">
          <OrdersMapPanel orders={orders} />
        </div>
      </div>

      {/* Batch Action Bar */}
      {selection.hasSelection && (
        <OrdersBatchActions
          selectedCount={selection.selectedCount}
          totalCount={filteredOrders.length}
          isAllSelected={selection.isAllSelected}
          onClear={selection.deselectAll}
          onSelectAll={selection.selectAll}
          onBulkCancel={() => setCancelModalOpen(true)}
          onBulkAssign={handleBulkAssign}
          isLoading={bulkCancelMutation.isPending || bulkAssignMutation.isPending}
        />
      )}

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedOrderForAssign(null);
          assignFlow.handleClearSelection();
        }}
        order={selectedOrderForAssign}
        selectedDriverId={assignFlow.selectedDriver?.riderId || null}
        onSelectDriver={handleSelectDriver}
        onAssign={handleAssignDriver}
        isAssigning={assignFlow.isAssigning || bulkAssignMutation.isPending}
        assignNotes={assignFlow.assignNotes}
        onAssignNotesChange={assignFlow.setAssignNotes}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Cancel ${selection.selectedCount} Order(s)`}
        size="sm"
        footer={
          <>
            <XpressButton variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={bulkCancelMutation.isPending}>
              Keep Orders
            </XpressButton>
            <XpressButton
              variant="danger"
              onClick={handleBulkCancel}
              loading={bulkCancelMutation.isPending}
              icon={<XCircle className="w-4 h-4" />}
            >
              Cancel Orders
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-white">
              You are about to cancel {selection.selectedCount} order(s). This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Cancellation Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full bg-[#12121a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-[#12121a] border border-white/10 rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Keyboard Shortcuts
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Search</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Refresh</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">R</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Select All</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">Ctrl+A</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Deselect All</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">Ctrl+D</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Toggle View</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">V</kbd>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-gray-400">Close / Cancel</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Help</span>
                <kbd className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs">?</kbd>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Tip: Hold Shift and click to select a range of items
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
