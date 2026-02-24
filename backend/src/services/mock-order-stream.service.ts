// src/services/mock-order-stream.service.ts
// Mock Order Streaming Service - For Testing Purposes
// Generates fake orders to simulate real order data from XPRESS Philippines

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type OrderStatus = 'Pending' | 'Assigned' | 'InTransit' | 'Delivered';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface MockOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  driverId: string | null;
  driverName: string | null;
  pickupLocation: Location;
  dropoffLocation: Location;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
}

export interface MockDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
}

export interface StreamConfig {
  minIntervalMs: number;
  maxIntervalMs: number;
  autoAdvanceStatuses: boolean;
  statusAdvanceIntervalMs: number;
  maxOrdersInMemory: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_DRIVERS: MockDriver[] = [
  { id: 'DRV-001', name: 'Juan Santos', phone: '+63 912 345 6789', vehicleType: 'Motorcycle', plateNumber: 'ABC-1234' },
  { id: 'DRV-002', name: 'Maria Garcia', phone: '+63 923 456 7890', vehicleType: 'Motorcycle', plateNumber: 'XYZ-5678' },
  { id: 'DRV-003', name: 'Pedro Reyes', phone: '+63 934 567 8901', vehicleType: 'Van', plateNumber: 'DEF-9012' },
  { id: 'DRV-004', name: 'Ana Cruz', phone: '+63 945 678 9012', vehicleType: 'Motorcycle', plateNumber: 'GHI-3456' },
  { id: 'DRV-005', name: 'Miguel Lim', phone: '+63 956 789 0123', vehicleType: 'Van', plateNumber: 'JKL-7890' },
  { id: 'DRV-006', name: 'Sofia Tan', phone: '+63 967 890 1234', vehicleType: 'Motorcycle', plateNumber: 'MNO-1234' },
  { id: 'DRV-007', name: 'Ramon Diaz', phone: '+63 978 901 2345', vehicleType: 'Sedan', plateNumber: 'PQR-5678' },
  { id: 'DRV-008', name: 'Carmen Ocampo', phone: '+63 989 012 3456', vehicleType: 'Motorcycle', plateNumber: 'STU-9012' },
];

const PHILIPPINE_LOCATIONS = {
  makati: [
    { address: 'Ayala Triangle Gardens, Makati Ave, Makati City', latitude: 14.5565, longitude: 121.0233 },
    { address: 'Greenbelt 5, Ayala Center, Makati City', latitude: 14.5532, longitude: 121.0215 },
    { address: 'Makati Medical Center, Amorsolo St, Makati City', latitude: 14.5547, longitude: 121.0167 },
    { address: 'Power Plant Mall, Rockwell Center, Makati City', latitude: 14.5648, longitude: 121.0371 },
    { address: 'Salcedo Village, Makati City', latitude: 14.5589, longitude: 121.0189 },
    { address: 'Legazpi Village, Makati City', latitude: 14.5513, longitude: 121.0194 },
  ],
  bgc: [
    { address: 'Bonifacio High Street, BGC, Taguig City', latitude: 14.5511, longitude: 121.0511 },
    { address: 'SM Aura Premier, BGC, Taguig City', latitude: 14.5465, longitude: 121.0543 },
    { address: 'Market! Market!, BGC, Taguig City', latitude: 14.5502, longitude: 121.0565 },
    { address: 'Uptown Mall, 36th St, BGC, Taguig City', latitude: 14.5534, longitude: 121.0489 },
    { address: 'One Bonifacio High Street, 5th Ave, BGC', latitude: 14.5542, longitude: 121.0501 },
  ],
  manila: [
    { address: 'Intramuros, Manila City', latitude: 14.5916, longitude: 120.9736 },
    { address: 'Divisoria Market, Tondo, Manila City', latitude: 14.6056, longitude: 120.9673 },
    { address: 'SM Mall of Asia, Pasay City', latitude: 14.5350, longitude: 120.9828 },
    { address: 'Rizal Park, Ermita, Manila City', latitude: 14.5823, longitude: 120.9784 },
    { address: 'Binondo, Manila City', latitude: 14.6008, longitude: 120.9746 },
  ],
  quezonCity: [
    { address: 'SM North EDSA, Quezon City', latitude: 14.6568, longitude: 121.0297 },
    { address: 'TriNoma, EDSA cor North Ave, Quezon City', latitude: 14.6554, longitude: 121.0329 },
    { address: 'Eastwood City, Libis, Quezon City', latitude: 14.6092, longitude: 121.0794 },
    { address: 'Araneta City, Cubao, Quezon City', latitude: 14.6195, longitude: 121.0591 },
    { address: 'UP Town Center, Katipunan Ave, Quezon City', latitude: 14.6489, longitude: 121.0751 },
  ],
};

const CUSTOMER_FIRST_NAMES = [
  'Juan', 'Maria', 'Jose', 'Anna', 'Pedro', 'Carmen', 'Miguel', 'Sofia', 'Ramon', 'Elena',
  'Antonio', 'Rosario', 'Francisco', 'Teresa', 'Carlos', 'Isabel', 'Manuel', 'Dolores', 'Andres', 'Cecilia',
  'Fernando', 'Patricia', 'Ricardo', 'Beatriz', 'Roberto', 'Gabriela', 'Alberto', 'Victoria', 'Javier', 'Monica',
  'Luis', 'Nina', 'Eduardo', 'Kristine', 'Rafael', 'Jasmine', 'Diego', 'Angela', 'Joaquin', 'Mariana'
];

const CUSTOMER_LAST_NAMES = [
  'Santos', 'Reyes', 'Cruz', 'Garcia', 'Bautista', 'Mendoza', 'Torres', 'Flores', 'Diaz', 'Lim',
  'Tan', 'Ocampo', 'Ramos', 'Castro', 'Rivera', 'Aquino', 'Santiago', 'Del Rosario', 'Navarro', 'Valdez',
  'Sy', 'Chua', 'Go', 'Lee', 'Wong', 'Villanueva', 'De Leon', 'Domingo', 'Salazar', 'Pascual',
  'Villamor', 'Mercado', 'Guerrero', 'Aguilar', 'Peralta', 'Miranda', 'Pineda', 'Soriano', 'Alvarez', 'Enriquez'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function generateOrderNumber(sequence: number): string {
  const dateStr = formatDate(new Date());
  const seqStr = String(sequence).padStart(3, '0');
  return `MOCK-${dateStr}-${seqStr}`;
}

function generateCustomerName(): string {
  const firstName = randomItem(CUSTOMER_FIRST_NAMES);
  const lastName = randomItem(CUSTOMER_LAST_NAMES);
  return `${firstName} ${lastName}`;
}

function generateCustomerPhone(): string {
  const prefixes = ['+63 917', '+63 918', '+63 927', '+63 928', '+63 939', '+63 949', '+63 955', '+63 966', '+63 977', '+63 988'];
  const prefix = randomItem(prefixes);
  const suffix = randomInt(1000000, 9999999);
  return `${prefix} ${suffix}`;
}

function generateLocationPair(): { pickup: Location; dropoff: Location } {
  // Get all location arrays
  const allLocations = [
    ...PHILIPPINE_LOCATIONS.makati,
    ...PHILIPPINE_LOCATIONS.bgc,
    ...PHILIPPINE_LOCATIONS.manila,
    ...PHILIPPINE_LOCATIONS.quezonCity,
  ];

  // Pick pickup and dropoff from different areas to ensure variety
  const areas = Object.keys(PHILIPPINE_LOCATIONS) as Array<keyof typeof PHILIPPINE_LOCATIONS>;
  const pickupArea = randomItem(areas);
  let dropoffArea = randomItem(areas);
  
  // Ensure pickup and dropoff are from different areas (80% of the time)
  if (areas.length > 1 && Math.random() < 0.8) {
    while (dropoffArea === pickupArea) {
      dropoffArea = randomItem(areas);
    }
  }

  const pickup = randomItem(PHILIPPINE_LOCATIONS[pickupArea]);
  const dropoff = randomItem(PHILIPPINE_LOCATIONS[dropoffArea]);

  return { pickup, dropoff };
}

function generateTotalAmount(): number {
  // Generate amount between 100 and 500, rounded to 2 decimal places
  const amount = randomInt(10000, 50000) / 100;
  return Math.round(amount * 100) / 100;
}

// ============================================================================
// MOCK ORDER STREAM SERVICE
// ============================================================================

class MockOrderStreamService {
  private orders: MockOrder[] = [];
  private isRunning: boolean = false;
  private orderSequence: number = 1;
  private streamTimeoutId: NodeJS.Timeout | null = null;
  private statusUpdateIntervalId: NodeJS.Timeout | null = null;
  private config: StreamConfig;

  // Default configuration
  private static readonly DEFAULT_CONFIG: StreamConfig = {
    minIntervalMs: 5000,      // 5 seconds
    maxIntervalMs: 30000,     // 30 seconds
    autoAdvanceStatuses: true,
    statusAdvanceIntervalMs: 15000, // 15 seconds between status updates
    maxOrdersInMemory: 1000,
  };

  constructor(config: Partial<StreamConfig> = {}) {
    this.config = { ...MockOrderStreamService.DEFAULT_CONFIG, ...config };
  }

  // ========================================================================
  // STREAM CONTROL
  // ========================================================================

  /**
   * Start the mock order stream
   */
  startStream(): void {
    if (this.isRunning) {
      console.log('[MockOrderStream] Stream is already running');
      return;
    }

    this.isRunning = true;
    console.log('[MockOrderStream] Stream started');

    // Schedule the first order generation
    this.scheduleNextOrder();

    // Start status auto-advance if enabled
    if (this.config.autoAdvanceStatuses) {
      this.startStatusAutoAdvance();
    }
  }

  /**
   * Stop the mock order stream
   */
  stopStream(): void {
    if (!this.isRunning) {
      console.log('[MockOrderStream] Stream is not running');
      return;
    }

    this.isRunning = false;

    if (this.streamTimeoutId) {
      clearTimeout(this.streamTimeoutId);
      this.streamTimeoutId = null;
    }

    if (this.statusUpdateIntervalId) {
      clearInterval(this.statusUpdateIntervalId);
      this.statusUpdateIntervalId = null;
    }

    console.log('[MockOrderStream] Stream stopped');
  }

  /**
   * Check if stream is running
   */
  isStreamRunning(): boolean {
    return this.isRunning;
  }

  // ========================================================================
  // ORDER GENERATION
  // ========================================================================

  private scheduleNextOrder(): void {
    if (!this.isRunning) return;

    const delay = randomInt(this.config.minIntervalMs, this.config.maxIntervalMs);
    
    this.streamTimeoutId = setTimeout(() => {
      this.generateOrder();
      this.scheduleNextOrder();
    }, delay);
  }

  private generateOrder(): MockOrder {
    const locations = generateLocationPair();
    const now = new Date();
    
    const order: MockOrder = {
      id: `mock-${Date.now()}-${randomInt(1000, 9999)}`,
      orderNumber: generateOrderNumber(this.orderSequence++),
      status: 'Pending',
      customerName: generateCustomerName(),
      customerPhone: generateCustomerPhone(),
      driverId: null,
      driverName: null,
      pickupLocation: locations.pickup,
      dropoffLocation: locations.dropoff,
      totalAmount: generateTotalAmount(),
      createdAt: now,
      updatedAt: now,
    };

    // Add to orders array
    this.orders.unshift(order);

    // Trim if exceeds max
    if (this.orders.length > this.config.maxOrdersInMemory) {
      this.orders = this.orders.slice(0, this.config.maxOrdersInMemory);
    }

    console.log(`[MockOrderStream] Generated order: ${order.orderNumber} - ${order.customerName}`);

    return order;
  }

  // ========================================================================
  // STATUS MANAGEMENT
  // ========================================================================

  private startStatusAutoAdvance(): void {
    // Update statuses every configured interval
    this.statusUpdateIntervalId = setInterval(() => {
      this.advanceOrderStatuses();
    }, this.config.statusAdvanceIntervalMs);
  }

  private advanceOrderStatuses(): void {
    const now = new Date();
    let updatedCount = 0;

    for (const order of this.orders) {
      // Only advance orders that aren't already delivered
      if (order.status === 'Delivered') continue;

      // 30% chance to advance each non-delivered order
      if (Math.random() < 0.3) {
        this.advanceOrderStatus(order, now);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[MockOrderStream] Advanced ${updatedCount} order(s) to next status`);
    }
  }

  private advanceOrderStatus(order: MockOrder, timestamp: Date): void {
    const statusFlow: OrderStatus[] = ['Pending', 'Assigned', 'InTransit', 'Delivered'];
    const currentIndex = statusFlow.indexOf(order.status);

    if (currentIndex < statusFlow.length - 1) {
      const newStatus = statusFlow[currentIndex + 1];
      
      // If moving to Assigned, assign a random driver
      if (newStatus === 'Assigned') {
        const driver = randomItem(MOCK_DRIVERS);
        order.driverId = driver.id;
        order.driverName = driver.name;
        order.assignedAt = timestamp;
      }

      if (newStatus === 'InTransit') {
        order.inTransitAt = timestamp;
      }

      if (newStatus === 'Delivered') {
        order.deliveredAt = timestamp;
      }

      order.status = newStatus;
      order.updatedAt = timestamp;

      console.log(`[MockOrderStream] Order ${order.orderNumber} status: ${order.status}`);
    }
  }

  // ========================================================================
  // PUBLIC API METHODS
  // ========================================================================

  /**
   * Get all orders (optionally filtered)
   */
  getOrders(filters?: {
    status?: OrderStatus;
    driverId?: string;
    limit?: number;
  }): MockOrder[] {
    let result = [...this.orders];

    if (filters?.status) {
      result = result.filter(o => o.status === filters.status);
    }

    if (filters?.driverId) {
      result = result.filter(o => o.driverId === filters.driverId);
    }

    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): MockOrder | undefined {
    return this.orders.find(o => o.id === orderId);
  }

  /**
   * Get order by order number
   */
  getOrderByNumber(orderNumber: string): MockOrder | undefined {
    return this.orders.find(o => o.orderNumber === orderNumber);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: OrderStatus): MockOrder[] {
    return this.orders.filter(o => o.status === status);
  }

  /**
   * Get count of orders by status
   */
  getOrderCountsByStatus(): Record<OrderStatus, number> {
    const counts: Record<OrderStatus, number> = {
      Pending: 0,
      Assigned: 0,
      InTransit: 0,
      Delivered: 0,
    };

    for (const order of this.orders) {
      counts[order.status]++;
    }

    return counts;
  }

  /**
   * Get total order count
   */
  getTotalOrderCount(): number {
    return this.orders.length;
  }

  /**
   * Get all mock drivers
   */
  getMockDrivers(): MockDriver[] {
    return [...MOCK_DRIVERS];
  }

  /**
   * Get a random driver
   */
  getRandomDriver(): MockDriver {
    return randomItem(MOCK_DRIVERS);
  }

  /**
   * Assign a driver to an order
   * Returns true if successful, false if order not found or already has driver
   */
  assignDriver(orderId: string, driverId: string): boolean {
    const order = this.getOrderById(orderId);
    
    if (!order) {
      console.log(`[MockOrderStream] Order not found: ${orderId}`);
      return false;
    }

    if (order.status !== 'Pending') {
      console.log(`[MockOrderStream] Cannot assign driver to order ${order.orderNumber}: status is ${order.status}`);
      return false;
    }

    const driver = MOCK_DRIVERS.find(d => d.id === driverId);
    if (!driver) {
      console.log(`[MockOrderStream] Driver not found: ${driverId}`);
      return false;
    }

    order.driverId = driver.id;
    order.driverName = driver.name;
    order.status = 'Assigned';
    order.assignedAt = new Date();
    order.updatedAt = new Date();

    console.log(`[MockOrderStream] Driver ${driver.name} assigned to order ${order.orderNumber}`);
    return true;
  }

  /**
   * Manually advance an order to the next status
   */
  advanceOrder(orderId: string): boolean {
    const order = this.getOrderById(orderId);
    
    if (!order) {
      return false;
    }

    if (order.status === 'Delivered') {
      return false;
    }

    this.advanceOrderStatus(order, new Date());
    return true;
  }

  /**
   * Create a manual order (bypasses the stream)
   */
  createManualOrder(overrides?: Partial<MockOrder>): MockOrder {
    const locations = generateLocationPair();
    const now = new Date();
    
    const order: MockOrder = {
      id: `mock-manual-${Date.now()}-${randomInt(1000, 9999)}`,
      orderNumber: generateOrderNumber(this.orderSequence++),
      status: 'Pending',
      customerName: generateCustomerName(),
      customerPhone: generateCustomerPhone(),
      driverId: null,
      driverName: null,
      pickupLocation: locations.pickup,
      dropoffLocation: locations.dropoff,
      totalAmount: generateTotalAmount(),
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };

    this.orders.unshift(order);

    if (this.orders.length > this.config.maxOrdersInMemory) {
      this.orders = this.orders.slice(0, this.config.maxOrdersInMemory);
    }

    console.log(`[MockOrderStream] Manual order created: ${order.orderNumber}`);
    return order;
  }

  /**
   * Clear all orders
   */
  clearOrders(): void {
    this.orders = [];
    this.orderSequence = 1;
    console.log('[MockOrderStream] All orders cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<StreamConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[MockOrderStream] Configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): StreamConfig {
    return { ...this.config };
  }

  /**
   * Get service statistics
   */
  getStats(): {
    isRunning: boolean;
    totalOrders: number;
    orderCounts: Record<OrderStatus, number>;
    config: StreamConfig;
  } {
    return {
      isRunning: this.isRunning,
      totalOrders: this.orders.length,
      orderCounts: this.getOrderCountsByStatus(),
      config: this.getConfig(),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE EXPORT
// ============================================================================

export const mockOrderStream = new MockOrderStreamService();

export default mockOrderStream;

// Also export the class for custom instances
export { MockOrderStreamService };
