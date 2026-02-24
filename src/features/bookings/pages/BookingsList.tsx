import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressButton } from '@/components/ui/XpressButton';
import { Modal } from '@/components/ui/Modal';
import { BookingTable } from '@/features/bookings/components/BookingTable';
import { BookingCalendar } from '@/features/bookings/components/BookingCalendar';
import {
  useBookings,
  useCancelBooking,
  useExportBookings,
  useRescheduleBooking,
  useAssignDriver,
  getBookingStatusVariant,
  getBookingStatusLabel,
  formatCurrency,
  formatDate,
} from '@/features/bookings/hooks/useBookings';
import type { Booking, BookingStatus, ServiceType, BookingType } from '@/services/bookings/bookings.service';
import {
  Calendar,
  Search,
  Plus,
  Clock,
  DollarSign,
  Filter,
  Download,
  LayoutGrid,
  List,
  Car,
  Repeat,
  Zap,
  User,
  Phone,
  CalendarClock,
  MapPin,
} from 'lucide-react';

type ViewMode = 'list' | 'calendar';

const BookingsList = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<BookingType | 'all'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newScheduledTime, setNewScheduledTime] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Queries & Mutations
  const { data: bookingsData, isLoading } = useBookings({
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    serviceType: serviceTypeFilter !== 'all' ? [serviceTypeFilter] : undefined,
    startDate: dateRange.start,
    endDate: dateRange.end,
    searchQuery: searchQuery || undefined,
    pageNumber: 1,
    pageSize: 50,
  });

  const exportBookingsMutation = useExportBookings();
  const cancelBookingMutation = useCancelBooking();
  const rescheduleBookingMutation = useRescheduleBooking();
  const assignDriverMutation = useAssignDriver();

  const bookings = bookingsData?.items || [];

  // Stats
  const stats = {
    total: bookings.length,
    scheduled: bookings.filter(b => b.status === 'scheduled').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    recurring: bookings.filter(b => b.recurring?.isRecurring).length,
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !newScheduledTime) return;
    await rescheduleBookingMutation.mutateAsync({
      bookingId: selectedBooking.bookingId,
      newScheduledTime,
    });
    setShowRescheduleModal(false);
    setNewScheduledTime('');
  };

  const handleCancel = async () => {
    if (!selectedBooking || !cancelReason) return;
    await cancelBookingMutation.mutateAsync({
      bookingId: selectedBooking.bookingId,
      reason: cancelReason,
    });
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleAssignDriver = async () => {
    if (!selectedBooking || !selectedDriverId) return;
    await assignDriverMutation.mutateAsync({
      bookingId: selectedBooking.bookingId,
      driverId: selectedDriverId,
    });
    setShowAssignModal(false);
    setSelectedDriverId('');
  };

  const handleExport = async () => {
    const blob = await exportBookingsMutation.mutateAsync({
      status: statusFilter !== 'all' ? [statusFilter] : undefined,
      searchQuery: searchQuery || undefined,
    });
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Mock available drivers
  const availableDrivers = [
    { id: 'drv-001', name: 'Juan Santos', plate: 'ABC-123', type: 'Van', distance: 0.5 },
    { id: 'drv-002', name: 'Maria Cruz', plate: 'XYZ-789', type: 'Motorcycle', distance: 1.2 },
    { id: 'drv-003', name: 'Pedro Reyes', plate: 'DEF-456', type: 'Sedan', distance: 0.8 },
    { id: 'drv-004', name: 'Ana Lim', plate: 'GHI-789', type: 'Van', distance: 2.1 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0f0f14]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" />
              Bookings
            </h1>
            <p className="text-sm text-gray-500">Manage scheduled rides and on-demand bookings</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-950 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'calendar' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Calendar
              </button>
            </div>
            <XpressButton
              variant="secondary"
              size="sm"
              onClick={handleExport}
              loading={exportBookingsMutation.isPending}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </XpressButton>
            <XpressButton
              size="sm"
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              New Booking
            </XpressButton>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-7 gap-3 mb-4">
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">Scheduled</p>
            <p className="text-lg font-semibold text-blue-400">{stats.scheduled}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">Confirmed</p>
            <p className="text-lg font-semibold text-green-400">{stats.confirmed}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-lg font-semibold text-amber-400">{stats.inProgress}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-semibold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-lg font-semibold text-red-400">{stats.cancelled}</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p className="text-xs text-gray-500">Recurring</p>
            <p className="text-lg font-semibold text-purple-400">{stats.recurring}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by booking ID, customer, driver, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-gray-950 border-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as BookingType | 'all')}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="scheduled">Scheduled</option>
                <option value="on-demand">On-Demand</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Service</label>
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value as ServiceType | 'all')}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Services</option>
                <option value="taxi">Taxi</option>
                <option value="moto">Moto</option>
                <option value="delivery">Delivery</option>
                <option value="car">Car</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No bookings found</h3>
              <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or create a new booking</p>
              <XpressButton onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
                Create Booking
              </XpressButton>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <BookingTable
            bookings={bookings}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        ) : (
          <BookingCalendar
            bookings={bookings}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Booking Details"
        size="lg"
        footer={
          <>
            <XpressButton variant="ghost" onClick={() => setShowDetailModal(false)}>
              Close
            </XpressButton>
            {selectedBooking && ['scheduled', 'confirmed'].includes(selectedBooking.status) && (
              <>
                {!selectedBooking.driver && (
                  <XpressButton
                    variant="secondary"
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign Driver
                  </XpressButton>
                )}
                <XpressButton
                  variant="secondary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setNewScheduledTime(selectedBooking.pickup.scheduledTime.slice(0, 16));
                    setShowRescheduleModal(true);
                  }}
                >
                  Reschedule
                </XpressButton>
                <XpressButton
                  variant="danger"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowCancelModal(true);
                  }}
                >
                  Cancel
                </XpressButton>
              </>
            )}
          </>
        }
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedBooking.bookingId}</h3>
                <p className="text-sm text-gray-400">Created {formatDate(selectedBooking.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <XpressBadge variant={getBookingStatusVariant(selectedBooking.status)}>
                  {getBookingStatusLabel(selectedBooking.status)}
                </XpressBadge>
                <div className="flex items-center gap-2">
                  {selectedBooking.type === 'scheduled' ? (
                    <Calendar className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="text-sm text-gray-300 capitalize">{selectedBooking.type}</span>
                  {selectedBooking.recurring?.isRecurring && (
                    <>
                      <Repeat className="w-4 h-4 text-purple-400 ml-2" />
                      <span className="text-sm text-purple-400">
                        {selectedBooking.recurring.pattern}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Customer</h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-white">{selectedBooking.customer.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Phone className="w-4 h-4" />
                      {selectedBooking.customer.phone}
                    </span>
                    {selectedBooking.customer.email && (
                      <span className="text-sm text-gray-500">{selectedBooking.customer.email}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Schedule</h4>
              <div className="flex items-center gap-3">
                <CalendarClock className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-lg font-medium text-white">
                    {formatDate(selectedBooking.pickup.scheduledTime)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Service Type: <span className="text-white capitalize">{selectedBooking.serviceType}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Pickup</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white">{selectedBooking.pickup.address}</p>
                    {selectedBooking.pickup.notes && (
                      <p className="text-sm text-gray-500 mt-1">Note: {selectedBooking.pickup.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Dropoff</h4>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white">{selectedBooking.dropoff.address}</p>
                    {selectedBooking.dropoff.notes && (
                      <p className="text-sm text-gray-500 mt-1">Note: {selectedBooking.dropoff.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver */}
            {selectedBooking.driver ? (
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Assigned Driver</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-white">{selectedBooking.driver.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-400">{selectedBooking.driver.phone}</span>
                      <span className="text-sm text-gray-500">
                        {selectedBooking.driver.vehiclePlate} • {selectedBooking.driver.vehicleType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">No driver assigned</span>
                  <XpressButton
                    size="sm"
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowAssignModal(true);
                    }}
                  >
                    Assign Driver
                  </XpressButton>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Pricing Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Base Fare</span>
                  <span className="text-white">{formatCurrency(selectedBooking.pricing.baseFare, selectedBooking.pricing.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Distance Fare</span>
                  <span className="text-white">{formatCurrency(selectedBooking.pricing.distanceFare, selectedBooking.pricing.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time Fare</span>
                  <span className="text-white">{formatCurrency(selectedBooking.pricing.timeFare, selectedBooking.pricing.currency)}</span>
                </div>
                {selectedBooking.pricing.surge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-400">Surge</span>
                    <span className="text-amber-400">+{formatCurrency(selectedBooking.pricing.surge, selectedBooking.pricing.currency)}</span>
                  </div>
                )}
                {selectedBooking.pricing.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-{formatCurrency(selectedBooking.pricing.discount, selectedBooking.pricing.currency)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-800 flex justify-between">
                  <span className="font-medium text-white">Total</span>
                  <span className="text-lg font-bold text-green-400">
                    {formatCurrency(selectedBooking.pricing.total, selectedBooking.pricing.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(selectedBooking.notes || selectedBooking.specialRequirements?.length) && (
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Additional Information</h4>
                {selectedBooking.notes && (
                  <p className="text-sm text-white mb-2">{selectedBooking.notes}</p>
                )}
                {selectedBooking.specialRequirements?.map((req, i) => (
                  <span key={i} className="inline-block px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded mr-2">
                    {req}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setNewScheduledTime('');
        }}
        title="Reschedule Booking"
        size="sm"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => {
                setShowRescheduleModal(false);
                setNewScheduledTime('');
              }}
            >
              Cancel
            </XpressButton>
            <XpressButton
              onClick={handleReschedule}
              disabled={!newScheduledTime || rescheduleBookingMutation.isPending}
              loading={rescheduleBookingMutation.isPending}
            >
              Reschedule
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select a new scheduled time for booking{' '}
            <span className="text-white font-medium">{selectedBooking?.bookingId}</span>
          </p>
          <input
            type="datetime-local"
            value={newScheduledTime}
            onChange={(e) => setNewScheduledTime(e.target.value)}
            className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason('');
        }}
        title="Cancel Booking"
        size="md"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason('');
              }}
            >
              Keep Booking
            </XpressButton>
            <XpressButton
              variant="danger"
              onClick={handleCancel}
              disabled={!cancelReason || cancelBookingMutation.isPending}
              loading={cancelBookingMutation.isPending}
            >
              Cancel Booking
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Are you sure you want to cancel booking{' '}
            <span className="text-white font-medium">{selectedBooking?.bookingId}</span>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cancellation Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full h-24 px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Assign Driver Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedDriverId('');
        }}
        title="Assign Driver"
        size="md"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedDriverId('');
              }}
            >
              Cancel
            </XpressButton>
            <XpressButton
              onClick={handleAssignDriver}
              disabled={!selectedDriverId || assignDriverMutation.isPending}
              loading={assignDriverMutation.isPending}
            >
              Assign Driver
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select a driver for booking{' '}
            <span className="text-white font-medium">{selectedBooking?.bookingId}</span>
          </p>
          <div className="space-y-2">
            {availableDrivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => setSelectedDriverId(driver.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                  selectedDriverId === driver.id
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.plate} • {driver.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{driver.distance.toFixed(1)} km</p>
                  <p className="text-xs text-gray-500">away</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Create Booking Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Booking"
        size="lg"
        footer={
          <>
            <XpressButton variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </XpressButton>
            <XpressButton onClick={() => setShowCreateModal(false)}>
              Create Booking
            </XpressButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Customer</label>
              <select className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white">
                <option>Select customer...</option>
                <option>John Smith</option>
                <option>Maria Garcia</option>
                <option>Pedro Cruz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
              <select className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white">
                <option>Taxi</option>
                <option>Moto</option>
                <option>Delivery</option>
                <option>Car</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pickup Address</label>
            <input
              type="text"
              placeholder="Enter pickup address..."
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dropoff Address</label>
            <input
              type="text"
              placeholder="Enter dropoff address..."
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Time</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              placeholder="Additional notes..."
              className="w-full h-20 px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingsList;
