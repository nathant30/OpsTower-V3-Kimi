import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TrustScoreCard } from './TrustScoreCard';
import { PerformanceChart } from './PerformanceChart';
import { EarningsPanel } from './EarningsPanel';
import { CompliancePanel } from './CompliancePanel';
import type { Driver, DriverStatus } from '@/types/domain.types';
import type { DriverWalletInfo, EarningsBreakdown } from '../hooks/useDriverWallet';
import type { DriverRecentTrip } from '../hooks/useDriver';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Star,
  TrendingUp,
  Wallet,
  Shield,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

// ==================== TYPES ====================

interface DriverDetailProps {
  driver: Driver;
  wallet?: DriverWalletInfo | null;
  earningsBreakdown?: EarningsBreakdown | null;
  recentTrips?: DriverRecentTrip[];
  onUpdateStatus?: (status: DriverStatus, reason?: string) => void;
  onVerifyDocument?: (documentId: string, status: 'Approved' | 'Rejected') => void;
  className?: string;
}

type TabId = 'overview' | 'performance' | 'earnings' | 'compliance' | 'trips';

// ==================== MAIN COMPONENT ====================

export function DriverDetail({
  driver,
  wallet,
  earningsBreakdown,
  recentTrips,
  onUpdateStatus,
  onVerifyDocument,
  className,
}: DriverDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'earnings', label: 'Earnings', icon: <Wallet className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> },
    { id: 'trips', label: 'Recent Trips', icon: <Car className="w-4 h-4" /> },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header Card */}
      <DriverHeader driver={driver} onUpdateStatus={onUpdateStatus} />

      {/* Tabs */}
      <div className="border-b border-xpress-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'text-xpress-accent-blue border-xpress-accent-blue'
                  : 'text-xpress-text-secondary border-transparent hover:text-xpress-text-primary hover:border-xpress-border'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-2">
        {activeTab === 'overview' && (
          <OverviewTab driver={driver} />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab driver={driver} />
        )}
        {activeTab === 'earnings' && (
          <EarningsTab
            driver={driver}
            wallet={wallet}
            earningsBreakdown={earningsBreakdown}
          />
        )}
        {activeTab === 'compliance' && (
          <ComplianceTab driver={driver} onVerifyDocument={onVerifyDocument} />
        )}
        {activeTab === 'trips' && (
          <TripsTab recentTrips={recentTrips} />
        )}
      </div>
    </div>
  );
}

// ==================== TABS ====================

function OverviewTab({ driver }: { driver: Driver }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Personal Info */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-xpress-bg-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={driver.personalInfo.email}
            />
            <InfoItem
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value={driver.personalInfo.phone}
            />
            {driver.personalInfo.dateOfBirth && (
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Date of Birth"
                value={new Date(driver.personalInfo.dateOfBirth).toLocaleDateString()}
              />
            )}
            {driver.personalInfo.address && (
              <InfoItem
                icon={<MapPin className="w-4 h-4" />}
                label="Address"
                value={`${driver.personalInfo.address.city}, ${driver.personalInfo.address.state}`}
              />
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickStat
            label="Total Trips"
            value={driver.performance.totalTrips.toLocaleString()}
            icon={<Car className="w-4 h-4" />}
          />
          <QuickStat
            label="Rating"
            value={`${driver.performance.averageRating.toFixed(1)} ★`}
            icon={<Star className="w-4 h-4" />}
            color="yellow"
          />
          <QuickStat
            label="Completion"
            value={`${Math.round(driver.performance.completionRate)}%`}
            icon={<TrendingUp className="w-4 h-4" />}
            color="green"
          />
          <QuickStat
            label="Member Since"
            value={new Date(driver.createdAt).getFullYear().toString()}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Vehicle Info */}
        {driver.vehicle && (
          <div className="bg-xpress-bg-secondary rounded-lg p-4">
            <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">
              Assigned Vehicle
            </h4>
            <div className="flex items-center justify-between p-3 bg-xpress-bg-tertiary rounded">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-xpress-accent-blue/10 rounded">
                  <Car className="w-5 h-5 text-xpress-accent-blue" />
                </div>
                <div>
                  <p className="font-medium text-xpress-text-primary">
                    {driver.vehicle.plateNumber}
                  </p>
                  <p className="text-xs text-xpress-text-muted">
                    Assigned {new Date(driver.vehicle.assignedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
                View
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trust Score */}
      <div>
        <TrustScoreCard
          trustScore={driver.trustScore}
          size="lg"
          showHistory
        />
      </div>
    </div>
  );
}

function PerformanceTab({ driver }: { driver: Driver }) {
  return (
    <div className="space-y-4">
      <PerformanceChart performance={driver.performance} />
    </div>
  );
}

function EarningsTab({
  driver,
  wallet,
  earningsBreakdown,
}: {
  driver: Driver;
  wallet?: DriverWalletInfo | null;
  earningsBreakdown?: EarningsBreakdown | null;
}) {
  return (
    <EarningsPanel
      earnings={driver.earnings}
      wallet={wallet}
      breakdown={earningsBreakdown}
    />
  );
}

function ComplianceTab({
  driver,
  onVerifyDocument,
}: {
  driver: Driver;
  onVerifyDocument?: (documentId: string, status: 'Approved' | 'Rejected') => void;
}) {
  return (
    <CompliancePanel
      compliance={driver.compliance}
      onVerifyDocument={onVerifyDocument}
    />
  );
}

function TripsTab({ recentTrips }: { recentTrips?: DriverRecentTrip[] }) {
  if (!recentTrips || recentTrips.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-12 h-12 text-xpress-text-muted mx-auto mb-4" />
        <p className="text-xpress-text-muted">No recent trips</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentTrips.map((trip) => (
        <TripItem key={trip.orderId} trip={trip} />
      ))}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function DriverHeader({
  driver,
  onUpdateStatus,
}: {
  driver: Driver;
  onUpdateStatus?: (status: DriverStatus, reason?: string) => void;
}) {
  const fullName = `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`;

  const getStatusActions = (): { label: string; status: DriverStatus; variant: 'primary' | 'secondary' | 'danger' }[] => {
    switch (driver.status) {
      case 'Active':
      case 'Idle':
        return [{ label: 'Suspend Driver', status: 'Suspended', variant: 'danger' }];
      case 'Suspended':
        return [{ label: 'Reactivate Driver', status: 'Active', variant: 'primary' }];
      case 'Pending':
        return [
          { label: 'Approve Driver', status: 'Active', variant: 'primary' },
          { label: 'Reject Driver', status: 'Deactivated', variant: 'danger' },
        ];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions();

  return (
    <div className="bg-xpress-bg-secondary rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          {driver.personalInfo.avatar ? (
            <img
              src={driver.personalInfo.avatar}
              alt={fullName}
              className="w-16 h-16 rounded-full bg-xpress-bg-tertiary"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-xpress-bg-tertiary flex items-center justify-center">
              <User className="w-8 h-8 text-xpress-text-muted" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-xpress-text-primary">{fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-xpress-text-muted font-mono">{driver.driverId}</span>
              <span className="text-xpress-text-muted">•</span>
              <StatusBadge status={driver.status} />
              <span className="text-xpress-text-muted">•</span>
              <OnlineStatusBadge status={driver.onlineStatus} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="md:ml-auto flex gap-2">
          {statusActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={() => onUpdateStatus?.(action.status)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-xpress-bg-tertiary rounded text-xpress-text-muted mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-xpress-text-muted">{label}</p>
        <p className="text-sm text-xpress-text-primary">{value}</p>
      </div>
    </div>
  );
}

function QuickStat({
  label,
  value,
  icon,
  color = 'blue',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-xpress-accent-blue/10 text-xpress-accent-blue',
    green: 'bg-xpress-status-active/10 text-xpress-status-active',
    yellow: 'bg-xpress-status-idle/10 text-xpress-status-idle',
  };

  return (
    <div className="bg-xpress-bg-secondary rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn('p-1 rounded', colorClasses[color])}>
          {icon}
        </div>
        <span className="text-xs text-xpress-text-muted">{label}</span>
      </div>
      <p className="text-lg font-bold text-xpress-text-primary">{value}</p>
    </div>
  );
}

function TripItem({ trip }: { trip: DriverRecentTrip }) {
  const statusColors: Record<string, string> = {
    Completed: 'text-xpress-status-active',
    Cancelled: 'text-xpress-status-alert',
    InProgress: 'text-xpress-accent-blue',
  };

  return (
    <div className="bg-xpress-bg-secondary rounded-lg p-4 hover:bg-xpress-bg-tertiary transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-xpress-text-muted font-mono">{trip.orderId}</span>
            <Badge variant="default">{trip.serviceType}</Badge>
            <span className={cn('text-xs font-medium', statusColors[trip.status] || 'text-xpress-text-secondary')}>
              {trip.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-xpress-text-secondary">
            <span className="truncate max-w-[200px]">{trip.pickupAddress}</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{trip.dropoffAddress}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-xpress-text-muted">
            <span>{(trip.distance / 1000).toFixed(1)} km</span>
            <span>{Math.round(trip.duration / 60)} mins</span>
            {trip.completedAt && (
              <span>{new Date(trip.completedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-lg font-bold text-xpress-text-primary">
            ₱{trip.fare.toLocaleString()}
          </p>
          {trip.customerRating && (
            <p className="text-xs text-xpress-status-idle">
              {trip.customerRating} ★
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DriverStatus }) {
  const variants: Record<DriverStatus, 'active' | 'idle' | 'offline' | 'alert' | 'warning'> = {
    Active: 'active',
    Idle: 'idle',
    Offline: 'offline',
    Suspended: 'alert',
    Deactivated: 'offline',
    Pending: 'warning',
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {status}
    </Badge>
  );
}

function OnlineStatusBadge({ status }: { status: string }) {
  const dotColors: Record<string, string> = {
    Online: 'bg-xpress-status-active',
    OnTrip: 'bg-xpress-accent-blue',
    OnBreak: 'bg-xpress-status-idle',
    Offline: 'bg-xpress-text-muted',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full', dotColors[status] || 'bg-xpress-text-muted')} />
      <span className="text-xs text-xpress-text-secondary">{status}</span>
    </div>
  );
}

export default DriverDetail;
