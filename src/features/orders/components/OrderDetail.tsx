import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderTimeline } from './OrderTimeline';
import type { Order, OrderStatus } from '@/types/domain.types';
import {
  MapPin,
  Navigation,
  User,
  Phone,
  Mail,
  Car,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Star,
  ArrowLeft,
  UserCheck,
  XCircle,
  Flag,
} from 'lucide-react';
import { formatCurrency, formatDateTime, formatDistance, formatDuration } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface OrderDetailProps {
  order: Order;
  onAssignClick?: () => void;
  onCancelClick?: () => void;
  onCompleteClick?: () => void;
  onPrioritizeClick?: () => void;
  isLoading?: boolean;
}

const statusConfig: Record<OrderStatus, { color: string; icon: React.ReactNode; label: string }> = {
  Searching: { color: 'text-xpress-status-warning', icon: <Clock className="w-5 h-5" />, label: 'Searching Driver' },
  Assigned: { color: 'text-xpress-status-idle', icon: <UserCheck className="w-5 h-5" />, label: 'Driver Assigned' },
  Accepted: { color: 'text-xpress-status-idle', icon: <CheckCircle2 className="w-5 h-5" />, label: 'Driver Accepted' },
  EnRoute: { color: 'text-xpress-status-active', icon: <Navigation className="w-5 h-5" />, label: 'En Route to Pickup' },
  Arrived: { color: 'text-xpress-status-active', icon: <MapPin className="w-5 h-5" />, label: 'Arrived at Pickup' },
  OnTrip: { color: 'text-xpress-status-active', icon: <Car className="w-5 h-5" />, label: 'On Trip' },
  InTransit: { color: 'text-xpress-status-active', icon: <Car className="w-5 h-5" />, label: 'In Transit' },
  Completed: { color: 'text-xpress-status-active', icon: <CheckCircle2 className="w-5 h-5" />, label: 'Completed' },
  Delivered: { color: 'text-xpress-status-active', icon: <CheckCircle2 className="w-5 h-5" />, label: 'Delivered' },
  Cancelled: { color: 'text-xpress-status-alert', icon: <XCircle className="w-5 h-5" />, label: 'Cancelled' },
  Scheduled: { color: 'text-xpress-status-warning', icon: <Clock className="w-5 h-5" />, label: 'Scheduled' },
  Pending: { color: 'text-xpress-status-warning', icon: <Clock className="w-5 h-5" />, label: 'Pending' },
};

export function OrderDetail({
  order,
  onAssignClick,
  onCancelClick,
  onCompleteClick,
  onPrioritizeClick,
  isLoading,
}: OrderDetailProps) {
  const navigate = useNavigate();
  const status = statusConfig[order.status];

  const canAssign = ['Searching', 'Pending', 'Scheduled'].includes(order.status);
  const canCancel = !['Completed', 'Cancelled'].includes(order.status);
  const canComplete = ['OnTrip', 'Arrived', 'EnRoute'].includes(order.status);
  const canPrioritize = !['Completed', 'Cancelled'].includes(order.status) && order.priority !== 'Urgent';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-xpress-text-primary flex items-center gap-3">
              Order {order.orderId}
              <Badge variant={order.priority === 'Urgent' ? 'alert' : order.priority === 'High' ? 'warning' : 'idle'}>
                {order.priority}
              </Badge>
            </h1>
            <p className="text-sm text-xpress-text-muted">
              Transaction ID: <span className="font-mono">{order.transactionId}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canPrioritize && onPrioritizeClick && (
            <Button
              variant="secondary"
              icon={<Flag className="w-4 h-4" />}
              onClick={onPrioritizeClick}
              disabled={isLoading}
            >
              Prioritize
            </Button>
          )}
          {canAssign && onAssignClick && (
            <Button
              variant="primary"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={onAssignClick}
              disabled={isLoading}
            >
              Assign Driver
            </Button>
          )}
          {canComplete && onCompleteClick && (
            <Button
              variant="primary"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={onCompleteClick}
              disabled={isLoading}
            >
              Complete Order
            </Button>
          )}
          {canCancel && onCancelClick && (
            <Button
              variant="danger"
              icon={<XCircle className="w-4 h-4" />}
              onClick={onCancelClick}
              disabled={isLoading}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        'xpress-card p-4 flex items-center gap-4',
        'border-l-4',
        order.status === 'Completed' ? 'border-l-xpress-status-active' :
        order.status === 'Cancelled' ? 'border-l-xpress-status-alert' :
        order.status === 'Searching' ? 'border-l-xpress-status-warning' :
        'border-l-xpress-accent-blue'
      )}>
        <div className={cn('p-3 rounded-full bg-xpress-bg-secondary', status.color)}>
          {status.icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-xpress-text-primary">{status.label}</h2>
          <p className="text-sm text-xpress-text-secondary">
            Service: <Badge variant="default">{order.serviceType}</Badge>
          </p>
        </div>
        {order.flags.isPrioritized && (
          <Badge variant="alert" className="ml-auto">
            <Flag className="w-3 h-3 mr-1" />
            Prioritized
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Driver Info */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="xpress-card p-5">
            <h3 className="text-sm font-semibold text-xpress-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium text-xpress-text-primary">{order.customer.name}</p>
                <div className="flex items-center gap-2 text-sm text-xpress-text-muted">
                  <Star className="w-4 h-4 text-xpress-accent-amber" />
                  <span>{order.customer.rating.toFixed(1)} rating</span>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-xpress-border">
                <a
                  href={`tel:${order.customer.phone}`}
                  className="flex items-center gap-2 text-sm text-xpress-text-secondary hover:text-xpress-accent-blue transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {order.customer.phone}
                </a>
                {order.customer.email && (
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="flex items-center gap-2 text-sm text-xpress-text-secondary hover:text-xpress-accent-blue transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {order.customer.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Driver Card */}
          <div className="xpress-card p-5">
            <h3 className="text-sm font-semibold text-xpress-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Driver
            </h3>
            {order.driver ? (
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-medium text-xpress-text-primary">{order.driver.name}</p>
                  <p className="text-sm text-xpress-text-muted">{order.driver.vehicle}</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-xpress-border">
                  <a
                    href={`tel:${order.driver.phone}`}
                    className="flex items-center gap-2 text-sm text-xpress-text-secondary hover:text-xpress-accent-blue transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {order.driver.phone}
                  </a>
                  <p className="text-xs text-xpress-text-muted">
                    Assigned: {formatDateTime(order.driver.assignedAt)}
                  </p>
                  {order.driver.acceptedAt && (
                    <p className="text-xs text-xpress-text-muted">
                      Accepted: {formatDateTime(order.driver.acceptedAt)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-8 h-8 text-xpress-status-warning mx-auto mb-2" />
                <p className="text-xpress-text-muted">No driver assigned</p>
                {canAssign && onAssignClick && (
                  <Button variant="primary" size="sm" className="mt-3" onClick={onAssignClick}>
                    Assign Driver
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pricing Card */}
          <div className="xpress-card p-5">
            <h3 className="text-sm font-semibold text-xpress-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-xpress-text-secondary">Base Fare</span>
                <span className="text-xpress-text-primary">{formatCurrency(order.pricing.baseFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-xpress-text-secondary">Distance Fare</span>
                <span className="text-xpress-text-primary">{formatCurrency(order.pricing.distanceFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-xpress-text-secondary">Time Fare</span>
                <span className="text-xpress-text-primary">{formatCurrency(order.pricing.timeFare)}</span>
              </div>
              {order.pricing.surge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-xpress-text-secondary">Surge</span>
                  <span className="text-xpress-accent-amber">+{formatCurrency(order.pricing.surge)}</span>
                </div>
              )}
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-xpress-text-secondary">Discount</span>
                  <span className="text-xpress-status-active">-{formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t border-xpress-border pt-2 mt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-xpress-text-primary">Total</span>
                  <span className="text-xpress-accent-cyan">{formatCurrency(order.pricing.total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-xpress-text-muted pt-2">
                <CreditCard className="w-4 h-4" />
                {order.pricing.paymentMethod}
                {order.pricing.isPaid ? (
                  <Badge variant="active" className="ml-auto">Paid</Badge>
                ) : (
                  <Badge variant="warning" className="ml-auto">Unpaid</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Route & Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Route Card */}
          <div className="xpress-card p-5">
            <h3 className="text-sm font-semibold text-xpress-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Route Information
            </h3>
            <div className="space-y-4">
              {/* Pickup */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-xpress-accent-green/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-xpress-accent-green" />
                  </div>
                  <div className="w-0.5 h-full bg-xpress-border my-2" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-xpress-text-muted uppercase">Pickup</p>
                  <p className="text-xpress-text-primary font-medium">{order.route.pickup.address}</p>
                  {order.route.pickup.name && (
                    <p className="text-sm text-xpress-text-secondary">{order.route.pickup.name}</p>
                  )}
                  {order.route.pickup.notes && (
                    <p className="text-sm text-xpress-status-warning mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {order.route.pickup.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Dropoff */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-xpress-accent-red/20 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-xpress-accent-red" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-xpress-text-muted uppercase">Dropoff</p>
                  <p className="text-xpress-text-primary font-medium">{order.route.dropoff.address}</p>
                  {order.route.dropoff.name && (
                    <p className="text-sm text-xpress-text-secondary">{order.route.dropoff.name}</p>
                  )}
                  {order.route.dropoff.notes && (
                    <p className="text-sm text-xpress-status-warning mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {order.route.dropoff.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Route Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-xpress-border">
                <div>
                  <p className="text-xs text-xpress-text-muted">Distance</p>
                  <p className="text-lg font-medium text-xpress-text-primary">
                    {formatDistance(order.route.distance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Est. Duration</p>
                  <p className="text-lg font-medium text-xpress-text-primary">
                    {formatDuration(order.route.estimatedDuration)}
                  </p>
                </div>
                {order.route.actualDuration && (
                  <div>
                    <p className="text-xs text-xpress-text-muted">Actual Duration</p>
                    <p className={cn(
                      'text-lg font-medium',
                      order.route.actualDuration > order.route.estimatedDuration
                        ? 'text-xpress-status-alert'
                        : 'text-xpress-status-active'
                    )}>
                      {formatDuration(order.route.actualDuration)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="xpress-card p-5">
            <h3 className="text-sm font-semibold text-xpress-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Order Timeline
            </h3>
            <OrderTimeline timeline={order.timeline} status={order.status} />
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="xpress-card p-5">
              <h3 className="text-sm font-semibold text-xpress-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Notes
              </h3>
              <p className="text-xpress-text-primary whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
