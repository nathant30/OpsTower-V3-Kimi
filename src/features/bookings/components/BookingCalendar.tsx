import { useState, useMemo } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressButton } from '@/components/ui/XpressButton';
import { Modal } from '@/components/ui/Modal';
import type { Booking } from '@/services/bookings/bookings.service';
import {
  getBookingStatusVariant,
  getBookingStatusLabel,
  formatCurrency,
  formatDate,
} from '@/features/bookings/hooks/useBookings';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Clock,
  Repeat,
  Zap,
  Car,
} from 'lucide-react';

interface BookingCalendarProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
}

export function BookingCalendar({ bookings, onViewDetails }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Get calendar data
  const { daysInMonth, firstDayOfMonth, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
    return { daysInMonth, firstDayOfMonth, monthName, year };
  }, [currentDate]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const date = new Date(booking.pickup.scheduledTime).toDateString();
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(booking);
    });
    return map;
  }, [bookings]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfMonth, daysInMonth]);

  // Get bookings for a specific day
  const getBookingsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return bookingsByDate.get(date.toDateString()) || [];
  };

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <>
      <XpressCard>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <XpressButton variant="secondary" size="sm" onClick={goToToday}>
            Today
          </XpressButton>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-800 rounded-lg overflow-hidden">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-[#12121a] p-3 text-center">
              <span className="text-sm font-medium text-gray-400">{day}</span>
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="bg-[#12121a] min-h-[120px]" />;
            }

            const dayBookings = getBookingsForDay(day);
            const today = isToday(day);

            return (
              <div
                key={day}
                className={`bg-[#12121a] min-h-[120px] p-2 ${
                  today ? 'ring-1 ring-inset ring-orange-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      today ? 'text-orange-400' : 'text-gray-300'
                    }`}
                  >
                    {day}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-xs text-gray-500">{dayBookings.length}</span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <button
                      key={booking.bookingId}
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left p-1.5 rounded text-xs truncate transition-colors ${
                        booking.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : booking.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{booking.customer.name}</span>
                        {booking.recurring?.isRecurring && (
                          <Repeat className="w-3 h-3 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                  {dayBookings.length > 3 && (
                    <button
                      onClick={() => {
                        // Show all bookings for this day
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        alert(`${dayBookings.length} bookings on ${date.toLocaleDateString()}`);
                      }}
                      className="w-full text-center text-xs text-gray-500 hover:text-gray-300"
                    >
                      +{dayBookings.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/30" />
            <span className="text-xs text-gray-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
            <span className="text-xs text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <span className="text-xs text-gray-400">Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Recurring</span>
          </div>
        </div>
      </XpressCard>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md"
        footer={
          <XpressButton onClick={() => {
            if (selectedBooking) {
              onViewDetails(selectedBooking);
              setSelectedBooking(null);
            }
          }}>
            View Full Details
          </XpressButton>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedBooking.bookingId}</h3>
                <p className="text-sm text-gray-400">Created {formatDate(selectedBooking.createdAt)}</p>
              </div>
              <XpressBadge variant={getBookingStatusVariant(selectedBooking.status)}>
                {getBookingStatusLabel(selectedBooking.status)}
              </XpressBadge>
            </div>

            {/* Type & Recurring */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {selectedBooking.type === 'scheduled' ? (
                  <Calendar className="w-4 h-4 text-blue-400" />
                ) : (
                  <Zap className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-sm text-gray-300 capitalize">{selectedBooking.type}</span>
              </div>
              {selectedBooking.recurring?.isRecurring && (
                <div className="flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    {selectedBooking.recurring.pattern} recurring
                  </span>
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{selectedBooking.customer.name}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xs text-gray-500">Scheduled for</p>
                <p className="text-sm font-medium text-white">
                  {formatDate(selectedBooking.pickup.scheduledTime)}
                </p>
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="text-sm text-white">{selectedBooking.pickup.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Dropoff</p>
                  <p className="text-sm text-white">{selectedBooking.dropoff.address}</p>
                </div>
              </div>
            </div>

            {/* Driver */}
            {selectedBooking.driver && (
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedBooking.driver.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedBooking.driver.vehiclePlate} • {selectedBooking.driver.vehicleType}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="pt-3 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Fare</span>
                <span className="text-lg font-semibold text-green-400">
                  {formatCurrency(selectedBooking.pricing.total, selectedBooking.pricing.currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default BookingCalendar;
