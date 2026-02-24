// Shared types for the application

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  perPage?: number; // Alias for limit
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Integrity alert data
export interface IntegrityAlertData {
  driverId: string;
  shiftId?: string;
  tripId?: string;
  alertType: string;
  description: string;
  locationLat?: number;
  locationLng?: number;
  severity: number;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Date range filter
export interface DateRange {
  from?: Date;
  to?: Date;
}

// User context from JWT
export interface UserContext {
  userId: string;
  role: string;
  permissions: string[];
}
