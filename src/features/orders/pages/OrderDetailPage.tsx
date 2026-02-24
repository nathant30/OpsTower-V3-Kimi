import { useParams, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';

import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { AssignDriverModal } from '@/features/orders/components/AssignDriverModal';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { Modal } from '@/components/ui/Modal';
import { useOrder, useOrderActions } from '@/features/orders/hooks/useOrder';
import { useAssignDriver, useAssignDriverFlow } from '@/features/orders/hooks/useAssignDriver';
import { usePermissionCheck } from '@/components/auth';
import { showSuccess, showError, showInfo } from '@/lib/stores/ui.store';
import type { NearbyDriver } from '@/features/orders/hooks/useOrders';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDateTime, formatDistance, formatDuration } from '@/lib/utils/date';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowLeft,
  RefreshCw,

  MapPin,
  Navigation,
  User,
  Car,
  Phone,
  Mail,
  Star,
  DollarSign,
  CreditCard,
  Package,
  Clock,
  UserCheck,
  Calendar,
} from 'lucide-react';
import type { OrderStatus } from '@/types/domain.types';

// Status Configuration
const statusConfig: Record<OrderStatus, { 
  color: string; 
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode; 
  label: string;
  variant: 'active' | 'warning' | 'alert' | 'info' | 'idle';
}> = {
  Searching: { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: <Clock className="w-5 h-5" />, 
    label: 'Searching Driver',
    variant: 'warning'
  },
  Assigned: { 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: <UserCheck className="w-5 h-5" />, 
    label: 'Driver Assigned',
    variant: 'info'
  },
  Accepted: { 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: <CheckCircle2 className="w-5 h-5" />, 
    label: 'Driver Accepted',
    variant: 'info'
  },
  EnRoute: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <Navigation className="w-5 h-5" />, 
    label: 'En Route to Pickup',
    variant: 'active'
  },
  Arrived: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <MapPin className="w-5 h-5" />, 
    label: 'Arrived at Pickup',
    variant: 'active'
  },
  OnTrip: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <Car className="w-5 h-5" />, 
    label: 'On Trip',
    variant: 'active'
  },
  InTransit: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <Car className="w-5 h-5" />, 
    label: 'In Transit',
    variant: 'active'
  },
  Completed: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <CheckCircle2 className="w-5 h-5" />, 
    label: 'Completed',
    variant: 'active'
  },
  Delivered: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <CheckCircle2 className="w-5 h-5" />, 
    label: 'Delivered',
    variant: 'active'
  },
  Cancelled: { 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: <XCircle className="w-5 h-5" />, 
    label: 'Cancelled',
    variant: 'alert'
  },
  Scheduled: { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: <Calendar className="w-5 h-5" />, 
    label: 'Scheduled',
    variant: 'warning'
  },
  Pending: { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: <Clock className="w-5 h-5" />, 
    label: 'Pending',
    variant: 'warning'
  },
};

// Route Map Placeholder Component
function RouteMapPlaceholder({ order: _order }: { order: { route: { pickup: { lat: number; lng: number }; dropoff: { lat: number; lng: number } } } }) {
  return (
    <div className="relative h-64 bg-[#0a0a0f] rounded-xl border border-white/10 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2a2a45 1px, transparent 1px),
            linear-gradient(to bottom, #2a2a45 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Route Line */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <line
          x1="20%"
          y1="70%"
          x2="80%"
          y2="30%"
          stroke="url(#routeGradient)"
          strokeWidth="3"
          strokeDasharray="8 4"
          className="animate-pulse"
        />
      </svg>
      
      {/* Pickup Point */}
      <div className="absolute left-[20%] top-[70%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-30" />
        </div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-green-400 font-medium">Pickup</span>
        </div>
      </div>
      
      {/* Dropoff Point */}
      <div className="absolute left-[80%] top-[30%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-500 animate-ping opacity-30" />
        </div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-red-400 font-medium">Dropoff</span>
        </div>
      </div>
      
      {/* Map Label */}
      <div className="absolute bottom-3 right-3">
        <span className="text-xs text-gray-500">Live Map Integration</span>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-8 rounded-lg bg-white/5 animate-pulse" />
            <div className="w-32 h-4 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-24 h-10 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-80 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { checkPermission } = usePermissionCheck();

  // State for modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [prioritizeModalOpen, setPrioritizeModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [prioritizeReason, setPrioritizeReason] = useState('');
  const [prioritizeLevel, setPrioritizeLevel] = useState<'High' | 'Urgent'>('High');

  // Fetch order data
  const { data: order, isLoading, refetch } = useOrder(orderId || '', { enablePolling: true });

  // Actions
  const orderActions = useOrderActions(orderId || '');
  const assignMutation = useAssignDriver();

  // Assign driver flow
  const assignFlow = useAssignDriverFlow(
    orderId || '',
    order?.route?.pickup
      ? { lat: order.route.pickup.lat, lng: order.route.pickup.lng }
      : null
  );

  // Permission checks
  const canAssign = checkPermission('assign:drivers', 'assign drivers to orders');
  const canCancel = checkPermission('cancel:orders', 'cancel orders');
  const canComplete = true;
  const canPrioritize = true;

  // Handlers
  const handleAssignClick = useCallback(() => {
    if (!canAssign) return;
    setAssignModalOpen(true);
  }, [canAssign]);

  const handleCancelClick = useCallback(() => {
    if (!canCancel) return;
    setCancelModalOpen(true);
  }, [canCancel]);

  const handleCompleteClick = useCallback(() => {
    if (!canComplete) return;
    setCompleteModalOpen(true);
  }, [canComplete]);

  const handlePrioritizeClick = useCallback(() => {
    if (!canPrioritize) return;
    setPrioritizeModalOpen(true);
  }, [canPrioritize]);

  const handleSelectDriver = useCallback((driver: NearbyDriver) => {
    assignFlow.handleSelectDriver(driver);
  }, [assignFlow]);

  const handleAssign = useCallback(async (): Promise<boolean> => {
    if (!assignFlow.selectedDriver || !orderId) return false;

    try {
      await assignMutation.mutateAsync({
        orderId,
        riderId: assignFlow.selectedDriver.riderId || assignFlow.selectedDriver.driverId,
        notes: assignFlow.assignNotes,
      });
      setAssignModalOpen(false);
      assignFlow.handleClearSelection();
      return true;
    } catch {
      return false;
    }
  }, [assignFlow, orderId, assignMutation]);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      showError('Please provide a cancellation reason');
      return;
    }

    try {
      await orderActions.cancelOrder.mutateAsync({
        reason: cancelReason,
        notes: cancelReason,
      });
      showSuccess('Order cancelled successfully');
      setCancelModalOpen(false);
      setCancelReason('');
    } catch {
      // Error handled by mutation
    }
  }, [orderActions.cancelOrder, cancelReason]);

  const handleConfirmComplete = useCallback(async () => {
    try {
      await orderActions.completeOrder.mutateAsync({
        notes: completeNotes,
      });
      showSuccess('Order completed successfully');
      setCompleteModalOpen(false);
      setCompleteNotes('');
    } catch {
      // Error handled by mutation
    }
  }, [orderActions.completeOrder, completeNotes]);

  const handleConfirmPrioritize = useCallback(async () => {
    if (!prioritizeReason.trim()) {
      showError('Please provide a reason for prioritization');
      return;
    }

    try {
      await orderActions.prioritizeOrder.mutateAsync({
        priority: prioritizeLevel,
        reason: prioritizeReason,
      });
      showSuccess(`Order prioritized to ${prioritizeLevel}`);
      setPrioritizeModalOpen(false);
      setPrioritizeReason('');
    } catch {
      // Error handled by mutation
    }
  }, [orderActions.prioritizeOrder, prioritizeLevel, prioritizeReason]);

  // Loading state
  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  // Not found state
  if (!order) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
          <p className="text-gray-400 mb-6">
            The order you are looking for does not exist or has been removed.
          </p>
          <XpressButton variant="primary" onClick={() => navigate('/orders')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Orders
          </XpressButton>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    icon: <Clock className="w-5 h-5" />, 
    label: order.status || 'Unknown',
    variant: 'idle' as const
  };
  const isActionLoading =
    orderActions.cancelOrder.isPending ||
    orderActions.completeOrder.isPending ||
    orderActions.prioritizeOrder.isPending;

  const canAssignStatus = ['Searching', 'Pending', 'Scheduled'].includes(order.status);
  const canCancelStatus = !['Completed', 'Cancelled'].includes(order.status);
  const canCompleteStatus = ['OnTrip', 'Arrived', 'EnRoute'].includes(order.status);
  const canPrioritizeStatus = !['Completed', 'Cancelled'].includes(order.status) && order.priority !== 'Urgent';

  return (
    <div className="space-y-6">
      {/* Header with Order ID and Status */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <XpressButton 
            variant="ghost" 
            onClick={() => navigate('/orders')} 
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </XpressButton>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-mono">{order.orderId}</h1>
              <XpressBadge variant={status.variant} pulse={['Searching', 'EnRoute', 'OnTrip'].includes(order.status)}>
                {status.label}
              </XpressBadge>
              {order.flags?.isPrioritized && (
                <XpressBadge variant="alert">
                  <Flag className="w-3 h-3 mr-1" />
                  Prioritized
                </XpressBadge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Transaction: <span className="font-mono text-gray-300">{order.transactionId || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <XpressButton
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              refetch();
              showInfo('Refreshing order...');
            }}
          >
            Refresh
          </XpressButton>
          
          {canPrioritizeStatus && canPrioritize && (
            <XpressButton
              variant="secondary"
              icon={<Flag className="w-4 h-4" />}
              onClick={handlePrioritizeClick}
              disabled={isActionLoading}
            >
              Prioritize
            </XpressButton>
          )}
          
          {canAssignStatus && canAssign && (
            <XpressButton
              variant="primary"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={handleAssignClick}
              disabled={isActionLoading}
            >
              Assign Driver
            </XpressButton>
          )}
          
          {canCompleteStatus && canComplete && (
            <XpressButton
              variant="success"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleCompleteClick}
              disabled={isActionLoading}
            >
              Complete
            </XpressButton>
          )}
          
          {canCancelStatus && canCancel && (
            <XpressButton
              variant="danger"
              icon={<XCircle className="w-4 h-4" />}
              onClick={handleCancelClick}
              disabled={isActionLoading}
            >
              Cancel
            </XpressButton>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-4 border',
        status.bgColor,
        status.borderColor
      )}>
        <div className={cn('p-3 rounded-full bg-[#12121a]', status.color)}>
          {status.icon}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">{status.label}</h2>
          <p className="text-sm text-gray-400">
            Service: <span className="text-gray-300">{order.serviceType}</span>
            {order.timeline?.bookedAt && (
              <span className="ml-3">
                Booked: {formatDateTime(order.timeline.bookedAt)}
              </span>
            )}
          </p>
        </div>
        {order.priority && order.priority !== 'Normal' && (
          <XpressBadge variant={order.priority === 'Urgent' ? 'alert' : 'warning'}>
            {order.priority} Priority
          </XpressBadge>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Driver Info */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <XpressCard title="Customer" icon={<User className="w-4 h-4" />}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-400">
                    {order.customer?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{order.customer?.name || 'Unknown'}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Star className="w-3 h-3 text-amber-400" />
                    {order.customer?.rating?.toFixed(1) || '0.0'} rating
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-white/10 space-y-2">
                {order.customer?.phone && (
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {order.customer.phone}
                  </a>
                )}
                {order.customer?.email && (
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {order.customer.email}
                  </a>
                )}
              </div>
            </div>
          </XpressCard>

          {/* Driver Assignment Card */}
          <XpressCard 
            title="Driver Assignment" 
            icon={<Car className="w-4 h-4" />}
            badge={order.driver ? 'Assigned' : 'Unassigned'}
            badgeVariant={order.driver ? 'success' : 'warning'}
          >
            {order.driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-400">
                      {order.driver?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{order.driver?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{order.driver?.vehicle || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/10 space-y-2">
                  {order.driver?.phone && (
                    <a
                      href={`tel:${order.driver.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {order.driver.phone}
                    </a>
                  )}
                  {order.driver?.assignedAt && (
                    <p className="text-xs text-gray-500">
                      Assigned: {formatDateTime(order.driver.assignedAt)}
                    </p>
                  )}
                  {order.driver?.acceptedAt && (
                    <p className="text-xs text-gray-500">
                      Accepted: {formatDateTime(order.driver.acceptedAt)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-gray-400 mb-4">No driver assigned yet</p>
                {canAssignStatus && canAssign && (
                  <XpressButton variant="primary" onClick={handleAssignClick}>
                    Assign Driver
                  </XpressButton>
                )}
              </div>
            )}
          </XpressCard>

          {/* Pricing Card */}
          <XpressCard title="Pricing Breakdown" icon={<DollarSign className="w-4 h-4" />}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Base Fare</span>
                <span className="text-white">{formatCurrency(order.pricing?.baseFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Distance Fare</span>
                <span className="text-white">{formatCurrency(order.pricing?.distanceFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time Fare</span>
                <span className="text-white">{formatCurrency(order.pricing?.timeFare)}</span>
              </div>
              {order.pricing?.surge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Surge</span>
                  <span className="text-amber-400">+{formatCurrency(order.pricing.surge)}</span>
                </div>
              )}
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount</span>
                  <span className="text-green-400">-{formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-cyan-400">{formatCurrency(order.pricing?.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 pt-2">
                <CreditCard className="w-4 h-4" />
                {order.pricing?.paymentMethod || 'N/A'}
                <XpressBadge 
                  variant={order.pricing?.isPaid ? 'active' : 'warning'} 
                  size="sm"
                  className="ml-auto"
                >
                  {order.pricing?.isPaid ? 'Paid' : 'Unpaid'}
                </XpressBadge>
              </div>
            </div>
          </XpressCard>
        </div>

        {/* Right Column - Route, Map & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Map Card */}
          <XpressCard title="Route Map" icon={<Navigation className="w-4 h-4" />}>
            <RouteMapPlaceholder order={order} />
            
            {/* Route Details */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-gray-500 mb-1">Distance</p>
                <p className="text-lg font-semibold text-white">
                  {formatDistance(order.route?.distance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Est. Duration</p>
                <p className="text-lg font-semibold text-white">
                  {formatDuration(order.route?.estimatedDuration)}
                </p>
              </div>
              {order.route?.actualDuration && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Actual Duration</p>
                  <p className={cn(
                    'text-lg font-semibold',
                    order.route.actualDuration > (order.route?.estimatedDuration || 0)
                      ? 'text-red-400'
                      : 'text-green-400'
                  )}>
                    {formatDuration(order.route.actualDuration)}
                  </p>
                </div>
              )}
            </div>
          </XpressCard>

          {/* Pickup & Dropoff Card */}
          <XpressCard title="Route Information" icon={<MapPin className="w-4 h-4" />}>
            <div className="space-y-4">
              {/* Pickup */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="w-0.5 h-full bg-white/10 my-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Pickup Location</p>
                  <p className="text-white font-medium">{order.route?.pickup?.address || 'N/A'}</p>
                  {order.route?.pickup?.name && (
                    <p className="text-sm text-gray-400">{order.route.pickup.name}</p>
                  )}
                  {order.route?.pickup?.notes && (
                    <p className="text-sm text-amber-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {order.route.pickup.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Dropoff */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase mb-1">Dropoff Location</p>
                  <p className="text-white font-medium">{order.route?.dropoff?.address || 'N/A'}</p>
                  {order.route?.dropoff?.name && (
                    <p className="text-sm text-gray-400">{order.route.dropoff.name}</p>
                  )}
                  {order.route?.dropoff?.notes && (
                    <p className="text-sm text-amber-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {order.route.dropoff.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </XpressCard>

          {/* Timeline Card */}
          <XpressCard title="Order Timeline" icon={<Clock className="w-4 h-4" />}>
            <OrderTimeline timeline={order.timeline} status={order.status} />
          </XpressCard>

          {/* Notes Card */}
          {order.notes && (
            <XpressCard title="Additional Notes" icon={<Package className="w-4 h-4" />}>
              <p className="text-gray-300 whitespace-pre-wrap">{order.notes}</p>
            </XpressCard>
          )}
        </div>
      </div>

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          assignFlow.handleClearSelection();
        }}
        order={order}
        selectedDriverId={assignFlow.selectedDriver?.riderId || null}
        onSelectDriver={handleSelectDriver}
        onAssign={handleAssign}
        isAssigning={assignFlow.isAssigning}
        assignNotes={assignFlow.assignNotes}
        onAssignNotesChange={assignFlow.setAssignNotes}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
        size="sm"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => setCancelModalOpen(false)}
              disabled={orderActions.cancelOrder.isPending}
            >
              Keep Order
            </XpressButton>
            <XpressButton
              variant="danger"
              onClick={handleConfirmCancel}
              loading={orderActions.cancelOrder.isPending}
              icon={<XCircle className="w-4 h-4" />}
            >
              Cancel Order
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-white">
              Are you sure you want to cancel this order? This action cannot be undone.
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

      {/* Complete Confirmation Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Order"
        size="sm"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => setCompleteModalOpen(false)}
              disabled={orderActions.completeOrder.isPending}
            >
              Cancel
            </XpressButton>
            <XpressButton
              variant="success"
              onClick={handleConfirmComplete}
              loading={orderActions.completeOrder.isPending}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Complete Order
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <p className="text-sm text-white">
              Mark this order as completed? Ensure the delivery has been successfully finished.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Completion Notes (optional)
            </label>
            <textarea
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="Add any notes about the completion..."
              className="w-full bg-[#12121a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Prioritize Modal */}
      <Modal
        isOpen={prioritizeModalOpen}
        onClose={() => setPrioritizeModalOpen(false)}
        title="Prioritize Order"
        size="sm"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => setPrioritizeModalOpen(false)}
              disabled={orderActions.prioritizeOrder.isPending}
            >
              Cancel
            </XpressButton>
            <XpressButton
              variant="primary"
              onClick={handleConfirmPrioritize}
              loading={orderActions.prioritizeOrder.isPending}
              icon={<Flag className="w-4 h-4" />}
            >
              Set Priority
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Flag className="w-5 h-5 text-amber-400" />
            <p className="text-sm text-white">
              Set priority level for this order to ensure faster assignment and handling.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Priority Level
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPrioritizeLevel('High')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border',
                  prioritizeLevel === 'High'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-[#12121a] text-gray-400 border-white/10 hover:border-white/20'
                )}
              >
                High
              </button>
              <button
                onClick={() => setPrioritizeLevel('Urgent')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all border',
                  prioritizeLevel === 'Urgent'
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-[#12121a] text-gray-400 border-white/10 hover:border-white/20'
                )}
              >
                Urgent
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={prioritizeReason}
              onChange={(e) => setPrioritizeReason(e.target.value)}
              placeholder="Explain why this order needs priority..."
              className="w-full bg-[#12121a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[100px] resize-y"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
