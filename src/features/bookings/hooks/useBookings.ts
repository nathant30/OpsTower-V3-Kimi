import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsService, type Booking, type BookingsFilters, type CreateBookingRequest, type UpdateBookingRequest } from '@/services/bookings/bookings.service';

// Get bookings list
export function useBookings(filters: BookingsFilters = {}) {
  return useQuery({
    queryKey: ['bookings', 'list', filters],
    queryFn: () => bookingsService.getBookings(filters),
    staleTime: 30000,
  });
}

// Get single booking
export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsService.getBooking(bookingId!),
    enabled: !!bookingId,
  });
}

// Create booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

// Update booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingRequest }) => 
      bookingsService.updateBooking(bookingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

// Cancel booking
export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) => 
      bookingsService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

// Assign driver
export function useAssignDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, driverId }: { bookingId: string; driverId: string }) => 
      bookingsService.assignDriver(bookingId, driverId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

// Reschedule booking
export function useRescheduleBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, newScheduledTime }: { bookingId: string; newScheduledTime: string }) => 
      bookingsService.rescheduleBooking(bookingId, newScheduledTime),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

// Get available drivers
export function useAvailableDrivers(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['availableDrivers', bookingId],
    queryFn: () => bookingsService.getAvailableDrivers(bookingId!),
    enabled: !!bookingId,
  });
}

// Export bookings
export function useExportBookings() {
  return useMutation({
    mutationFn: (filters: BookingsFilters) => bookingsService.exportBookings(filters),
  });
}

// Status badge helper
export function getBookingStatusVariant(status: Booking['status']) {
  switch (status) {
    case 'scheduled':
      return 'info';
    case 'confirmed':
      return 'active';
    case 'in-progress':
      return 'warning';
    case 'completed':
      return 'active';
    case 'cancelled':
      return 'alert';
    case 'no-show':
      return 'offline';
    default:
      return 'default';
  }
}

// Status label helper
export function getBookingStatusLabel(status: Booking['status']) {
  const labels: Record<Booking['status'], string> = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show',
  };
  return labels[status] || status;
}

// Type badge helper
export function getBookingTypeVariant(type: Booking['type']) {
  return type === 'scheduled' ? 'info' : 'warning';
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options || defaultOptions);
}

// Format date only (no time)
export function formatDateOnly(dateString: string) {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
