/**
 * Domain entity type definitions
 * Drivers, Vehicles, Orders, Incidents, Finance
 */

// ==================== DRIVER / RIDER ====================

export interface Driver {
  driverId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    dateOfBirth?: string;
    address?: Address;
    avatar?: string;
  };
  status: DriverStatus;
  onlineStatus: OnlineStatus;
  trustScore: TrustScore;
  performance: DriverPerformance;
  earnings: DriverEarnings;
  compliance: DriverCompliance;
  vehicle?: VehicleAssignment;
  geofence?: DriverGeofence;
  shift?: ShiftInfo;
  createdAt: string;
  updatedAt: string;
}

export type DriverStatus = 'Active' | 'Idle' | 'Offline' | 'Suspended' | 'Deactivated' | 'Pending';
export type OnlineStatus = 'Online' | 'Offline' | 'OnTrip' | 'OnBreak';

export interface TrustScore {
  overall: number; // 0-100
  components: {
    reliability: number;
    safety: number;
    customerService: number;
    compliance: number;
  };
  history: TrustScoreSnapshot[];
}

export interface TrustScoreSnapshot {
  date: string;
  score: number;
}

export interface DriverPerformance {
  totalTrips: number;
  completionRate: number; // 0-100
  acceptanceRate: number; // 0-100
  cancellationRate: number; // 0-100
  averageRating: number; // 0-5
  totalRatings: number;
  onTimePercentage: number; // 0-100
}

export interface DriverEarnings {
  totalEarnings: number;
  currentBalance: number;
  pendingSettlement: number;
  lastPayoutDate?: string;
  averagePerTrip: number;
  averagePerHour: number;
}

export interface DriverCompliance {
  license: {
    number: string;
    expiryDate: string;
    status: 'Valid' | 'Expired' | 'Pending';
  };
  background: {
    clearanceDate?: string;
    status: 'Cleared' | 'Pending' | 'Failed';
  };
  training: {
    completedModules: string[];
    certificationDate?: string;
  };
  documents: Document[];
}

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  uploadedAt: string;
  expiresAt?: string;
}

export interface VehicleAssignment {
  vehicleId: string;
  plateNumber: string;
  assignedAt: string;
}

export interface DriverGeofence {
  homeZone: string;
  allowedZones: string[];
}

export interface ShiftInfo {
  currentShift?: string;
  shiftStart?: string;
  shiftEnd?: string;
  isOnBreak: boolean;
  breakStart?: string;
}

export type ShiftType = 'AM' | 'PM' | 'NIGHT' | 'Day' | 'Night' | 'Weekend' | 'Holiday' | 'Overtime';
export type ShiftStatus = 'Scheduled' | 'Active' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow' | 'ClockedIn';

// ==================== VEHICLE ====================

export interface Vehicle {
  vehicleId: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  currentLocation?: Location;
  assignedDriver?: DriverSummary;
  utilization: VehicleUtilization;
  maintenance: MaintenanceInfo;
  geofence?: VehicleGeofence;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export type VehicleType = 'Taxi' | 'Moto' | 'Idle' | 'Urban Demand' | 'Delivery';
export type VehicleStatus = 'Active' | 'Idle' | 'Maintenance' | 'Offline' | 'Decommissioned';

export interface Location {
  lat: number;
  lng: number;
  timestamp: string;
  heading?: number;
  speed?: number;
}

export interface DriverSummary {
  driverId: string;
  name: string;
  phone: string;
  assignedAt?: string;
}

export interface VehicleUtilization {
  hoursActive: number;
  tripsCompleted: number;
  revenueGenerated: number;
  distanceTraveled: number; // km
}

export interface MaintenanceInfo {
  lastService?: string;
  nextServiceDue?: string;
  mileage: number;
  serviceHistory: ServiceRecord[];
}

export interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
}

export interface VehicleGeofence {
  allowedZones: string[];
  restrictedZones: string[];
}

// ==================== ORDER ====================

export interface Order {
  orderId: string;
  transactionId: string;
  status: OrderStatus;
  serviceType: ServiceType;
  priority: Priority;
  
  customer: Customer;
  driver?: DriverInfo;
  
  route: Route;
  timeline: OrderTimeline;
  pricing: OrderPricing;
  
  flags: OrderFlags;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'Searching'
  | 'Assigned'
  | 'Accepted'
  | 'EnRoute'
  | 'Arrived'
  | 'OnTrip'
  | 'InTransit'
  | 'Completed'
  | 'Delivered'
  | 'Cancelled'
  | 'Scheduled'
  | 'Pending';

export type ServiceType = 'Taxi' | 'Moto' | 'Delivery' | 'Car';
export type Priority = 'Normal' | 'High' | 'Urgent';

export interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  rating: number;
}

export interface DriverInfo {
  driverId: string;
  name: string;
  vehicle: string;
  phone: string;
  assignedAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
}

export interface Route {
  pickup: Waypoint;
  dropoff: Waypoint;
  waypoints?: Waypoint[];
  distance: number; // meters
  estimatedDuration: number; // seconds
  actualDistance?: number;
  actualDuration?: number;
}

export interface Waypoint {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  notes?: string;
}

export interface OrderTimeline {
  bookedAt?: string;
  createdAt?: string;
  scheduledAt?: string;
  assignedAt?: string;
  acceptedAt?: string;
  arrivedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'Customer' | 'Driver' | 'System';
  cancellationReason?: string;
}

export interface OrderPricing {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  isPaid: boolean;
}

export interface OrderFlags {
  isPrioritized: boolean;
  isScheduled: boolean;
  hasSpecialRequirements: boolean;
  requiresVerification: boolean;
}

// ==================== INCIDENT ====================

export interface Incident {
  incidentId: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  priority: Priority;
  
  reportedBy: Reporter;
  involved: InvolvedParties;
  location?: Location;
  
  description: IncidentDescription;
  evidence: Evidence;
  investigation?: Investigation;
  disciplinaryAction?: DisciplinaryAction;
  timeline: IncidentTimeline;
  
  createdAt: string;
  updatedAt: string;
}

export type IncidentType = 
  | 'Accident'
  | 'SafetyViolation'
  | 'CustomerComplaint'
  | 'DriverMisconduct'
  | 'VehicleIssue'
  | 'PolicyViolation'
  | 'Fraud'
  | 'Other';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentPriority = 'Normal' | 'High' | 'Urgent';
export type IncidentStatus = 
  | 'New'
  | 'Reviewing'
  | 'Investigating'
  | 'PendingAction'
  | 'Hearing'
  | 'Resolved'
  | 'Closed';

export interface Reporter {
  type: 'Driver' | 'Customer' | 'System' | 'Admin';
  userId: string;
  name: string;
  reportedAt: string;
}

export interface InvolvedParties {
  drivers: DriverSummary[];
  vehicles: VehicleSummary[];
  customers: CustomerSummary[];
}

export interface VehicleSummary {
  vehicleId: string;
  plateNumber: string;
}

export interface CustomerSummary {
  customerId: string;
  name: string;
}

export interface IncidentDescription {
  summary: string;
  detailedNarrative: string;
  circumstances: string[];
}

export interface Evidence {
  photos: MediaFile[];
  videos: MediaFile[];
  documents: MediaFile[];
  witnesses: Witness[];
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Witness {
  name: string;
  contact: string;
  statement?: string;
}

export interface Investigation {
  assignedTo?: Investigator;
  findings?: string;
  recommendations?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Investigator {
  userId: string;
  name: string;
  assignedAt: string;
}

export interface DisciplinaryAction {
  actionType: 'Warning' | 'Suspension' | 'Termination' | 'Training';
  duration?: number; // days
  effectiveDate: string;
  reason: string;
  decidedBy: string;
  appealStatus?: 'None' | 'Pending' | 'Approved' | 'Rejected';
}

export interface IncidentTimeline {
  reportedAt: string;
  investigationStarted?: string;
  investigationCompleted?: string;
  actionTaken?: string;
  resolved?: string;
  reopened?: string;
}

// ==================== FINANCE ====================

export interface Transaction {
  transactionId: string;
  type: TransactionType;
  amount: number;
  currency: 'PHP';
  status: TransactionStatus;
  
  order?: OrderReference;
  parties: TransactionParties;
  breakdown: TransactionBreakdown;
  payment: PaymentInfo;
  
  metadata: TransactionMetadata;
  timestamps: TransactionTimestamps;
}

export type TransactionType = 
  | 'OrderPayment'
  | 'DriverEarnings'
  | 'Commission'
  | 'Payout'
  | 'TopUp'
  | 'Refund'
  | 'Adjustment'
  | 'Fee';

export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Reversed';

export interface OrderReference {
  orderId: string;
  serviceType: string;
}

export interface TransactionParties {
  from: Party;
  to: Party;
}

export interface Party {
  id: string;
  type: 'Customer' | 'Driver' | 'Platform' | 'Partner';
  name: string;
}

export interface TransactionBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surge: number;
  discount: number;
  commission: number;
  driverEarnings: number;
  fees: number;
}

export interface PaymentInfo {
  method: 'Cash' | 'Card' | 'Wallet' | 'GCash' | 'Maya';
  gateway?: string;
  referenceNumber?: string;
}

export interface TransactionMetadata {
  sourceSystem: string;
  auditLog: AuditEntry[];
  notes?: string;
}

export interface AuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export interface TransactionTimestamps {
  initiatedAt: string;
  completedAt?: string;
}

export interface Wallet {
  walletId: string;
  userId: string;
  userType: 'Driver' | 'Customer';
  
  balance: WalletBalance;
  limits: WalletLimits;
  
  lastTransaction?: {
    transactionId: string;
    amount: number;
    timestamp: string;
  };
}

export interface WalletBalance {
  available: number;
  pending: number;
  held: number;
}

export interface WalletLimits {
  maxBalance: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyWithdrawal: number;
}

export interface Settlement {
  settlementId: string;
  driverId: string;
  
  period: {
    startDate: string;
    endDate: string;
  };
  
  totals: {
    grossEarnings: number;
    deductions: number;
    netPayable: number;
  };
  
  itemization: {
    tripEarnings: number;
    bonuses: number;
    adjustments: number;
    fees: number;
  };
  
  status: 'Pending' | 'Approved' | 'Processing' | 'Completed' | 'Failed';
  
  payout: {
    method: 'BankTransfer' | 'GCash' | 'Maya' | 'Cash';
    account: string;
    accountName?: string;
    scheduledDate: string;
    completedDate?: string;
    referenceNumber?: string;
  };
}

// ==================== ADDRESS ====================

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ==================== DASHBOARD ====================

export interface DashboardStats {
  // Order metrics
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  // Revenue metrics
  totalRevenue: number;
  revenuePerHour: number;
  averageOrderValue: number;
  
  // Driver metrics
  activeDrivers: number;
  idleDrivers: number;
  offlineDrivers: number;
  totalDrivers: number;
  
  // Fleet metrics
  activeVehicles: number;
  idleVehicles: number;
  inMaintenance: number;
  totalVehicles: number;
  
  // Utilization
  fleetUtilization: number; // percentage
  driverUtilization: number; // percentage
  
  // Performance
  averageWaitTime: number; // seconds
  assignmentSuccessRate: number; // percentage
  completionRate: number; // percentage
  
  // Time range
  startDate: string;
  endDate: string;
}

export interface LiveMapOrder {
  orderId: string;
  status: OrderStatus;
  serviceType: ServiceType;
  pickup: Location;
  dropoff: Location;
  driverLocation?: Location;
  priority: Priority;
}

export interface LiveMapDriver {
  driverId: string;
  name: string;
  status: OnlineStatus;
  location: Location;
  vehicleType: VehicleType;
  currentOrderId?: string;
  trustScore: number;
}

export interface DemandPoint {
  lat: number;
  lng: number;
  value: number; // demand intensity
  zone: string;
}

// ==================== USER / AUTH ====================

export type UserRole = 
  | 'Viewer'
  | 'SupportAgent'
  | 'FinanceManager'
  | 'FleetManager'
  | 'OperationsManager'
  | 'OperationsDirector'
  | 'SuperAdmin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
