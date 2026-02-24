import { useNavigate } from 'react-router-dom';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressButton } from '@/components/ui/XpressButton';
import type { Order, OrderStatus } from '@/types/domain.types';
import {
  MapPin,
  Navigation,
  User,
  Car,
  Clock,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow, formatCurrency } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface OrderCardProps {
  order: Order;
  onAssignClick?: (orderId: string) => void;
  onCancelClick?: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { 
  variant: 'active' | 'warning' | 'alert' | 'info' | 'idle'; 
  label: string;
  color: string;
}> = {
  Searching: { variant: 'warning', label: 'Searching', color: 'text-amber-400' },
  Assigned: { variant: 'info', label: 'Assigned', color: 'text-blue-400' },
  Accepted: { variant: 'info', label: 'Accepted', color: 'text-blue-400' },
  EnRoute: { variant: 'active', label: 'En Route', color: 'text-green-400' },
  Arrived: { variant: 'active', label: 'Arrived', color: 'text-green-400' },
  OnTrip: { variant: 'active', label: 'On Trip', color: 'text-green-400' },
  InTransit: { variant: 'active', label: 'In Transit', color: 'text-green-400' },
  Completed: { variant: 'active', label: 'Completed', color: 'text-green-400' },
  Delivered: { variant: 'active', label: 'Delivered', color: 'text-green-400' },
  Cancelled: { variant: 'alert', label: 'Cancelled', color: 'text-red-400' },
  Scheduled: { variant: 'warning', label: 'Scheduled', color: 'text-amber-400' },
  Pending: { variant: 'warning', label: 'Pending', color: 'text-amber-400' },
};

export function OrderCard({ order, onAssignClick, onCancelClick }: OrderCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[order.status];
  
  const canAssign = ['Searching', 'Pending', 'Scheduled'].includes(order.status);
  const canCancel = !['Completed', 'Cancelled'].includes(order.status);

  const handleClick = () => {
    navigate(`/orders/${order.orderId}`);
  };

  return (
    <XpressCard
      hoverable
      onClick={handleClick}
      className={cn(
        'cursor-pointer group',
        order.status === 'Cancelled' && 'opacity-75'
      )}
    >
      {/* Header - Order ID & Status */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-400 text-sm">{order.orderId}</span>
            {order.flags.isPrioritized && (
              <XpressBadge variant="alert" size="sm">Priority</XpressBadge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(order.createdAt)}
          </div>
        </div>
        <XpressBadge variant={status.variant} size="sm" pulse={['Searching', 'EnRoute', 'OnTrip'].includes(order.status)}>
          {status.label}
        </XpressBadge>
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{order.customer.name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Phone className="w-3 h-3" />
            {order.customer.phone}
          </div>
        </div>
      </div>

      {/* Driver Info (if assigned) */}
      {order.driver ? (
        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Car className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{order.driver.name}</p>
            <p className="text-xs text-gray-400 truncate">{order.driver.vehicle}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-400">No driver assigned</span>
        </div>
      )}

      {/* Route Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-gray-300 line-clamp-2">{order.route.pickup.address}</span>
        </div>
        <div className="flex items-start gap-2">
          <Navigation className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-gray-300 line-clamp-2">{order.route.dropoff.address}</span>
        </div>
      </div>

      {/* Footer - Service Type, Price & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <XpressBadge variant="default" size="sm">{order.serviceType}</XpressBadge>
          <span className="text-sm font-semibold text-cyan-400">
            {formatCurrency(order.pricing.total)}
          </span>
        </div>
        
        {/* Quick Actions */}
        <div 
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {canAssign && onAssignClick && (
            <XpressButton
              variant="secondary"
              size="xs"
              icon={<CheckCircle2 className="w-3 h-3" />}
              onClick={() => onAssignClick(order.orderId)}
            >
              Assign
            </XpressButton>
          )}
          {canCancel && onCancelClick && (
            <XpressButton
              variant="danger"
              size="xs"
              icon={<XCircle className="w-3 h-3" />}
              onClick={() => onCancelClick(order.orderId)}
            >
              Cancel
            </XpressButton>
          )}
        </div>
      </div>
    </XpressCard>
  );
}

export default OrderCard;
