/**
 * Bookings Service - API layer for booking management
 */
import { apiClient } from '@/lib/api/client';

export type BookingStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type BookingType = 'scheduled' | 'on-demand';
export type ServiceType = 'taxi' | 'moto' | 'delivery' | 'car';
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'none';

export interface Booking {
  bookingId: string;
  status: BookingStatus;
  type: BookingType;
  serviceType: ServiceType;
  
  // Customer info
  customer: {
    customerId: string;
    name: string;
    phone: string;
    email?: string;
  };
  
  // Location info
  pickup: {
    address: string;
    lat?: number;
    lng?: number;
    scheduledTime: string;
    notes?: string;
  };
  dropoff: {
    address: string;
    lat?: number;
    lng?: number;
    notes?: string;
  };
  
  // Driver info (optional until assigned)
  driver?: {
    driverId: string;
    name: string;
    phone: string;
    vehiclePlate: string;
    vehicleType: string;
    assignedAt?: string;
  };
  
  // Pricing
  pricing: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surge: number;
    discount: number;
    total: number;
    currency: string;
  };
  
  // Recurring booking
  recurring?: {
    isRecurring: boolean;
    pattern: RecurringPattern;
    endDate?: string;
    occurrences?: number;
    parentBookingId?: string;
  };
  
  // Metadata
  notes?: string;
  specialRequirements?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: 'customer' | 'admin' | 'system';
}

export interface BookingsFilters {
  status?: BookingStatus[];
  type?: BookingType;
  serviceType?: ServiceType[];
  startDate?: string;
  endDate?: string;
  customerId?: string;
  driverId?: string;
  searchQuery?: string;
  isRecurring?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface BookingsResponse {
  items: Booking[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateBookingRequest {
  customerId: string;
  type: BookingType;
  serviceType: ServiceType;
  pickup: {
    address: string;
    lat?: number;
    lng?: number;
    scheduledTime: string;
    notes?: string;
  };
  dropoff: {
    address: string;
    lat?: number;
    lng?: number;
    notes?: string;
  };
  recurring?: {
    isRecurring: boolean;
    pattern: RecurringPattern;
    endDate?: string;
    occurrences?: number;
  };
  notes?: string;
  specialRequirements?: string[];
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  pickup?: Partial<Booking['pickup']>;
  dropoff?: Partial<Booking['dropoff']>;
  driverId?: string;
  notes?: string;
  specialRequirements?: string[];
}

// Generate mock bookings for development
function generateMockBookings(page: number, pageSize: number, filters?: BookingsFilters): BookingsResponse {
  const statuses: BookingStatus[] = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
  const types: BookingType[] = ['scheduled', 'on-demand'];
  const serviceTypes: ServiceType[] = ['taxi', 'moto', 'delivery', 'car'];
  const customers = [
    { id: 'cust-001', name: 'John Smith', phone: '+63 912 345 6789' },
    { id: 'cust-002', name: 'Maria Garcia', phone: '+63 923 456 7890' },
    { id: 'cust-003', name: 'Pedro Cruz', phone: '+63 934 567 8901' },
    { id: 'cust-004', name: 'Ana Lopez', phone: '+63 945 678 9012' },
    { id: 'cust-005', name: 'Carlos Reyes', phone: '+63 956 789 0123' },
    { id: 'cust-006', name: 'Sofia Mendoza', phone: '+63 967 890 1234' },
    { id: 'cust-007', name: 'Miguel Torres', phone: '+63 978 901 2345' },
    { id: 'cust-008', name: 'Isabella Ramos', phone: '+63 989 012 3456' },
  ];
  const drivers = [
    { id: 'drv-001', name: 'Juan Santos', phone: '+63 911 222 3333', plate: 'ABC-123', type: 'Van' },
    { id: 'drv-002', name: 'Maria Cruz', phone: '+63 922 333 4444', plate: 'XYZ-789', type: 'Motorcycle' },
    { id: 'drv-003', name: 'Pedro Reyes', phone: '+63 933 444 5555', plate: 'DEF-456', type: 'Sedan' },
    { id: 'drv-004', name: 'Ana Lim', phone: '+63 944 555 6666', plate: 'GHI-789', type: 'Van' },
  ];
  const pickupLocations = [
    'Makati CBD', 'BGC, Taguig', 'Quezon City', 'Manila Bay', 
    'Ortigas Center', 'Alabang', 'Pasay City', 'NAIA Airport',
    'Cubao', 'Binondo', 'Malate', 'Pasig City'
  ];
  const dropoffLocations = [
    'Mall of Asia', 'Greenbelt', 'SM North EDSA', 'Trinoma',
    'Glorietta', 'Venice Grand Canal', 'Eastwood City', 'Bonifacio High Street',
    'Divisoria', 'Intramuros', 'Rizal Park', 'SM Megamall'
  ];

  const allBookings: Booking[] = Array.from({ length: 100 }, (_, i) => {
    const index = i + 1;
    const customer = customers[i % customers.length];
    const hasDriver = i % 3 !== 0;
    const isRecurring = i % 7 === 0;
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    const serviceType = serviceTypes[i % serviceTypes.length];
    const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const scheduledDate = new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);

    return {
      bookingId: `BK-${2025}-${String(index).padStart(4, '0')}`,
      status,
      type,
      serviceType,
      customer: {
        customerId: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: `${customer.name.toLowerCase().replace(' ', '.')}@example.com`,
      },
      pickup: {
        address: pickupLocations[i % pickupLocations.length],
        lat: 14.5995 + Math.random() * 0.05,
        lng: 120.9842 + Math.random() * 0.05,
        scheduledTime: scheduledDate.toISOString(),
        notes: i % 5 === 0 ? 'Ring doorbell twice' : undefined,
      },
      dropoff: {
        address: dropoffLocations[i % dropoffLocations.length],
        lat: 14.6095 + Math.random() * 0.05,
        lng: 120.9942 + Math.random() * 0.05,
      },
      driver: hasDriver ? {
        driverId: drivers[i % drivers.length].id,
        name: drivers[i % drivers.length].name,
        phone: drivers[i % drivers.length].phone,
        vehiclePlate: drivers[i % drivers.length].plate,
        vehicleType: drivers[i % drivers.length].type,
        assignedAt: new Date(createdDate.getTime() + 3600000).toISOString(),
      } : undefined,
      pricing: {
        baseFare: 50,
        distanceFare: Math.floor(Math.random() * 300),
        timeFare: Math.floor(Math.random() * 100),
        surge: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : 0,
        discount: Math.random() > 0.9 ? Math.floor(Math.random() * 50) : 0,
        total: Math.floor(Math.random() * 400) + 100,
        currency: 'PHP',
      },
      recurring: isRecurring ? {
        isRecurring: true,
        pattern: ['daily', 'weekly', 'monthly'][i % 3] as RecurringPattern,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        occurrences: 12,
      } : {
        isRecurring: false,
        pattern: 'none',
      },
      notes: i % 4 === 0 ? 'Priority customer' : undefined,
      specialRequirements: i % 6 === 0 ? ['Wheelchair accessible', 'Extra luggage space'] : undefined,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      createdBy: ['customer', 'admin', 'system'][i % 3] as 'customer' | 'admin' | 'system',
    };
  });

  // Apply filters
  let filtered = allBookings;
  if (filters?.status?.length) {
    filtered = filtered.filter(b => filters.status?.includes(b.status));
  }
  if (filters?.type) {
    filtered = filtered.filter(b => b.type === filters.type);
  }
  if (filters?.serviceType?.length) {
    filtered = filtered.filter(b => filters.serviceType?.includes(b.serviceType));
  }
  if (filters?.customerId) {
    filtered = filtered.filter(b => b.customer.customerId === filters.customerId);
  }
  if (filters?.driverId) {
    filtered = filtered.filter(b => b.driver?.driverId === filters.driverId);
  }
  if (filters?.isRecurring !== undefined) {
    filtered = filtered.filter(b => b.recurring?.isRecurring === filters.isRecurring);
  }
  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(b => 
      b.bookingId.toLowerCase().includes(query) ||
      b.customer.name.toLowerCase().includes(query) ||
      b.customer.phone.toLowerCase().includes(query) ||
      b.pickup.address.toLowerCase().includes(query) ||
      b.dropoff.address.toLowerCase().includes(query) ||
      b.driver?.name.toLowerCase().includes(query)
    );
  }

  // Pagination
  const pageNum = filters?.pageNumber || 1;
  const size = filters?.pageSize || 20;
  const start = (pageNum - 1) * size;
  const paginated = filtered.slice(start, start + size);

  return {
    items: paginated,
    total: filtered.length,
    pageNumber: pageNum,
    pageSize: size,
    totalPages: Math.ceil(filtered.length / size),
  };
}

export const bookingsService = {
  // Get bookings list
  async getBookings(filters: BookingsFilters = {}): Promise<BookingsResponse> {
    // For development, return mock data
    return generateMockBookings(filters.pageNumber || 1, filters.pageSize || 20, filters);
    
    // Real API call:
    // return apiClient.post<BookingsResponse>('api/bookings/list', filters);
  },

  // Get single booking
  async getBooking(bookingId: string): Promise<Booking | null> {
    const all = await this.getBookings({ pageNumber: 1, pageSize: 1000 });
    return all.items.find(b => b.bookingId === bookingId) || null;
    
    // Real API call:
    // return apiClient.get<Booking>(`api/bookings/${bookingId}`);
  },

  // Create booking
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    // Mock response
    return {
      bookingId: `BK-${2025}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      status: 'scheduled',
      type: data.type,
      serviceType: data.serviceType,
      customer: {
        customerId: data.customerId,
        name: 'New Customer',
        phone: '+63 900 000 0000',
      },
      pickup: data.pickup,
      dropoff: data.dropoff,
      pricing: {
        baseFare: 50,
        distanceFare: 0,
        timeFare: 0,
        surge: 0,
        discount: 0,
        total: 50,
        currency: 'PHP',
      },
      recurring: data.recurring ? {
        ...data.recurring,
        parentBookingId: undefined,
      } : {
        isRecurring: false,
        pattern: 'none',
      },
      notes: data.notes,
      specialRequirements: data.specialRequirements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    
    // Real API call:
    // return apiClient.post<Booking>('api/bookings', data);
  },

  // Update booking
  async updateBooking(bookingId: string, data: UpdateBookingRequest): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new Error('Booking not found');
    
    return {
      ...booking,
      ...data,
      pickup: { ...booking.pickup, ...data.pickup },
      dropoff: { ...booking.dropoff, ...data.dropoff },
      updatedAt: new Date().toISOString(),
    };
    
    // Real API call:
    // return apiClient.patch<Booking>(`api/bookings/${bookingId}`, data);
  },

  // Cancel booking
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    // Cancelling booking with reason
    // Mock success
    
    // Real API call:
    // await apiClient.post(`api/bookings/${bookingId}/cancel`, { reason });
  },

  // Assign driver
  async assignDriver(bookingId: string, driverId: string): Promise<void> {
    // Assigning driver to booking
    // Mock success
    
    // Real API call:
    // await apiClient.post(`api/bookings/${bookingId}/assign`, { driverId });
  },

  // Reschedule booking
  async rescheduleBooking(bookingId: string, newScheduledTime: string): Promise<void> {
    // Rescheduling booking
    // Mock success
    
    // Real API call:
    // await apiClient.post(`api/bookings/${bookingId}/reschedule`, { scheduledTime: newScheduledTime });
  },

  // Export bookings
  async exportBookings(filters: BookingsFilters): Promise<Blob> {
    // Mock CSV export
    const csvContent = 'Booking ID,Status,Customer,Pickup,Dropoff,Scheduled Time,Total\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return blob;
    
    // Real API call:
    // return apiClient.post<Blob>('api/bookings/export', filters, { responseType: 'blob' });
  },

  // Get available drivers for assignment
  async getAvailableDrivers(bookingId: string): Promise<Array<{ driverId: string; name: string; vehiclePlate: string; distance: number }>> {
    return [
      { driverId: 'drv-001', name: 'Juan Santos', vehiclePlate: 'ABC-123', distance: 0.5 },
      { driverId: 'drv-002', name: 'Maria Cruz', vehiclePlate: 'XYZ-789', distance: 1.2 },
      { driverId: 'drv-003', name: 'Pedro Reyes', vehiclePlate: 'DEF-456', distance: 0.8 },
      { driverId: 'drv-004', name: 'Ana Lim', vehiclePlate: 'GHI-789', distance: 2.1 },
    ];
  },
};
