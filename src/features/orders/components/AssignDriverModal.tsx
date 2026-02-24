import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { Input } from '@/components/ui/Input';
import { useNearbyDrivers, type NearbyDriver } from '@/features/orders/hooks/useOrders';
import type { Order } from '@/types/domain.types';
import {
  MapPin,
  Navigation,
  Star,
  Car,
  CheckCircle2,
  Search,
  AlertCircle,
  Loader2,
  Clock,
  TrendingUp,
  User,
} from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  selectedDriverId: string | null;
  onSelectDriver: (driver: NearbyDriver) => void;
  onAssign: () => void;
  isAssigning: boolean;
  assignNotes: string;
  onAssignNotesChange: (notes: string) => void;
}

// Driver Card Component
interface DriverCardProps {
  driver: NearbyDriver;
  isSelected: boolean;
  onSelect: () => void;
}

function DriverCard({ driver, isSelected, onSelect }: DriverCardProps) {
  const statusVariant = 
    driver.status === 'Online' ? 'active' : 
    driver.status === 'OnTrip' ? 'warning' : 
    'idle';

  return (
    <XpressCard
      hoverable
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-all',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a0a0f]'
      )}
      size="sm"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isSelected ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'
        )}>
          <span className="font-semibold">{driver.name.charAt(0)}</span>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-white truncate">{driver.name}</p>
            <XpressBadge variant={statusVariant} size="sm">
              {driver.status}
            </XpressBadge>
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Car className="w-3 h-3" />
              {driver.vehicleType}
              {driver.vehiclePlate && ` (${driver.vehiclePlate})`}
            </span>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="text-gray-300">{formatDistance(driver.distance)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">{formatDuration(driver.eta)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-amber-400" />
              <span className="text-gray-300">{driver.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-300">{driver.trustScore}%</span>
            </div>
          </div>
        </div>
        
        {/* Selection Indicator */}
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
        )}
      </div>
    </XpressCard>
  );
}

export function AssignDriverModal({
  isOpen,
  onClose,
  order,
  selectedDriverId,
  onSelectDriver,
  onAssign,
  isAssigning,
  assignNotes,
  onAssignNotesChange,
}: AssignDriverModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'eta' | 'rating' | 'trustScore'>('distance');

  const pickupLocation = order?.route.pickup
    ? { lat: order.route.pickup.lat, lng: order.route.pickup.lng }
    : null;

  const { data: nearbyDriversData, isLoading: isLoadingDrivers } = useNearbyDrivers(
    order?.orderId || '',
    pickupLocation
  );

  const drivers = nearbyDriversData?.drivers || [];

  // Filter and sort drivers
  const filteredDrivers = useMemo(() => {
    let result = [...drivers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          (d.riderId || '').toLowerCase().includes(query) ||
          d.vehicleType.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'eta':
          return a.eta - b.eta;
        case 'rating':
          return b.rating - a.rating;
        case 'trustScore':
          return b.trustScore - a.trustScore;
        default:
          return 0;
      }
    });

    return result;
  }, [drivers, searchQuery, sortBy]);

  const selectedDriver = drivers.find((d) => d.riderId === selectedDriverId);

  const handleClose = () => {
    if (!isAssigning) {
      setSearchQuery('');
      onClose();
    }
  };

  const handleAssign = async () => {
    await onAssign();
    setSearchQuery('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Driver"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <XpressButton variant="ghost" onClick={handleClose} disabled={isAssigning}>
            Cancel
          </XpressButton>
          <XpressButton
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedDriverId || isAssigning}
            loading={isAssigning}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isAssigning ? 'Assigning...' : 'Assign Driver'}
          </XpressButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Order Summary */}
        {order && (
          <XpressCard 
            title="Order Summary" 
            badge={order.serviceType}
            badgeVariant="info"
            size="sm"
          >
            <p className="font-mono text-cyan-400 text-sm mb-3">{order.orderId}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 line-clamp-2">{order.route.pickup.address}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Navigation className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 line-clamp-2">{order.route.dropoff.address}</span>
              </div>
            </div>
          </XpressCard>
        )}

        {/* Selected Driver Summary */}
        {selectedDriver && (
          <XpressCard 
            title="Selected Driver" 
            badge="Selected"
            badgeVariant="success"
            size="sm"
            className="border-blue-500/30 bg-blue-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{selectedDriver.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    {selectedDriver.rating.toFixed(1)}
                  </span>
                  <span>{formatDistance(selectedDriver.distance)} away</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(selectedDriver.eta)} ETA
                  </span>
                </div>
              </div>
            </div>
          </XpressCard>
        )}

        {/* Notes Input */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">
            Assignment Notes (optional)
          </label>
          <textarea
            value={assignNotes}
            onChange={(e) => onAssignNotesChange(e.target.value)}
            placeholder="Add any special instructions for the driver..."
            className="w-full bg-[#12121a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[80px] resize-y"
          />
        </div>

        {/* Search and Sort */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search drivers by name, ID, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="bg-[#12121a] border-white/10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-[#12121a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="distance">Nearest</option>
            <option value="eta">Fastest</option>
            <option value="rating">Best Rated</option>
            <option value="trustScore">Trust Score</option>
          </select>
        </div>

        {/* Drivers List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-400">
              Available Drivers
              <span className="ml-2 text-gray-500">({filteredDrivers.length})</span>
            </h4>
            {isLoadingDrivers && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Finding nearby drivers...
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {isLoadingDrivers && drivers.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Finding nearby drivers...</p>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">
                  {searchQuery ? 'No drivers match your search' : 'No nearby drivers found'}
                </p>
                {searchQuery && (
                  <XpressButton 
                    variant="ghost" 
                    size="xs" 
                    className="mt-2"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </XpressButton>
                )}
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <DriverCard
                  key={driver.riderId}
                  driver={driver}
                  isSelected={selectedDriverId === driver.riderId}
                  onSelect={() => onSelectDriver(driver)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AssignDriverModal;
