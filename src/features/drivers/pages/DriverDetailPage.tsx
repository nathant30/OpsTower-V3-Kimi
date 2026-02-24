import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { TrustScoreCard, TrustScoreBadge } from '@/features/drivers/components/TrustScoreCard';
import { PerformanceRadarChart } from '@/features/drivers/components/PerformanceChart';
import { EarningsCompact } from '@/features/drivers/components/EarningsPanel';
import { ComplianceCompact } from '@/features/drivers/components/CompliancePanel';
import { 
  useDriverDetail, 
  useDriverRecentTrips,
} from '@/features/drivers/hooks/useDriver';
import { useDriverPerformance } from '@/features/drivers/hooks/useDriverPerformance';
import { formatWalletBalance } from '@/features/drivers/hooks/useDriverWallet';
import { useUpdateDriverStatus } from '@/features/drivers/hooks/useDrivers';
import { usePermissionCheck } from '@/components/auth';
import { showSuccess, showError } from '@/lib/stores/ui.store';
import type { DriverStatus, Document } from '@/types/domain.types';
import { 
  ArrowLeft, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Car,
  Star,
  TrendingUp,
  Wallet,
  MessageSquare,
  Edit,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ==================== TAB TYPES ====================

type TabId = 'profile' | 'performance' | 'documents' | 'incidents';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

// ==================== MAIN PAGE ====================

export default function DriverDetailPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const { checkMinimumRole } = usePermissionCheck();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState<number | undefined>(undefined);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch driver data
  const { 
    data: driver, 
    isLoading: isLoadingDriver, 
    refetch: refetchDriver 
  } = useDriverDetail(driverId);

  // Fetch related data
  useDriverPerformance(driverId);
  const { data: recentTrips } = useDriverRecentTrips(driverId, 10);

  // Mutations
  const updateStatusMutation = useUpdateDriverStatus();

  // Tabs configuration
  const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" />, count: driver?.compliance?.documents?.length },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, count: 0 },
  ];

  // Handle status update
  const handleUpdateStatus = async (status: DriverStatus, reason?: string) => {
    if (!driverId) return;

    // Check permissions for suspension/deactivation
    if ((status === 'Suspended' || status === 'Deactivated') && 
        !checkMinimumRole('OperationsDirector', 'suspend drivers')) {
      return;
    }

    if (status === 'Suspended') {
      setShowSuspendModal(true);
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        driverId,
        status,
        reason,
      });
      showSuccess(`Driver status updated to ${status}`);
      refetchDriver();
    } catch (error) {
      showError('Failed to update driver status');
    }
  };

  // Handle suspend with reason
  const handleSuspendConfirm = async () => {
    if (!driverId || !suspensionReason.trim()) return;

    try {
      await updateStatusMutation.mutateAsync({
        driverId,
        status: 'Suspended',
        reason: suspensionReason,
        suspensionDays,
      });
      showSuccess('Driver suspended successfully');
      setShowSuspendModal(false);
      setSuspensionReason('');
      setSuspensionDays(undefined);
      refetchDriver();
    } catch (error) {
      showError('Failed to suspend driver');
    }
  };

  // Handle document verification
  const handleVerifyDocument = async (_documentId: string, status: 'Approved' | 'Rejected') => {
    showSuccess(`Document ${status.toLowerCase()}`);
  };

  // Loading state
  if (isLoadingDriver) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/drivers')}>
            Back
          </Button>
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-12 gap-4 flex-1">
          <div className="col-span-8 h-full bg-white/5 rounded-xl animate-pulse" />
          <div className="col-span-4 h-full bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Not found state
  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Driver Not Found</h2>
        <p className="text-gray-400 mb-4">The driver you are looking for does not exist.</p>
        <Button onClick={() => navigate('/drivers')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Drivers
        </Button>
      </div>
    );
  }

  const fullName = `${driver.personalInfo?.firstName || ''} ${driver.personalInfo?.lastName || ''}`.trim() || 'Unknown Driver';
  const statusConfig = getStatusConfig(driver.status) || { badgeVariant: 'idle' as const };
  const onlineConfig = getOnlineStatusConfig(driver.onlineStatus) || { dotColor: 'bg-gray-500', label: 'Offline' };

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            icon={<ArrowLeft className="w-4 h-4" />} 
            onClick={() => navigate('/drivers')}
          >
            Back
          </Button>
          
          {/* Driver Header Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                {driver.personalInfo?.avatar || fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0f]",
                onlineConfig.dotColor
              )} />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-white">
                {fullName}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500 font-mono">{driver.driverId || 'N/A'}</span>
                <span className="text-gray-600">•</span>
                <Badge variant={statusConfig?.badgeVariant || 'idle'}>
                  {driver.status || 'Unknown'}
                </Badge>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-400">{onlineConfig?.label || 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetchDriver()}
          >
            Refresh
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            icon={<MessageSquare className="w-4 h-4" />}
            onClick={() => setShowContactModal(true)}
          >
            Contact
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </Button>
          
          {/* Status Actions */}
          {driver.status === 'Active' || driver.status === 'Idle' ? (
            <Button
              variant="danger"
              size="sm"
              icon={<UserX className="w-4 h-4" />}
              onClick={() => handleUpdateStatus('Suspended')}
            >
              Suspend
            </Button>
          ) : driver.status === 'Suspended' ? (
            <Button
              variant="primary"
              size="sm"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => handleUpdateStatus('Active')}
            >
              Reactivate
            </Button>
          ) : null}
        </div>
      </div>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Trust Score"
          value={driver.trustScore?.overall || 0}
          icon={<Award className="w-4 h-4" />}
          color={(driver.trustScore?.overall || 0) >= 80 ? 'green' : (driver.trustScore?.overall || 0) >= 60 ? 'yellow' : 'red'}
          suffix="/100"
          component={<TrustScoreBadge score={driver.trustScore?.overall || 0} />}
        />
        <StatCard
          label="Total Trips"
          value={(driver.performance?.totalTrips || 0).toLocaleString()}
          icon={<TrendingUp className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Current Balance"
          value={formatWalletBalance(driver.earnings.currentBalance)}
          icon={<Wallet className="w-4 h-4" />}
          color="green"
          isFormatted
        />
        <StatCard
          label="Rating"
          value={`${(driver.performance?.averageRating || 0).toFixed(1)} ★`}
          icon={<Star className="w-4 h-4" />}
          color="purple"
          isFormatted
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 bg-white/10 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {activeTab === 'profile' && (
          <ProfileTab driver={driver} recentTrips={recentTrips} />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab driver={driver} />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab driver={driver} onVerifyDocument={handleVerifyDocument} />
        )}
        {activeTab === 'incidents' && (
          <IncidentsTab driverId={driverId!} />
        )}
      </div>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend Driver"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="p-2 bg-red-500/20 rounded-full">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-medium">{fullName}</p>
              <p className="text-xs text-gray-400">{driverId}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Suspension Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              className="w-full h-24 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter reason for suspension..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Duration (days) - Optional
            </label>
            <input
              type="number"
              min="1"
              max="365"
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Leave empty for indefinite"
              value={suspensionDays || ''}
              onChange={(e) => setSuspensionDays(e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for indefinite suspension
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<UserX className="w-4 h-4" />}
              onClick={handleSuspendConfirm}
              disabled={!suspensionReason.trim() || updateStatusMutation.isPending}
              loading={updateStatusMutation.isPending}
            >
              Suspend Driver
            </Button>
          </div>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Driver"
        size="sm"
      >
        <div className="space-y-3">
          <ContactItem 
            icon={<Phone className="w-4 h-4" />} 
            label="Phone"
            value={driver.personalInfo.phone}
            action="Call"
          />
          <ContactItem 
            icon={<Mail className="w-4 h-4" />} 
            label="Email"
            value={driver.personalInfo.email}
            action="Email"
          />
          {driver.personalInfo.address && (
            <ContactItem 
              icon={<MapPin className="w-4 h-4" />} 
              label="Location"
              value={`${driver.personalInfo.address.city}, ${driver.personalInfo.address.state}`}
            />
          )}
        </div>
      </Modal>

      {/* Edit Modal Placeholder */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Driver"
        size="md"
      >
        <div className="text-center py-8">
          <Edit className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Edit functionality coming soon</p>
        </div>
      </Modal>
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

function ProfileTab({ 
  driver, 
  recentTrips 
}: { 
  driver: NonNullable<ReturnType<typeof useDriverDetail>['data']>;
  recentTrips: ReturnType<typeof useDriverRecentTrips>['data'];
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Column - Main Info */}
      <div className="col-span-12 lg:col-span-8 space-y-4">
        {/* Trust Score Card */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <TrustScoreCard
            trustScore={driver.trustScore}
            size="lg"
            showHistory
          />
        </div>

        {/* Performance Overview */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MetricPill label="Completion Rate" value={`${Math.round(driver.performance?.completionRate || 0)}%`} />
            <MetricPill label="Acceptance Rate" value={`${Math.round(driver.performance?.acceptanceRate || 0)}%`} />
            <MetricPill label="On-Time %" value={`${Math.round(driver.performance?.onTimePercentage || 0)}%`} />
            <MetricPill label="Cancellation" value={`${(driver.performance?.cancellationRate || 0).toFixed(1)}%`} alert={(driver.performance?.cancellationRate || 0) > 5} />
          </div>
          <PerformanceRadarChart performance={driver.performance} />
        </div>

        {/* Recent Trips */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Trips</h3>
          {recentTrips && recentTrips.length > 0 ? (
            <div className="space-y-2">
              {recentTrips.slice(0, 5).map((trip) => (
                <TripRow key={trip.orderId} trip={trip} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent trips</p>
          )}
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="col-span-12 lg:col-span-4 space-y-4">
        {/* Contact Info */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Contact Information</h3>
          <div className="space-y-3">
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={driver.personalInfo.phone} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={driver.personalInfo.email} />
            {driver.personalInfo.address && (
              <InfoRow 
                icon={<MapPin className="w-4 h-4" />} 
                label="Location" 
                value={`${driver.personalInfo.address.city}, ${driver.personalInfo.address.state}`} 
              />
            )}
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Earnings Summary</h3>
          <EarningsCompact earnings={driver.earnings || {}} />
        </div>

        {/* Vehicle Info */}
        {driver.vehicle && (
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Assigned Vehicle</h3>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Car className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">{driver.vehicle?.plateNumber || 'N/A'}</p>
                <p className="text-xs text-gray-500">
                  Since {driver.vehicle?.assignedAt ? new Date(driver.vehicle.assignedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <StatRow label="Member Since" value={new Date(driver.createdAt).getFullYear().toString()} />
            <StatRow label="Total Ratings" value={(driver.performance?.totalRatings || 0).toLocaleString()} />
            <StatRow label="Avg Earnings/Trip" value={`₱${(driver.earnings?.averagePerTrip || 0).toLocaleString()}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceTab({ driver }: { driver: NonNullable<ReturnType<typeof useDriverDetail>['data']> }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Time Range:</span>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                timeRange === range
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-[#12121a] border border-white/10 text-gray-400 hover:border-white/20'
              )}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Total Trips"
          value={driver.performance?.totalTrips || 0}
          icon={<TrendingUp className="w-4 h-4" />}
          color="blue"
        />
        <MetricCard
          label="Completion Rate"
          value={`${Math.round(driver.performance?.completionRate || 0)}%`}
          icon={<CheckCircle className="w-4 h-4" />}
          color="green"
          isFormatted
        />
        <MetricCard
          label="Acceptance Rate"
          value={`${Math.round(driver.performance?.acceptanceRate || 0)}%`}
          icon={<Award className="w-4 h-4" />}
          color="purple"
          isFormatted
        />
        <MetricCard
          label="Avg Rating"
          value={`${(driver.performance?.averageRating || 0).toFixed(1)}★`}
          icon={<Star className="w-4 h-4" />}
          color="yellow"
          isFormatted
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Radar</h3>
          <PerformanceRadarChart performance={driver.performance} />
        </div>

        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Performance Trends</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Trend data not available</p>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricPill label="On-Time %" value={`${Math.round(driver.performance?.onTimePercentage || 0)}%`} />
        <MetricPill label="Cancellation" value={`${(driver.performance?.cancellationRate || 0).toFixed(1)}%`} alert={(driver.performance?.cancellationRate || 0) > 5} />
        <MetricPill label="Total Ratings" value={(driver.performance?.totalRatings || 0).toLocaleString()} />
        <MetricPill label="Earnings/Hour" value={`₱${driver.earnings?.averagePerHour || 0}`} />
      </div>
    </div>
  );
}

function DocumentsTab({ 
  driver, 
  onVerifyDocument 
}: { 
  driver: NonNullable<ReturnType<typeof useDriverDetail>['data']>;
  onVerifyDocument?: (documentId: string, status: 'Approved' | 'Rejected') => void;
}) {
  // Handle missing compliance data gracefully
  const license = driver.compliance?.license;
  const background = driver.compliance?.background;
  const training = driver.compliance?.training;
  const documents = driver.compliance?.documents || [];

  return (
    <div className="space-y-4">
      {/* Compliance Score */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Compliance Score</h3>
            <p className="text-xs text-gray-500">Based on license, background check, training, and documents</p>
          </div>
          <ComplianceCompact compliance={driver.compliance} />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver's License */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Driver's License</h3>
          </div>
          {license ? (
            <>
              <DocumentChecklistItem 
                label="License Number"
                value={license.number || 'N/A'}
                status={license.status === 'Valid' ? 'valid' : license.status === 'Expired' ? 'expired' : 'pending'}
              />
              {license.expiryDate && (
                <DocumentChecklistItem 
                  label="Expiry Date"
                  value={new Date(license.expiryDate).toLocaleDateString()}
                  status={new Date(license.expiryDate) > new Date() ? 'valid' : 'expired'}
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No license information available</p>
          )}
        </div>

        {/* Background Check */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Background Check</h3>
          </div>
          {background ? (
            <>
              <DocumentChecklistItem 
                label="Status"
                value={background.status || 'Unknown'}
                status={background.status === 'Cleared' ? 'valid' : background.status === 'Failed' ? 'expired' : 'pending'}
              />
              {background.clearanceDate && (
                <DocumentChecklistItem 
                  label="Cleared On"
                  value={new Date(background.clearanceDate).toLocaleDateString()}
                  status="valid"
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No background check information</p>
          )}
        </div>

        {/* Training */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Training & Certification</h3>
          </div>
          {training ? (
            <>
              <DocumentChecklistItem 
                label="Modules Completed"
                value={`${training.completedModules?.length || 0} modules`}
                status={(training.completedModules?.length || 0) >= 3 ? 'valid' : 'pending'}
              />
              {training.certificationDate && (
                <DocumentChecklistItem 
                  label="Certified On"
                  value={new Date(training.certificationDate).toLocaleDateString()}
                  status="valid"
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No training records</p>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Uploaded Documents ({documents.length})</h3>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} document={doc} onVerify={onVerifyDocument} />
            ))}
            {documents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No documents uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentsTab({ driverId }: { driverId: string }) {
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">No Incidents</h3>
      <p className="text-gray-400">This driver has no recorded incidents.</p>
      <p className="text-xs text-gray-500 mt-2">Driver ID: {driverId}</p>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatCard({
  label,
  value,
  icon,
  color,
  suffix,
  isFormatted = false,
  component,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  suffix?: string;
  isFormatted?: boolean;
  component?: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">{label}</span>
        <div className={cn('p-1.5 rounded', colorClasses[color])}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-white">
        {isFormatted ? value : typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
      </p>
      {component && <div className="mt-1">{component}</div>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  isFormatted = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  isFormatted?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1 rounded', colorClasses[color])}>
          {icon}
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">
        {isFormatted ? value : typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function MetricPill({ label, value, alert = false }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={cn('text-sm font-semibold', alert ? 'text-red-400' : 'text-white')}>
        {value}
      </p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
      <span className="text-gray-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-500 uppercase">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function TripRow({ trip }: { trip: NonNullable<ReturnType<typeof useDriverRecentTrips>['data']>[0] }) {
  const statusColors: Record<string, string> = {
    Completed: 'text-green-400',
    Cancelled: 'text-red-400',
    InProgress: 'text-blue-400',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500 font-mono">{trip.orderId}</span>
          <Badge variant="default">{trip.serviceType}</Badge>
          <span className={cn('text-xs font-medium', statusColors[trip.status] || 'text-gray-400')}>
            {trip.status}
          </span>
        </div>
        <p className="text-sm text-gray-300 truncate">
          {trip.pickupAddress} <ChevronRight className="w-3 h-3 inline mx-1" /> {trip.dropoffAddress}
        </p>
        <p className="text-xs text-gray-500">
          {(trip.distance / 1000).toFixed(1)} km • {Math.round(trip.duration / 60)} mins
        </p>
      </div>
      <div className="text-right ml-4">
        <p className="text-lg font-bold text-white">₱{trip.fare.toLocaleString()}</p>
        {trip.customerRating && (
          <p className="text-xs text-yellow-400">{trip.customerRating}★</p>
        )}
      </div>
    </div>
  );
}

function DocumentChecklistItem({ label, value, status }: { label: string; value: string; status: 'valid' | 'expired' | 'pending' }) {
  const statusConfig = {
    valid: { icon: <CheckCircle className="w-4 h-4 text-green-400" />, color: 'text-green-400' },
    expired: { icon: <XCircle className="w-4 h-4 text-red-400" />, color: 'text-red-400' },
    pending: { icon: <Clock className="w-4 h-4 text-amber-400" />, color: 'text-amber-400' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-medium', config.color)}>{value}</span>
        {config.icon}
      </div>
    </div>
  );
}

function DocumentRow({ 
  document, 
  onVerify 
}: { 
  document: Document; 
  onVerify?: (documentId: string, status: 'Approved' | 'Rejected') => void;
}) {
  const statusConfig = {
    Approved: { color: 'text-green-400', bg: 'bg-green-500/10', icon: <CheckCircle className="w-3 h-3" /> },
    Pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Clock className="w-3 h-3" /> },
    Rejected: { color: 'text-red-400', bg: 'bg-red-500/10', icon: <XCircle className="w-3 h-3" /> },
  };

  const config = statusConfig[document.status];

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm text-white font-medium">{document.name}</p>
          <p className="text-xs text-gray-500">{document.type} • {new Date(document.uploadedAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1', config.bg, config.color)}>
          {config.icon}
          {document.status}
        </span>
        
        {document.status === 'Pending' && onVerify && (
          <>
            <button
              onClick={() => onVerify(document.id, 'Approved')}
              className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onVerify(document.id, 'Rejected')}
              className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, action }: { icon: React.ReactNode; label: string; value: string; action?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm text-white">{value}</p>
        </div>
      </div>
      {action && (
        <Button variant="secondary" size="sm">
          {action}
        </Button>
      )}
    </div>
  );
}

// ==================== STATUS HELPERS ====================

function getStatusConfig(status: DriverStatus) {
  const configs: Record<DriverStatus, { badgeVariant: 'active' | 'idle' | 'offline' | 'alert' | 'warning' }> = {
    Active: { badgeVariant: 'active' },
    Idle: { badgeVariant: 'idle' },
    Offline: { badgeVariant: 'offline' },
    Suspended: { badgeVariant: 'alert' },
    Deactivated: { badgeVariant: 'offline' },
    Pending: { badgeVariant: 'warning' },
  };
  return configs[status];
}

function getOnlineStatusConfig(status: string) {
  const configs: Record<string, { dotColor: string; label: string }> = {
    Online: { dotColor: 'bg-green-500', label: 'Online' },
    OnTrip: { dotColor: 'bg-blue-500', label: 'On Trip' },
    OnBreak: { dotColor: 'bg-amber-500', label: 'On Break' },
    Offline: { dotColor: 'bg-gray-500', label: 'Offline' },
  };
  return configs[status] || configs.Offline;
}
