/**
 * Passenger Service - API integration for passenger management
 */

import { apiClient } from '@/lib/api/client';

export type PassengerStatus = 'active' | 'suspended' | 'banned' | 'inactive';

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: PassengerStatus;
  rating: number;
  totalRides: number;
  totalSpent: number;
  joinedAt: string;
  lastRideAt?: string;
  photo?: string;
  trustScore: number;
  paymentMethods?: Array<{
    type: string;
    last4: string;
    isDefault: boolean;
  }>;
  savedAddresses?: Array<{
    id: string;
    label: string;
    address: string;
  }>;
  preferredServiceType?: string;
}

export interface PassengerFilters {
  search?: string;
  status?: PassengerStatus[];
  minRating?: number;
  maxRating?: number;
  joinedAfter?: string;
  joinedBefore?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PassengerListResponse {
  items: Passenger[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PassengerRide {
  id: string;
  date: string;
  from: string;
  to: string;
  serviceType: string;
  fare: number;
  status: 'completed' | 'cancelled' | 'disputed';
  driverName: string;
  rating?: number;
}

export interface PassengerStats {
  total: number;
  activeThisMonth: number;
  avgRating: number;
  totalRides: number;
  newThisWeek: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

// Mock data for development
const mockPassengers: Passenger[] = [
  {
    id: 'P001',
    firstName: 'Maria',
    lastName: 'Cruz',
    email: 'maria.cruz@email.com',
    phone: '+63 917 123 4567',
    status: 'active',
    rating: 4.8,
    totalRides: 156,
    totalSpent: 45680,
    joinedAt: '2024-01-15',
    lastRideAt: '2025-02-15',
    trustScore: 92,
    paymentMethods: [
      { type: 'GCash', last4: '4567', isDefault: true },
      { type: 'Maya', last4: '8901', isDefault: false },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '123 Makati Ave, Makati City' },
      { id: '2', label: 'Work', address: '456 Ortigas Center, Pasig City' },
    ],
    preferredServiceType: 'Taxi',
  },
  {
    id: 'P002',
    firstName: 'Juan',
    lastName: 'Santos',
    email: 'juan.santos@email.com',
    phone: '+63 918 234 5678',
    status: 'active',
    rating: 4.5,
    totalRides: 89,
    totalSpent: 23450,
    joinedAt: '2024-03-20',
    lastRideAt: '2025-02-16',
    trustScore: 85,
    paymentMethods: [
      { type: 'GCash', last4: '1234', isDefault: true },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '789 Quezon Ave, Quezon City' },
    ],
    preferredServiceType: 'Moto',
  },
  {
    id: 'P003',
    firstName: 'Ana',
    lastName: 'Lopez',
    email: 'ana.lopez@email.com',
    phone: '+63 919 345 6789',
    status: 'inactive',
    rating: 4.2,
    totalRides: 45,
    totalSpent: 12340,
    joinedAt: '2024-06-10',
    lastRideAt: '2024-12-01',
    trustScore: 78,
    paymentMethods: [
      { type: 'Card', last4: '4242', isDefault: true },
    ],
    savedAddresses: [],
  },
  {
    id: 'P004',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.m@email.com',
    phone: '+63 915 456 7890',
    status: 'active',
    rating: 4.9,
    totalRides: 234,
    totalSpent: 67890,
    joinedAt: '2023-11-05',
    lastRideAt: '2025-02-16',
    trustScore: 96,
    paymentMethods: [
      { type: 'GCash', last4: '7890', isDefault: true },
      { type: 'Card', last4: '8888', isDefault: false },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '321 BGC, Taguig' },
      { id: '2', label: 'Office', address: '654 Ayala Ave, Makati' },
      { id: '3', label: 'Gym', address: '987 Mandaluyong' },
    ],
    preferredServiceType: 'Taxi',
  },
  {
    id: 'P005',
    firstName: 'Sofia',
    lastName: 'Garcia',
    email: 'sofia.g@email.com',
    phone: '+63 916 567 8901',
    status: 'suspended',
    rating: 3.8,
    totalRides: 23,
    totalSpent: 5670,
    joinedAt: '2024-08-22',
    trustScore: 45,
    paymentMethods: [
      { type: 'Maya', last4: '5555', isDefault: true },
    ],
    savedAddresses: [],
  },
  {
    id: 'P006',
    firstName: 'Miguel',
    lastName: 'Torres',
    email: 'miguel.t@email.com',
    phone: '+63 913 678 9012',
    status: 'active',
    rating: 4.7,
    totalRides: 178,
    totalSpent: 52340,
    joinedAt: '2024-02-14',
    lastRideAt: '2025-02-14',
    trustScore: 88,
    paymentMethods: [
      { type: 'GCash', last4: '3333', isDefault: true },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '147 Pasay City' },
    ],
  },
  {
    id: 'P007',
    firstName: 'Isabella',
    lastName: 'Reyes',
    email: 'isabella.r@email.com',
    phone: '+63 914 789 0123',
    status: 'banned',
    rating: 2.1,
    totalRides: 12,
    totalSpent: 2340,
    joinedAt: '2024-09-15',
    trustScore: 15,
    paymentMethods: [],
    savedAddresses: [],
  },
  {
    id: 'P008',
    firstName: 'Rafael',
    lastName: 'Lim',
    email: 'rafael.lim@email.com',
    phone: '+63 915 890 1234',
    status: 'active',
    rating: 4.6,
    totalRides: 312,
    totalSpent: 89120,
    joinedAt: '2023-08-10',
    lastRideAt: '2025-02-17',
    trustScore: 94,
    paymentMethods: [
      { type: 'Card', last4: '9999', isDefault: true },
      { type: 'GCash', last4: '1111', isDefault: false },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '258 San Juan' },
      { id: '2', label: 'Work', address: '753 Muntinlupa' },
    ],
    preferredServiceType: 'Moto',
  },
  {
    id: 'P009',
    firstName: 'Carmen',
    lastName: 'Wong',
    email: 'carmen.w@email.com',
    phone: '+63 916 901 2345',
    status: 'active',
    rating: 4.4,
    totalRides: 67,
    totalSpent: 18900,
    joinedAt: '2024-05-20',
    lastRideAt: '2025-02-10',
    trustScore: 82,
    paymentMethods: [
      { type: 'GCash', last4: '7777', isDefault: true },
    ],
    savedAddresses: [],
  },
  {
    id: 'P010',
    firstName: 'Antonio',
    lastName: 'Tan',
    email: 'antonio.t@email.com',
    phone: '+63 917 012 3456',
    status: 'inactive',
    rating: 3.5,
    totalRides: 34,
    totalSpent: 8900,
    joinedAt: '2024-07-08',
    lastRideAt: '2024-11-20',
    trustScore: 60,
    paymentMethods: [
      { type: 'Maya', last4: '6666', isDefault: true },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '159 Las Piñas' },
    ],
  },
  {
    id: 'P011',
    firstName: 'Patricia',
    lastName: 'Go',
    email: 'patricia.g@email.com',
    phone: '+63 918 123 4567',
    status: 'active',
    rating: 4.9,
    totalRides: 445,
    totalSpent: 124500,
    joinedAt: '2023-05-15',
    lastRideAt: '2025-02-17',
    trustScore: 98,
    paymentMethods: [
      { type: 'GCash', last4: '2222', isDefault: true },
      { type: 'Card', last4: '3333', isDefault: false },
    ],
    savedAddresses: [
      { id: '1', label: 'Home', address: '357 Parañaque' },
      { id: '2', label: 'Office', address: '951 Makati' },
      { id: '3', label: 'Parents', address: '753 Caloocan' },
    ],
    preferredServiceType: 'Taxi',
  },
  {
    id: 'P012',
    firstName: 'Fernando',
    lastName: 'Sy',
    email: 'fernando.s@email.com',
    phone: '+63 919 234 5678',
    status: 'suspended',
    rating: 3.2,
    totalRides: 56,
    totalSpent: 14560,
    joinedAt: '2024-04-12',
    trustScore: 35,
    paymentMethods: [
      { type: 'GCash', last4: '4444', isDefault: true },
    ],
    savedAddresses: [],
  },
];

const mockRides: Record<string, PassengerRide[]> = {
  P001: [
    { id: 'R001', date: '2025-02-15', from: 'Makati CBD', to: 'BGC', serviceType: 'Taxi', fare: 285, status: 'completed', driverName: 'John Driver', rating: 5 },
    { id: 'R002', date: '2025-02-14', from: 'Quezon City', to: 'Ortigas', serviceType: 'Moto', fare: 125, status: 'completed', driverName: 'Mike Rider', rating: 4 },
    { id: 'R003', date: '2025-02-12', from: 'Manila', to: 'Makati', serviceType: 'Taxi', fare: 320, status: 'completed', driverName: 'Alex Drive', rating: 5 },
    { id: 'R004', date: '2025-02-10', from: 'BGC', to: 'Airport', serviceType: 'Taxi', fare: 450, status: 'completed', driverName: 'Sam Wheels', rating: 5 },
    { id: 'R005', date: '2025-02-08', from: 'Pasig', to: 'Mandaluyong', serviceType: 'Moto', fare: 95, status: 'completed', driverName: 'Tom Speed', rating: 4 },
  ],
  P002: [
    { id: 'R006', date: '2025-02-16', from: 'Ortigas', to: 'Makati', serviceType: 'Moto', fare: 110, status: 'completed', driverName: 'Jose Rizal', rating: 5 },
    { id: 'R007', date: '2025-02-14', from: 'BGC', to: 'QC', serviceType: 'Moto', fare: 180, status: 'completed', driverName: 'Pedro Paterno', rating: 4 },
  ],
  P004: [
    { id: 'R008', date: '2025-02-16', from: 'BGC', to: 'Makati', serviceType: 'Taxi', fare: 220, status: 'completed', driverName: 'Andres Bonifacio', rating: 5 },
    { id: 'R009', date: '2025-02-15', from: 'Airport', to: 'BGC', serviceType: 'Taxi', fare: 520, status: 'completed', driverName: 'Emilio Aguinaldo', rating: 5 },
    { id: 'R010', date: '2025-02-14', from: 'Ayala', to: 'Ortigas', serviceType: 'Taxi', fare: 280, status: 'completed', driverName: 'Manuel Quezon', rating: 5 },
    { id: 'R011', date: '2025-02-13', from: 'Makati', to: 'Airport', serviceType: 'Taxi', fare: 480, status: 'completed', driverName: 'Sergio Osmeña', rating: 5 },
  ],
};

const mockSupportTickets: Record<string, SupportTicket[]> = {
  P001: [
    { id: 'ST001', subject: 'Payment issue on last ride', status: 'resolved', createdAt: '2025-01-15', priority: 'medium' },
    { id: 'ST002', subject: 'Driver behavior complaint', status: 'closed', createdAt: '2024-12-10', priority: 'high' },
  ],
  P005: [
    { id: 'ST003', subject: 'Account suspension appeal', status: 'open', createdAt: '2025-02-10', priority: 'urgent' },
  ],
};

const mockStats: PassengerStats = {
  total: 12547,
  activeThisMonth: 8934,
  avgRating: 4.6,
  totalRides: 156789,
  newThisWeek: 234,
};

// Service functions
export const passengersService = {
  async getPassengers(filters: PassengerFilters = {}): Promise<PassengerListResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockPassengers];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(search) ||
          p.lastName.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.phone.includes(search) ||
          p.id.toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((p) => filters.status!.includes(p.status));
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter((p) => p.rating >= filters.minRating!);
    }
    if (filters.maxRating !== undefined) {
      filtered = filtered.filter((p) => p.rating <= filters.maxRating!);
    }

    const pageNumber = filters.pageNumber || 1;
    const pageSize = filters.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      total,
      pageNumber,
      pageSize,
      totalPages,
    };
  },

  async getPassenger(id: string): Promise<Passenger | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPassengers.find((p) => p.id === id) || null;
  },

  async getPassengerRides(id: string): Promise<PassengerRide[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockRides[id] || [];
  },

  async getPassengerTickets(id: string): Promise<SupportTicket[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockSupportTickets[id] || [];
  },

  async getPassengerStats(): Promise<PassengerStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStats;
  },

  async updatePassengerStatus(
    id: string,
    status: PassengerStatus,
    reason?: string
  ): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const passenger = mockPassengers.find((p) => p.id === id);
    if (passenger) {
      passenger.status = status;
    }
    return { success: true };
  },

  async sendMessage(id: string, message: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true };
  },
};

export default passengersService;
