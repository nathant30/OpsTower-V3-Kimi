import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { formatDistanceToNow, formatCurrency } from '@/lib/utils/date';
import type { Order, OrderStatus } from '@/types/domain.types';
import { MapPin, Navigation, User, Phone, AlertCircle, CheckCircle2, Clock, Car } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  selectedIds?: string[];
  onAssignClick?: (orderId: string) => void;
  onCancelClick?: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { variant: 'active' | 'idle' | 'offline' | 'alert' | 'warning'; icon: React.ReactNode }> = {
  Searching: { variant: 'warning', icon: <Clock className="w-3 h-3" /> },
  Assigned: { variant: 'idle', icon: <User className="w-3 h-3" /> },
  Accepted: { variant: 'idle', icon: <CheckCircle2 className="w-3 h-3" /> },
  EnRoute: { variant: 'active', icon: <Navigation className="w-3 h-3" /> },
  Arrived: { variant: 'active', icon: <MapPin className="w-3 h-3" /> },
  OnTrip: { variant: 'active', icon: <Car className="w-3 h-3" /> },
  InTransit: { variant: 'active', icon: <Car className="w-3 h-3" /> },
  Completed: { variant: 'active', icon: <CheckCircle2 className="w-3 h-3" /> },
  Delivered: { variant: 'active', icon: <CheckCircle2 className="w-3 h-3" /> },
  Cancelled: { variant: 'alert', icon: <AlertCircle className="w-3 h-3" /> },
  Scheduled: { variant: 'warning', icon: <Clock className="w-3 h-3" /> },
  Pending: { variant: 'warning', icon: <Clock className="w-3 h-3" /> },
};

export function OrdersTable({
  orders,
  isLoading,
  onSelectionChange,
  selectedIds: controlledSelectedIds,
  onAssignClick,
  onCancelClick,
}: OrdersTableProps) {
  const navigate = useNavigate();

  // Use internal selection state if not controlled
  const internalSelection = useBatchSelection({
    items: orders,
    getItemId: (order) => order.orderId,
  });

  const selection = useMemo(() => {
    if (controlledSelectedIds !== undefined && onSelectionChange) {
      return {
        selectedIds: controlledSelectedIds,
        onSelectionChange,
      };
    }
    return {
      selectedIds: internalSelection.selectedIds,
      onSelectionChange: internalSelection.setSelection,
    };
  }, [controlledSelectedIds, onSelectionChange, internalSelection]);

  const columns: Column<Order>[] = useMemo(() => [
    {
      key: 'orderId',
      header: 'Order ID',
      accessor: (row) => row.orderId,
      render: (value) => (
        <span className="font-mono text-xpress-accent-cyan">{String(value)}</span>
      ),
      sortable: true,
      width: '140px',
    },
    {
      key: 'customer',
      header: 'Customer',
      accessor: (row) => row.customer.name,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-xpress-text-primary">{String(value)}</span>
          <span className="text-xs text-xpress-text-muted flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {row.customer.phone}
          </span>
        </div>
      ),
      sortable: true,
      width: '180px',
    },
    {
      key: 'driver',
      header: 'Driver',
      accessor: (row) => row.driver?.name || 'Unassigned',
      render: (_value, row) => {
        const driver = row.driver;
        if (!driver) {
          return (
            <span className="text-xpress-text-muted italic flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Unassigned
            </span>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="font-medium text-xpress-text-primary">{driver.name}</span>
            <span className="text-xs text-xpress-text-muted">{driver.vehicle}</span>
          </div>
        );
      },
      sortable: true,
      width: '160px',
    },
    {
      key: 'route',
      header: 'Route',
      accessor: (row) => `${row.route.pickup.address} → ${row.route.dropoff.address}`,
      render: (_, row) => (
        <div className="flex flex-col gap-1 max-w-xs">
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3 text-xpress-accent-green" />
            <span className="truncate text-xpress-text-secondary">{row.route.pickup.address}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Navigation className="w-3 h-3 text-xpress-accent-red" />
            <span className="truncate text-xpress-text-secondary">{row.route.dropoff.address}</span>
          </div>
        </div>
      ),
      width: '240px',
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (value) => {
        const status = String(value) as OrderStatus;
        const config = statusConfig[status] || { variant: 'offline', icon: null };
        return (
          <Badge variant={config.variant} className="flex items-center gap-1.5">
            {config.icon}
            {status}
          </Badge>
        );
      },
      sortable: true,
      width: '120px',
    },
    {
      key: 'serviceType',
      header: 'Service',
      accessor: (row) => row.serviceType,
      render: (value) => (
        <Badge variant="default">{String(value)}</Badge>
      ),
      sortable: true,
      width: '90px',
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (row) => row.priority,
      render: (value) => {
        const priority = String(value);
        let variant: 'active' | 'idle' | 'offline' | 'alert' | 'warning' = 'offline';
        if (priority === 'Urgent') variant = 'alert';
        else if (priority === 'High') variant = 'warning';
        else variant = 'idle';
        return <Badge variant={variant}>{priority}</Badge>;
      },
      sortable: true,
      width: '100px',
    },
    {
      key: 'total',
      header: 'Total',
      accessor: (row) => row.pricing.total,
      render: (value) => (
        <span className="font-medium text-xpress-text-primary">
          {formatCurrency(Number(value))}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '100px',
    },
    {
      key: 'createdAt',
      header: 'Time',
      accessor: (row) => row.createdAt,
      render: (value) => (
        <span className="text-xpress-text-secondary">
          {formatDistanceToNow(String(value))}
        </span>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: () => '',
      render: (_, row) => {
        const canAssign = ['Searching', 'Pending', 'Scheduled'].includes(row.status);
        const canCancel = !['Completed', 'Cancelled'].includes(row.status);

        return (
          <div className="flex items-center gap-2">
            {canAssign && onAssignClick && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignClick(row.orderId);
                }}
              >
                Assign
              </Button>
            )}
            {canCancel && onCancelClick && (
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelClick(row.orderId);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        );
      },
      width: '140px',
    },
  ], [onAssignClick, onCancelClick]);

  const handleRowClick = (row: Order) => {
    navigate(`/orders/${row.orderId}`);
  };

  return (
    <div className="xpress-card overflow-hidden">
      <Table
        data={orders}
        columns={columns}
        selectable
        selectedIds={selection.selectedIds}
        onSelectionChange={selection.onSelectionChange}
        loading={isLoading}
        getRowId={(row) => row.orderId}
        onRowClick={handleRowClick}
        emptyMessage="No orders found. Try adjusting your filters."
      />
    </div>
  );
}

export default OrdersTable;
