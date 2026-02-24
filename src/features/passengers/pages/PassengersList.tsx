import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PassengerTable } from '../components/PassengerTable';
import {
  usePassengers,
  usePassengerStats,
  useUpdatePassengerStatus,
} from '../hooks/usePassengers';
import type { PassengerStatus } from '@/services/passengers/passengers.service';
import {
  Users,
  Star,
  TrendingUp,
  Calendar,
  Download,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const PassengersList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PassengerStatus[]>([]);
  
  // Status change modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<{ id: string; name: string } | null>(null);
  const [targetStatus, setTargetStatus] = useState<PassengerStatus | null>(null);
  const [statusReason, setStatusReason] = useState('');

  const { data: passengersData, isLoading: passengersLoading } = usePassengers({
    filters: {
      search: searchTerm,
      status: statusFilter.length > 0 ? statusFilter : undefined,
      pageNumber: currentPage,
      pageSize,
    },
  });

  const { data: stats, isLoading: statsLoading } = usePassengerStats();
  const updateStatus = useUpdatePassengerStatus();

  const handleStatusChange = (id: string, status: PassengerStatus) => {
    const passenger = passengersData?.items.find((p) => p.id === id);
    if (passenger) {
      setSelectedPassenger({ id, name: `${passenger.firstName} ${passenger.lastName}` });
      setTargetStatus(status);
      setStatusModalOpen(true);
    }
  };

  const confirmStatusChange = () => {
    if (selectedPassenger && targetStatus) {
      updateStatus.mutate(
        { id: selectedPassenger.id, status: targetStatus, reason: statusReason },
        {
          onSuccess: () => {
            setStatusModalOpen(false);
            setSelectedPassenger(null);
            setTargetStatus(null);
            setStatusReason('');
          },
        }
      );
    }
  };

  const getStatusActionLabel = (status: PassengerStatus) => {
    switch (status) {
      case 'suspended':
        return 'Suspend';
      case 'banned':
        return 'Ban';
      case 'active':
        return 'Reactivate';
      default:
        return 'Update Status';
    }
  };

  const totalPages = passengersData?.totalPages || 1;
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, passengersData?.total || 0);

  return (
    <div className="h-full overflow-y-auto bg-[#0f0f14]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Passengers</h1>
            <p className="text-gray-500 mt-1">Manage and monitor passenger accounts</p>
          </div>
          <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <XpressCard
            title="Total Passengers"
            icon={<Users className="w-5 h-5" />}
            badge="All time"
            badgeVariant="default"
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.total.toLocaleString()}
              </span>
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </XpressCard>

          <XpressCard
            title="Active This Month"
            icon={<TrendingUp className="w-5 h-5" />}
            badge="Current"
            badgeVariant="success"
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.activeThisMonth.toLocaleString()}
              </span>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats && Math.round((stats.activeThisMonth / stats.total) * 100)}% of total
            </p>
          </XpressCard>

          <XpressCard
            title="Average Rating"
            icon={<Star className="w-5 h-5" />}
            badge="4.0+ good"
            badgeVariant="warning"
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.avgRating.toFixed(1)}
              </span>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Based on all completed trips</p>
          </XpressCard>

          <XpressCard
            title="New This Week"
            icon={<Calendar className="w-5 h-5" />}
            badge="Last 7 days"
            badgeVariant="info"
          >
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">
                {statsLoading ? '-' : stats?.newThisWeek.toLocaleString()}
              </span>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-green-400 mt-2">+12% from last week</p>
          </XpressCard>
        </div>

        {/* Quick Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Quick filter:</span>
          {(['active', 'suspended', 'banned', 'inactive'] as PassengerStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter((prev) =>
                  prev.includes(status)
                    ? prev.filter((s) => s !== status)
                    : [...prev, status]
                );
                setCurrentPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                statusFilter.includes(status)
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#12121a] border border-gray-800 text-gray-400 hover:border-gray-700'
              )}
            >
              {status}
            </button>
          ))}
          {statusFilter.length > 0 && (
            <button
              onClick={() => {
                setStatusFilter([]);
                setCurrentPage(1);
              }}
              className="text-sm text-orange-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Passenger Table */}
        <XpressCard>
          <PassengerTable
            passengers={passengersData?.items || []}
            isLoading={passengersLoading}
            onStatusChange={handleStatusChange}
          />
        </XpressCard>

        {/* Pagination */}
        {passengersData && passengersData.total > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Showing {startItem} to {endItem} of {passengersData.total} results
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-[#12121a] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                        currentPage === pageNum
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:bg-gray-800'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setSelectedPassenger(null);
          setTargetStatus(null);
          setStatusReason('');
        }}
        title={`${targetStatus ? getStatusActionLabel(targetStatus) : 'Update'} Passenger`}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setStatusModalOpen(false);
                setSelectedPassenger(null);
                setTargetStatus(null);
                setStatusReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={updateStatus.isPending}
              variant={targetStatus === 'banned' ? 'danger' : 'primary'}
              loading={updateStatus.isPending}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">
                You are about to {targetStatus === 'active' ? 'reactivate' : targetStatus} the account for:
              </p>
              <p className="text-orange-400 font-semibold mt-1">{selectedPassenger?.name}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Reason for {targetStatus === 'active' ? 'reactivation' : targetStatus}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for this status change..."
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              rows={3}
            />
          </div>
          {targetStatus === 'banned' && (
            <p className="text-xs text-red-400">
              Warning: Banning a passenger will prevent them from using the platform. This action should be used for serious violations only.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PassengersList;
