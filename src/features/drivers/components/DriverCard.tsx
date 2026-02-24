import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { TrustScoreBadge } from './TrustScoreCard';
import type { Driver, DriverStatus } from '@/types/domain.types';
import {
  Phone,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  MapPin,
  Car,
} from 'lucide-react';

// ==================== STATUS CONFIGURATION ====================

const STATUS_CONFIG: Record<DriverStatus, { color: string; bgColor: string; label: string; dotColor: string }> = {
  Active: { 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20', 
    label: 'Active',
    dotColor: 'bg-green-500'
  },
  Idle: { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500/20', 
    label: 'Idle',
    dotColor: 'bg-amber-500'
  },
  Offline: { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-500/20', 
    label: 'Offline',
    dotColor: 'bg-gray-500'
  },
  Suspended: { 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/20', 
    label: 'Suspended',
    dotColor: 'bg-red-500'
  },
  Deactivated: { 
    color: 'text-gray-500', 
    bgColor: 'bg-gray-600/20', 
    label: 'Deactivated',
    dotColor: 'bg-gray-600'
  },
  Pending: { 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20', 
    label: 'Pending',
    dotColor: 'bg-orange-500'
  },
};

const ONLINE_STATUS_CONFIG: Record<string, { dotColor: string; label: string }> = {
  Online: { dotColor: 'bg-green-500', label: 'Online' },
  OnTrip: { dotColor: 'bg-blue-500', label: 'On Trip' },
  OnBreak: { dotColor: 'bg-amber-500', label: 'On Break' },
  Offline: { dotColor: 'bg-gray-500', label: 'Offline' },
};

// ==================== COMPONENT PROPS ====================

interface DriverCardProps {
  driver: Driver;
  onClick?: () => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  rank?: number;
  showActions?: boolean;
  className?: string;
}

// ==================== DRIVER CARD COMPONENT ====================

export function DriverCard({ 
  driver, 
  onClick, 
  isSelected = false, 
  onSelect,
  rank,
  showActions = true,
  className,
}: DriverCardProps) {
  const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`;
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const statusConfig = STATUS_CONFIG[driver.status];
  const onlineConfig = ONLINE_STATUS_CONFIG[driver.onlineStatus] || ONLINE_STATUS_CONFIG.Offline;
  
  // Calculate trend based on trust score
  const trend = driver.trustScore.overall >= 85 ? 'up' : driver.trustScore.overall < 70 ? 'down' : 'stable';
  
  // Rank colors for top 3
  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-gray-300',
    3: 'text-amber-600',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking checkbox
    if ((e.target as HTMLElement).closest('.driver-checkbox')) {
      return;
    }
    onClick?.();
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative bg-[#12121a] border border-white/10 rounded-xl p-4 cursor-pointer",
        "transition-all duration-200 group hover:border-white/20 hover:bg-white/[0.02]",
        isSelected && "border-blue-500/50 bg-blue-500/5",
        className
      )}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div 
          className="driver-checkbox absolute top-3 left-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
          />
        </div>
      )}

      {/* Header - Avatar and Basic Info */}
      <div className={cn("flex items-start gap-3", onSelect && "pl-7")}>
        {/* Avatar with Rank */}
        <div className="relative flex-shrink-0">
          {driver.personalInfo.avatar ? (
            <img
              src={driver.personalInfo.avatar}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {initials}
            </div>
          )}
          
          {/* Online Status Dot */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#12121a]",
            onlineConfig.dotColor
          )} />
          
          {/* Rank Badge (if provided and in top 3) */}
          {rank && rank <= 3 && (
            <div className={cn(
              "absolute -top-1 -left-1 w-5 h-5 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center",
              rankColors[rank]
            )}>
              <Award className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Name and ID */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {fullName}
          </h3>
          <p className="text-xs text-gray-500 font-mono">{driver.driverId}</p>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-1.5">
            <Badge 
              variant="default"
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium",
                statusConfig.bgColor,
                statusConfig.color
              )}
            >
              {driver.status}
            </Badge>
            <span className="text-[10px] text-gray-500">
              {onlineConfig.label}
            </span>
          </div>
        </div>

        {/* Trust Score */}
        <div className="text-right flex-shrink-0">
          <TrustScoreBadge score={driver.trustScore.overall} showLabel={false} />
          <p className="text-[10px] text-gray-500 mt-0.5">Trust Score</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
        <div className="text-center">
          <p className="text-xs font-semibold text-white">
            ₱{Math.round(driver.earnings.averagePerHour)}
          </p>
          <p className="text-[10px] text-gray-500">/hr</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-xs font-semibold text-white">
            {driver.performance.totalTrips.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500">Trips</p>
        </div>
        <div className="text-center border-l border-white/5">
          <div className="flex items-center justify-center gap-1">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
            <p className="text-xs font-semibold text-yellow-400">
              {driver.performance.averageRating.toFixed(1)}★
            </p>
          </div>
          <p className="text-[10px] text-gray-500">Rating</p>
        </div>
      </div>

      {/* Location & Vehicle Info (if available) */}
      {(driver.personalInfo.address?.city || driver.vehicle) && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
          {driver.personalInfo.address?.city && (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{driver.personalInfo.address.city}</span>
            </div>
          )}
          {driver.vehicle && (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Car className="w-3 h-3" />
              <span className="truncate">{driver.vehicle.plateNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Hover Actions */}
      {showActions && onClick && (
        <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="flex-1 px-2 py-1.5 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
          >
            View Profile
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded transition-colors"
            title="Call Driver"
          >
            <Phone className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== COMPACT VERSION ====================

interface DriverCardCompactProps {
  driver: Driver;
  onClick?: () => void;
  showRating?: boolean;
  className?: string;
}

export function DriverCardCompact({ 
  driver, 
  onClick,
  showRating = true,
  className,
}: DriverCardCompactProps) {
  const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`;
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const onlineConfig = ONLINE_STATUS_CONFIG[driver.onlineStatus] || ONLINE_STATUS_CONFIG.Offline;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 bg-[#12121a] border border-white/10 rounded-lg cursor-pointer",
        "hover:border-white/20 hover:bg-white/[0.02] transition-all",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {driver.personalInfo.avatar ? (
          <img
            src={driver.personalInfo.avatar}
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        )}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#12121a]",
          onlineConfig.dotColor
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{fullName}</p>
        <p className="text-xs text-gray-500 font-mono">{driver.driverId}</p>
      </div>

      {/* Rating */}
      {showRating && (
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-xs font-medium">{driver.performance.averageRating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

// ==================== SKELETON ====================

export function DriverCardSkeleton() {
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-5 bg-white/10 rounded w-16" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
        <div className="h-6 bg-white/10 rounded" />
        <div className="h-6 bg-white/10 rounded" />
        <div className="h-6 bg-white/10 rounded" />
      </div>
    </div>
  );
}

// ==================== EMPTY STATE ====================

export function DriverCardEmpty({ onAddDriver }: { onAddDriver?: () => void }) {
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Car className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No drivers found</h3>
      <p className="text-sm text-gray-500 mb-4">Get started by adding your first driver</p>
      {onAddDriver && (
        <button
          onClick={onAddDriver}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Driver
        </button>
      )}
    </div>
  );
}

export default DriverCard;
