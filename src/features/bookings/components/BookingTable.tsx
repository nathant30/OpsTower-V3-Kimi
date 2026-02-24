import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressButton } from '@/components/ui/XpressButton';
import { Modal } from '@/components/ui/Modal';
import type { Booking } from '@/services/bookings/bookings.service';
import {
  getBookingStatusVariant,
  getBookingStatusLabel,
  getBookingTypeVariant,
  formatCurrency,
  formatDate,
  useAssignDriver,
  useCancelBooking,
  useAvailableDrivers,
} from '@/features/bookings/hooks/useBookings';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
  Repeat,
  Zap,
  UserPlus,
  Trash2,
  Edit,
} from 'lucide-react';

interface BookingTableProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onEdit: (booking: Booking) => void;
}

export function BookingTable({ bookings, onViewDetails, onEdit }: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const assignDriverMutation = useAssignDriver();
  const cancelBookingMutation = useCancelBooking();
  const { data: availableDrivers } = useAvailableDrivers(selectedBooking?.bookingId);

  const handleAssignDriver = async (driverId: string) => {
    if (!selectedBooking) return;
    await assignDriverMutation.mutateAsync({ bookingId: selectedBooking.bookingId, driverId });
    setShowAssignModal(false);
    setSelectedBooking(null);
  };

  const handleCancel = async () => {
    if (!selectedBooking || !cancelReason) return;
    await cancelBookingMutation.mutateAsync({ bookingId: selectedBooking.bookingId, reason: cancelReason });
    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelReason('');
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Booking ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Pickup</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Scheduled</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fare</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Driver</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.bookingId}
                className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onViewDetails(booking)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{booking.bookingId}</span>
                    {booking.recurring?.isRecurring && (
                      <Repeat className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm text-white">{booking.customer.name}</p>
                    <p className="text-xs text-gray-500">{booking.customer.phone}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300 truncate max-w-[150px]">
                      {booking.pickup.address}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    {formatDate(booking.pickup.scheduledTime)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <XpressBadge variant={getBookingStatusVariant(booking.status)}>
                    {getBookingStatusLabel(booking.status)}
                  </XpressBadge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {booking.type === 'scheduled' ? (
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <XpressBadge variant={getBookingTypeVariant(booking.type)}>
                      {booking.type === 'scheduled' ? 'Scheduled' : 'On-Demand'}
                    </XpressBadge>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-green-400">
                    {formatCurrency(booking.pricing.total, booking.pricing.currency)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {booking.driver ? (
                    <div>
                      <p className="text-sm text-white">{booking.driver.name}</p>
                      <p className="text-xs text-gray-500">{booking.driver.vehiclePlate}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not assigned</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(booking);
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!booking.driver && ['scheduled', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                          setShowAssignModal(true);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Assign Driver"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    {['scheduled', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Cancel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Driver Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Driver"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select a driver for booking <span className="text-white font-medium">{selectedBooking?.bookingId}</span>
          </p>
          <div className="space-y-2">
            {availableDrivers?.map((driver) => (
              <button
                key={driver.driverId}
                onClick={() => handleAssignDriver(driver.driverId)}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.vehiclePlate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{driver.distance.toFixed(1)} km away</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="md"
        footer={
          <>
            <XpressButton
              variant="ghost"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Booking
            </XpressButton>
            <XpressButton
              variant="danger"
              onClick={handleCancel}
              disabled={!cancelReason}
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
    </>
  );
}

export default BookingTable;
