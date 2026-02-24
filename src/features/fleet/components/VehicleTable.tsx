import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Vehicle, VehicleStatus } from '@/types/domain.types';
import { 
  Car, 
  Bike, 
  Package, 
  MoreHorizontal,
  MapPin,
  Navigation,
  AlertCircle
} from 'lucide-react';

export interface VehicleTableProps {
  vehicles: Vehicle[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onRowClick?: (vehicle: Vehicle) => void;
  loading?: boolean;
  onViewMap?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
}

const vehicleTypeIcons: Record<string, React.ReactNode> = {
  'Taxi': <Car className="w-4 h-4" />,
  'Moto': <Bike className="w-4 h-4" />,
  'Delivery': <Package className="w-4 h-4" />,
  'Idle': <Car className="w-4 h-4" />,
  'Urban Demand': <Car className="w-4 h-4" />,
};

function getStatusBadgeVariant(status: VehicleStatus): 'active' | 'idle' | 'offline' | 'alert' | 'warning' | 'default' {
  switch (status) {
    case 'Active':
      return 'active';
    case 'Idle':
      return 'idle';
    case 'Maintenance':
      return 'alert';
    case 'Offline':
      return 'offline';
    case 'Decommissioned':
      return 'warning';
    default:
      return 'default';
  }
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'Taxi':
      return 'bg-blue-500/20 text-blue-400';
    case 'Moto':
      return 'bg-green-500/20 text-green-400';
    case 'Delivery':
      return 'bg-purple-500/20 text-purple-400';
    case 'Idle':
      return 'bg-amber-500/20 text-amber-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

export function VehicleTable({
  vehicles,
  selectedIds,
  onSelectionChange,
  onRowClick,
  loading = false,
  onViewMap,
  onViewDetails,
}: VehicleTableProps) {
  const columns: Column<Vehicle>[] = [
    {
      key: 'plateNumber',
      header: 'Plate Number',
      accessor: (row) => row.plateNumber,
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-xpress-text-primary">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      accessor: (row) => `${row.make} ${row.model} ${row.year}`,
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-xpress-bg-elevated flex items-center justify-center text-xpress-text-secondary">
            {vehicleTypeIcons[row.type] || <Car className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-medium text-xpress-text-primary">
              {row.make} {row.model}
            </div>
            <div className="text-xs text-xpress-text-muted">
              {row.year}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      accessor: (row) => row.type,
      sortable: true,
      render: (value) => (
        <span className={`
          inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
          ${getTypeBadgeColor(String(value))}
        `}>
          {vehicleTypeIcons[String(value)]}
          {String(value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusBadgeVariant(value as VehicleStatus)}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'driver',
      header: 'Assigned Driver',
      accessor: (row) => row.assignedDriver?.name || 'Unassigned',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.assignedDriver ? (
            <>
              <div className="w-6 h-6 rounded-full bg-xpress-accent-blue/20 flex items-center justify-center">
                <span className="text-xs font-medium text-xpress-accent-blue">
                  {row.assignedDriver.name.charAt(0)}
                </span>
              </div>
              <span className="text-xpress-text-primary">{String(value)}</span>
            </>
          ) : (
            <span className="text-xpress-text-muted italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (row) => row.currentLocation ? 'Active' : 'Unknown',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.currentLocation ? (
            <>
              <MapPin className="w-4 h-4 text-xpress-status-active" />
              <span className="text-xs text-xpress-text-secondary">
                {row.currentLocation.lat.toFixed(4)}, {row.currentLocation.lng.toFixed(4)}
              </span>
            </>
          ) : (
            <span className="text-xpress-text-muted text-xs">No location data</span>
          )}
        </div>
      ),
    },
    {
      key: 'utilization',
      header: 'Utilization',
      accessor: (row) => row.utilization.tripsCompleted,
      align: 'right',
      sortable: true,
      render: (_, row) => (
        <div className="text-right">
          <div className="text-xpress-text-primary">
            {row.utilization.tripsCompleted.toLocaleString()} trips
          </div>
          <div className="text-xs text-xpress-text-muted">
            ₱{row.utilization.revenueGenerated.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'maintenance',
      header: 'Maintenance',
      accessor: (row) => row.maintenance.mileage,
      align: 'right',
      sortable: true,
      render: (_, row) => {
        const isServiceDue = row.maintenance.nextServiceDue && 
          new Date(row.maintenance.nextServiceDue) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        return (
          <div className="text-right">
            <div className="text-xpress-text-primary">
              {row.maintenance.mileage.toLocaleString()} km
            </div>
            {isServiceDue && (
              <div className="flex items-center justify-end gap-1 text-xs text-xpress-status-alert">
                <AlertCircle className="w-3 h-3" />
                Service due
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      accessor: () => '',
      align: 'right',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          {row.currentLocation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onViewMap?.(row);
              }}
              title="View on map"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(row);
            }}
            title="View details"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="xpress-card overflow-hidden">
      <Table
        data={vehicles}
        columns={columns}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onRowClick={onRowClick}
        loading={loading}
        getRowId={(row) => row.vehicleId}
        emptyMessage="No vehicles found"
      />
    </div>
  );
}

export default VehicleTable;
