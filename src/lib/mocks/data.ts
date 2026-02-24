/**
 * Mock Data for OpsTower V2 Development
 * Realistic Philippines ride-hailing context with Filipino names, Metro Manila locations, PHP currency
 */

import type {
  Driver,
  Vehicle,
  Order,
  Incident,
  Transaction,
  DashboardStats,
  LiveMapOrder,
  LiveMapDriver,
  User,
  Wallet,
  Settlement,
} from '@/types/domain.types';

// ==================== UTILITY FUNCTIONS ====================

const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2): number => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randomDate = (daysBack: number, daysForward = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(daysBack, daysBack + daysForward));
  return date.toISOString();
};

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ==================== FILIPINO DATA ====================

const firstNames = [
  'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Carmen', 'Miguel', 'Rosa', 'Antonio', 'Teresa',
  'Fernando', 'Elena', 'Ricardo', 'Patricia', 'Roberto', 'Isabella', 'Carlos', 'Sofia',
  'Manuel', 'Lucia', 'Francisco', 'Dolores', 'Gabriel', 'Cristina', 'Andres', 'Victoria',
  'Diego', 'Gabriela', 'Javier', 'Valentina', 'Rafael', 'Camila', 'Alejandro', 'Natalia',
  'Santiago', 'Mariana', 'Daniel', 'Daniela', 'Eduardo', 'Paula', 'Luis', 'Alejandra',
  'Jorge', 'Fernanda', 'Alberto', 'Jimena', 'Raul', 'Juliana', 'Hector', 'Marisol'
];

const lastNames = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Agustin',
  'Villanueva', 'Fernandez', 'Dela Cruz', 'Gonzalez', 'Ramos', 'Castillo', 'Rivera',
  'Dominguez', 'Martinez', 'Lopez', 'Perez', 'Sanchez', 'Ramirez', 'Flores', 'Morales',
  'Nguyen', 'Tan', 'Lim', 'Sy', 'Go', 'Chua', 'Wong', 'Lee', 'Chen', 'Chan', 'Uy',
  'Navarro', 'De Guzman', 'Aquino', 'Marcos', 'Roxas', 'Magsaysay', 'Rizal', 'Bonifacio',
  'Dagohoy', 'Silang', 'Lapu-Lapu', 'Luna', 'Del Pilar', 'Aguinaldo', 'Quezon'
];

const streets = [
  'EDSA', 'Ortigas Avenue', 'Makati Avenue', 'Ayala Avenue', 'Roxas Boulevard',
  'Quirino Highway', 'Commonwealth Avenue', 'Quezon Avenue', 'Taft Avenue', 'Shaw Boulevard',
  'Magsaysay Boulevard', 'Espanya Boulevard', 'Recto Avenue', 'Juan Luna Street',
  'Mabini Street', 'Rizal Avenue', 'Kalayaan Avenue', 'Katipunan Avenue', 'C5 Road',
  'SLEX', 'NLEX', 'Marcos Highway', 'Osmena Highway', 'Araneta Avenue', 'Aurora Boulevard'
];

const cities = [
  'Makati', 'Mandaluyong', 'Pasig', 'Taguig', 'Quezon City', 'Manila', 'San Juan',
  'Pasay', 'Paranaque', 'Las Pinas', 'Muntinlupa', 'Caloocan', 'Malabon', 'Navotas',
  'Valenzuela', 'Marikina', 'Pateros', 'Tagaytay', 'Antipolo', 'Cainta'
];

const barangays = [
  'Barangay 1', 'Poblacion', 'San Antonio', 'San Isidro', 'Santa Mesa', 'San Miguel',
  'Ermita', 'Malate', 'Tondo', 'Binondo', 'Quiapo', 'Sampaloc', 'Santa Ana',
  'Valenzuela', 'Bel-Air', 'Salcedo Village', 'Legaspi Village', 'Greenbelt',
  'Forbes Park', 'Dasmarinas Village', 'San Lorenzo', 'Urdaneta Village', 'Magallanes'
];

const vehicleMakes = ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Hyundai', 'Kia', 'Nissan', 'Ford'];
const vehicleModels = {
  'Toyota': ['Vios', 'Innova', 'Fortuner', 'Hiace', 'Wigo', 'Altis', 'Avanza', 'Rush'],
  'Honda': ['City', 'Civic', 'Brio', 'CR-V', 'BR-V', 'Mobilio', 'Jazz'],
  'Mitsubishi': ['Mirage', 'Montero', 'Xpander', 'Strada', 'L300', 'ASX'],
  'Suzuki': ['Ertiga', 'Celerio', 'Swift', 'Vitara', 'APV', 'Carry'],
  'Hyundai': ['Reina', 'Accent', 'Tucson', 'Santa Fe', 'Starex', 'Kona'],
  'Kia': ['Soluto', 'Rio', 'Sportage', 'Seltos', 'Carnival'],
  'Nissan': ['Almera', 'Navara', 'Terra', 'Juke', 'Sylphy', 'Urvan'],
  'Ford': ['Ranger', 'Everest', 'EcoSport', 'Territory', 'Transit'],
};

// Metro Manila coordinates (rough bounds)
const MM_BOUNDS = {
  lat: { min: 14.35, max: 14.75 },
  lng: { min: 120.95, max: 121.15 }
};

const generateLocation = () => ({
  lat: randomFloat(MM_BOUNDS.lat.min, MM_BOUNDS.lat.max, 6),
  lng: randomFloat(MM_BOUNDS.lng.min, MM_BOUNDS.lng.max, 6),
  timestamp: new Date().toISOString(),
});

const generateAddress = (): string => {
  const street = randomElement(streets);
  const city = randomElement(cities);
  const barangay = randomElement(barangays);
  const number = randomInt(1, 999);
  return `${number} ${street}, ${barangay}, ${city}, Metro Manila`;
};

const generatePhone = (): string => {
  const prefixes = ['0917', '0918', '0920', '0921', '0922', '0923', '0925', '0926', '0927', '0928', '0930', '0935', '0936', '0937', '0942', '0943', '0945', '0946', '0950', '0951', '0953', '0954', '0955', '0956', '0961', '0963', '0965', '0966', '0967', '0973', '0974', '0975', '0977', '0978', '0979', '0995', '0996', '0997', '0998', '0999'];
  return `${randomElement(prefixes)}${randomInt(1000000, 9999999)}`;
};

// ==================== DRIVERS ====================

export const mockDrivers: Driver[] = Array.from({ length: 25 }, (_, i) => {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const driverId = `DRV${String(i + 1).padStart(6, '0')}`;
  const trustScore = randomInt(65, 98);
  const totalTrips = randomInt(100, 5000);
  
  return {
    driverId,
    personalInfo: {
      firstName,
      lastName,
      phone: generatePhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      dateOfBirth: randomDate(365 * 50, 365 * 20),
      address: {
        street: randomElement(streets),
        city: randomElement(cities),
        state: 'Metro Manila',
        zipCode: String(randomInt(1000, 1999)),
        country: 'Philippines',
        coordinates: generateLocation(),
      },
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${driverId}`,
    },
    status: randomElement(['Active', 'Active', 'Active', 'Active', 'Idle', 'Offline', 'Suspended', 'Pending']),
    onlineStatus: randomElement(['Online', 'Online', 'Online', 'OnTrip', 'OnBreak', 'Offline']),
    trustScore: {
      overall: trustScore,
      components: {
        reliability: randomInt(60, 100),
        safety: randomInt(70, 100),
        customerService: randomInt(65, 100),
        compliance: randomInt(70, 100),
      },
      history: Array.from({ length: 30 }, (_, j) => ({
        date: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.max(60, trustScore + randomInt(-10, 10)),
      })),
    },
    performance: {
      totalTrips,
      completionRate: randomFloat(85, 99),
      acceptanceRate: randomFloat(70, 95),
      cancellationRate: randomFloat(1, 8),
      averageRating: randomFloat(4.2, 4.9),
      totalRatings: Math.floor(totalTrips * 0.7),
      onTimePercentage: randomFloat(80, 98),
    },
    earnings: {
      totalEarnings: randomFloat(50000, 500000),
      currentBalance: randomFloat(0, 15000),
      pendingSettlement: randomFloat(0, 5000),
      lastPayoutDate: randomDate(7),
      averagePerTrip: randomFloat(80, 250),
      averagePerHour: randomFloat(150, 350),
    },
    compliance: {
      license: {
        number: `L${randomInt(10000000, 99999999)}`,
        expiryDate: randomDate(365, 730),
        status: randomElement(['Valid', 'Valid', 'Valid', 'Valid', 'Pending']),
      },
      background: {
        clearanceDate: randomDate(365),
        status: 'Cleared',
      },
      training: {
        completedModules: ['Safety Basics', 'Customer Service', 'Route Optimization'],
        certificationDate: randomDate(180),
      },
      documents: [
        {
          id: `DOC${randomInt(1000, 9999)}`,
          type: 'License',
          name: 'Professional Driver\'s License',
          url: '/docs/license.pdf',
          status: 'Approved',
          uploadedAt: randomDate(365),
          expiresAt: randomDate(365, 730),
        },
        {
          id: `DOC${randomInt(1000, 9999)}`,
          type: 'NBI',
          name: 'NBI Clearance',
          url: '/docs/nbi.pdf',
          status: 'Approved',
          uploadedAt: randomDate(180),
          expiresAt: randomDate(180, 365),
        },
      ],
    },
    vehicle: i < 20 ? {
      vehicleId: `VEH${String(i + 1).padStart(6, '0')}`,
      plateNumber: `${randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])}${randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])}${randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])} ${randomInt(100, 9999)}`,
      assignedAt: randomDate(365),
    } : undefined,
    geofence: {
      homeZone: randomElement(cities),
      allowedZones: [randomElement(cities), randomElement(cities)],
    },
    shift: randomElement([undefined, {
      currentShift: randomElement(['Morning', 'Afternoon', 'Evening', 'Night']),
      shiftStart: new Date(Date.now() - randomInt(1, 8) * 60 * 60 * 1000).toISOString(),
      shiftEnd: new Date(Date.now() + randomInt(2, 8) * 60 * 60 * 1000).toISOString(),
      isOnBreak: Math.random() < 0.1,
      breakStart: Math.random() < 0.1 ? new Date(Date.now() - randomInt(5, 30) * 60 * 1000).toISOString() : undefined,
    }]),
    createdAt: randomDate(730),
    updatedAt: randomDate(30),
  };
});

// ==================== VEHICLES ====================

export const mockVehicles: Vehicle[] = Array.from({ length: 20 }, (_, i) => {
  const make = randomElement(vehicleMakes);
  const model = randomElement(vehicleModels[make as keyof typeof vehicleModels]);
  const vehicleId = `VEH${String(i + 1).padStart(6, '0')}`;
  const assignedDriver = mockDrivers.find(d => d.vehicle?.vehicleId === vehicleId);
  
  return {
    vehicleId,
    plateNumber: `${randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])}${randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])}${randomElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])} ${randomInt(100, 9999)}`,
    make,
    model,
    year: randomInt(2018, 2024),
    type: randomElement(['Taxi', 'Taxi', 'Taxi', 'Moto', 'Moto', 'Idle', 'Urban Demand', 'Delivery', 'Delivery']),
    status: randomElement(['Active', 'Active', 'Active', 'Active', 'Idle', 'Maintenance', 'Offline']),
    currentLocation: generateLocation(),
    assignedDriver: assignedDriver ? {
      driverId: assignedDriver.driverId,
      name: `${assignedDriver.personalInfo.firstName} ${assignedDriver.personalInfo.lastName}`,
      phone: assignedDriver.personalInfo.phone,
      assignedAt: assignedDriver.vehicle?.assignedAt,
    } : undefined,
    utilization: {
      hoursActive: randomFloat(500, 8000),
      tripsCompleted: randomInt(100, 5000),
      revenueGenerated: randomFloat(50000, 800000),
      distanceTraveled: randomFloat(1000, 50000),
    },
    maintenance: {
      lastService: randomDate(90),
      nextServiceDue: randomDate(0, 90),
      mileage: randomInt(10000, 150000),
      serviceHistory: Array.from({ length: randomInt(1, 5) }, (_, j) => ({
        id: `SVC${randomInt(1000, 9999)}`,
        date: randomDate(365 * (j + 1)),
        type: randomElement(['Oil Change', 'Tire Rotation', 'Brake Service', 'General Checkup']),
        description: `Regular ${randomElement(['maintenance', 'service', 'inspection'])}`,
        cost: randomFloat(1000, 15000),
        mileage: randomInt(10000, 150000),
      })),
    },
    documents: [
      {
        id: `DOC${randomInt(1000, 9999)}`,
        type: 'Registration',
        name: 'Vehicle Registration',
        url: '/docs/registration.pdf',
        status: 'Approved',
        uploadedAt: randomDate(365),
        expiresAt: randomDate(365, 730),
      },
      {
        id: `DOC${randomInt(1000, 9999)}`,
        type: 'Insurance',
        name: 'Comprehensive Insurance',
        url: '/docs/insurance.pdf',
        status: 'Approved',
        uploadedAt: randomDate(180),
        expiresAt: randomDate(180, 365),
      },
    ],
    createdAt: randomDate(730),
    updatedAt: randomDate(30),
  };
});

// ==================== ORDERS ====================

const orderStatuses: Array<'Searching' | 'Assigned' | 'Accepted' | 'EnRoute' | 'Arrived' | 'OnTrip' | 'Completed' | 'Cancelled' | 'Scheduled' | 'Pending'> = 
  ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip', 'Completed', 'Completed', 'Completed', 'Completed', 'Cancelled', 'Scheduled', 'Pending'];

const serviceTypes: Array<'Taxi' | 'Moto' | 'Delivery' | 'Car'> = ['Taxi', 'Taxi', 'Taxi', 'Moto', 'Moto', 'Delivery', 'Delivery', 'Car'];

export const mockOrders: Order[] = Array.from({ length: 35 }, (_, i) => {
  const orderId = `ORD${String(i + 1).padStart(8, '0')}`;
  const serviceType = randomElement(serviceTypes);
  const status = randomElement(orderStatuses);
  const driver = status !== 'Searching' && status !== 'Pending' && status !== 'Cancelled' && status !== 'Scheduled' 
    ? randomElement(mockDrivers) 
    : undefined;
  
  const baseFare = serviceType === 'Moto' ? randomFloat(30, 50) : randomFloat(50, 80);
  const distanceFare = randomFloat(20, 150);
  const timeFare = randomFloat(10, 80);
  const surge = randomElement([1, 1, 1, 1.2, 1.5, 2]);
  const subtotal = (baseFare + distanceFare + timeFare) * surge;
  const discount = Math.random() < 0.3 ? randomFloat(10, 50) : 0;
  const total = Math.max(subtotal - discount, 50);
  
  const pickupLocation = generateLocation();
  const dropoffLocation = generateLocation();
  
  return {
    orderId,
    transactionId: `TXN${String(i + 1).padStart(10, '0')}`,
    status,
    serviceType,
    priority: randomElement(['Normal', 'Normal', 'Normal', 'High', 'Urgent']),
    customer: {
      customerId: `CUST${randomInt(10000, 99999)}`,
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      phone: generatePhone(),
      email: `customer${randomInt(1, 1000)}@email.com`,
      rating: randomFloat(4.0, 5.0),
    },
    driver: driver ? {
      driverId: driver.driverId,
      name: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
      vehicle: driver.vehicle?.plateNumber || 'N/A',
      phone: driver.personalInfo.phone,
      assignedAt: randomDate(7),
      acceptedAt: status !== 'Assigned' ? randomDate(7) : undefined,
      pickedUpAt: ['OnTrip', 'Completed'].includes(status) ? randomDate(7) : undefined,
      completedAt: status === 'Completed' ? randomDate(7) : undefined,
    } : undefined,
    route: {
      pickup: {
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
        address: generateAddress(),
        name: randomElement(['Home', 'Office', 'SM Mall', 'Ayala Mall', 'Robinsons', ' condo', 'Apartment']),
      },
      dropoff: {
        lat: dropoffLocation.lat,
        lng: dropoffLocation.lng,
        address: generateAddress(),
        name: randomElement(['Home', 'Office', 'Restaurant', 'Hospital', 'Airport', 'Hotel', 'School']),
      },
      distance: randomInt(1000, 20000),
      estimatedDuration: randomInt(300, 3600),
      actualDistance: status === 'Completed' ? randomInt(1000, 22000) : undefined,
      actualDuration: status === 'Completed' ? randomInt(300, 4000) : undefined,
    },
    timeline: {
      bookedAt: randomDate(7),
      scheduledAt: status === 'Scheduled' ? randomDate(0, 1) : undefined,
      assignedAt: driver ? randomDate(7) : undefined,
      acceptedAt: driver && status !== 'Assigned' ? randomDate(7) : undefined,
      arrivedAt: ['Arrived', 'OnTrip', 'Completed'].includes(status) ? randomDate(7) : undefined,
      pickedUpAt: ['OnTrip', 'Completed'].includes(status) ? randomDate(7) : undefined,
      completedAt: status === 'Completed' ? randomDate(7) : undefined,
      cancelledAt: status === 'Cancelled' ? randomDate(7) : undefined,
      cancelledBy: status === 'Cancelled' ? randomElement(['Customer', 'Driver', 'System']) : undefined,
      cancellationReason: status === 'Cancelled' ? randomElement(['Customer no-show', 'Driver unavailable', 'Too far', 'Changed mind', 'System error']) : undefined,
    },
    pricing: {
      baseFare,
      distanceFare,
      timeFare,
      surge: surge > 1 ? surge : 1,
      discount,
      total: Math.round(total),
      paymentMethod: randomElement(['Cash', 'GCash', 'Maya', 'Card']),
      isPaid: status === 'Completed' || (status !== 'Cancelled' && Math.random() < 0.8),
    },
    flags: {
      isPrioritized: Math.random() < 0.1,
      isScheduled: status === 'Scheduled',
      hasSpecialRequirements: Math.random() < 0.15,
      requiresVerification: Math.random() < 0.05,
    },
    notes: Math.random() < 0.2 ? randomElement(['Please call upon arrival', 'Gate code: 1234', 'Leave at reception', 'Fragile items', 'Handle with care']) : undefined,
    createdAt: randomDate(7),
    updatedAt: randomDate(1),
  };
});

// ==================== INCIDENTS ====================

const incidentTypes: Array<'Accident' | 'SafetyViolation' | 'CustomerComplaint' | 'DriverMisconduct' | 'VehicleIssue' | 'PolicyViolation' | 'Fraud' | 'Other'> = 
  ['Accident', 'SafetyViolation', 'CustomerComplaint', 'DriverMisconduct', 'VehicleIssue', 'PolicyViolation', 'Fraud', 'Other'];

const incidentSeverities: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'Medium', 'High', 'High', 'Critical'];

const incidentStatuses: Array<'New' | 'Reviewing' | 'Investigating' | 'PendingAction' | 'Hearing' | 'Resolved' | 'Closed'> = 
  ['New', 'Reviewing', 'Investigating', 'PendingAction', 'Hearing', 'Resolved', 'Closed', 'Closed'];

export const mockIncidents: Incident[] = Array.from({ length: 12 }, (_, i) => {
  const incidentId = `INC${String(i + 1).padStart(6, '0')}`;
  const type = randomElement(incidentTypes);
  const severity = randomElement(incidentSeverities);
  const status = randomElement(incidentStatuses);
  const driver = randomElement(mockDrivers);
  const vehicle = mockVehicles.find(v => v.assignedDriver?.driverId === driver.driverId);
  
  return {
    incidentId,
    type,
    severity,
    status,
    priority: randomElement(['Normal', 'Normal', 'High', 'Urgent']),
    reportedBy: {
      type: randomElement(['Customer', 'Driver', 'System', 'Admin']),
      userId: randomElement([driver.driverId, `CUST${randomInt(10000, 99999)}`, `ADMIN${randomInt(100, 999)}`]),
      name: randomElement([`${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`, `Customer ${randomInt(1, 1000)}`, `Admin ${randomInt(1, 10)}`]),
      reportedAt: randomDate(30),
    },
    involved: {
      drivers: [{
        driverId: driver.driverId,
        name: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
        phone: driver.personalInfo.phone,
      }],
      vehicles: vehicle ? [{
        vehicleId: vehicle.vehicleId,
        plateNumber: vehicle.plateNumber,
      }] : [],
      customers: Math.random() < 0.7 ? [{
        customerId: `CUST${randomInt(10000, 99999)}`,
        name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      }] : [],
    },
    location: generateLocation(),
    description: {
      summary: getIncidentSummary(type),
      detailedNarrative: getIncidentNarrative(type),
      circumstances: [
        'Weather condition: ' + randomElement(['Clear', 'Rainy', 'Foggy']),
        'Time of day: ' + randomElement(['Morning rush', 'Afternoon', 'Evening rush', 'Night']),
        'Location: ' + randomElement(streets),
      ],
    },
    evidence: {
      photos: Array.from({ length: randomInt(0, 3) }, (_, j) => ({
        id: `IMG${randomInt(1000, 9999)}`,
        type: 'image' as const,
        url: `/evidence/${incidentId}/photo${j + 1}.jpg`,
        thumbnailUrl: `/evidence/${incidentId}/photo${j + 1}_thumb.jpg`,
        uploadedAt: randomDate(30),
        uploadedBy: driver.driverId,
      })),
      videos: [],
      documents: Math.random() < 0.5 ? [{
        id: `DOC${randomInt(1000, 9999)}`,
        type: 'document' as const,
        url: `/evidence/${incidentId}/report.pdf`,
        uploadedAt: randomDate(30),
        uploadedBy: driver.driverId,
      }] : [],
      witnesses: Math.random() < 0.3 ? [{
        name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        contact: generatePhone(),
        statement: 'I saw the incident happen.',
      }] : [],
    },
    investigation: ['Investigating', 'PendingAction', 'Hearing', 'Resolved', 'Closed'].includes(status) ? {
      assignedTo: {
        userId: `INV${randomInt(100, 999)}`,
        name: `Investigator ${randomElement(firstNames)}`,
        assignedAt: randomDate(30),
      },
      findings: status !== 'Investigating' ? 'Investigation completed with findings documented.' : undefined,
      recommendations: ['PendingAction', 'Hearing', 'Resolved', 'Closed'].includes(status) ? 'Appropriate action recommended based on findings.' : undefined,
      startedAt: randomDate(30),
      completedAt: ['Resolved', 'Closed'].includes(status) ? randomDate(7) : undefined,
    } : undefined,
    disciplinaryAction: ['Hearing', 'Resolved', 'Closed'].includes(status) && Math.random() < 0.6 ? {
      actionType: randomElement(['Warning', 'Suspension', 'Training']),
      duration: randomElement([undefined, 3, 7, 14, 30]),
      effectiveDate: randomDate(7, 7),
      reason: 'Violation of company policy',
      decidedBy: 'Admin Team',
      appealStatus: Math.random() < 0.3 ? randomElement(['Pending', 'Approved', 'Rejected']) : 'None',
    } : undefined,
    timeline: {
      reportedAt: randomDate(30),
      investigationStarted: ['Investigating', 'PendingAction', 'Hearing', 'Resolved', 'Closed'].includes(status) ? randomDate(30) : undefined,
      investigationCompleted: ['Resolved', 'Closed'].includes(status) ? randomDate(7) : undefined,
      actionTaken: ['Hearing', 'Resolved', 'Closed'].includes(status) && Math.random() < 0.6 ? randomDate(7) : undefined,
      resolved: ['Resolved', 'Closed'].includes(status) ? randomDate(7) : undefined,
    },
    createdAt: randomDate(30),
    updatedAt: randomDate(7),
  };
});

function getIncidentSummary(type: string): string {
  const summaries: Record<string, string> = {
    'Accident': 'Vehicle collision during trip',
    'SafetyViolation': 'Speeding violation reported',
    'CustomerComplaint': 'Customer reported rude behavior',
    'DriverMisconduct': 'Driver failed to follow protocol',
    'VehicleIssue': 'Mechanical breakdown reported',
    'PolicyViolation': 'Violation of terms of service',
    'Fraud': 'Suspicious activity detected',
    'Other': 'General incident report',
  };
  return summaries[type] || 'General incident';
}

function getIncidentNarrative(type: string): string {
  const narratives: Record<string, string> = {
    'Accident': 'Driver was involved in a minor collision while transporting a passenger. No injuries reported.',
    'SafetyViolation': 'Multiple reports of excessive speeding in residential areas. GPS data confirms violations.',
    'CustomerComplaint': 'Customer reported that driver was unprofessional and used inappropriate language.',
    'DriverMisconduct': 'Driver refused to complete trip and abandoned passenger at destination.',
    'VehicleIssue': 'Vehicle experienced mechanical failure requiring roadside assistance.',
    'PolicyViolation': 'Driver found to be operating outside approved service area without authorization.',
    'Fraud': 'Suspicious pattern of cancelled trips with payment irregularities detected.',
    'Other': 'General incident requiring investigation and documentation.',
  };
  return narratives[type] || 'Details pending investigation.';
}

// ==================== TRANSACTIONS ====================

const transactionTypes: Array<'OrderPayment' | 'DriverEarnings' | 'Commission' | 'Payout' | 'TopUp' | 'Refund' | 'Adjustment' | 'Fee'> = 
  ['OrderPayment', 'OrderPayment', 'OrderPayment', 'DriverEarnings', 'Commission', 'Payout', 'TopUp', 'Refund', 'Adjustment', 'Fee'];

const transactionStatuses: Array<'Pending' | 'Completed' | 'Failed' | 'Reversed'> = 
  ['Completed', 'Completed', 'Completed', 'Completed', 'Pending', 'Failed', 'Reversed'];

export const mockTransactions: Transaction[] = Array.from({ length: 55 }, (_, i) => {
  const transactionId = `TXN${String(i + 1).padStart(10, '0')}`;
  const type = randomElement(transactionTypes);
  const status = randomElement(transactionStatuses);
  const amount = randomFloat(50, 5000);
  
  const order = type === 'OrderPayment' || type === 'DriverEarnings' || type === 'Commission' 
    ? randomElement(mockOrders) 
    : undefined;
  
  const driver = type === 'DriverEarnings' || type === 'Payout' || type === 'TopUp'
    ? randomElement(mockDrivers)
    : undefined;
  
  return {
    transactionId,
    type,
    amount,
    currency: 'PHP',
    status,
    order: order ? {
      orderId: order.orderId,
      serviceType: order.serviceType,
    } : undefined,
    parties: {
      from: {
        id: type === 'OrderPayment' ? order!.customer.customerId : (type === 'TopUp' ? driver!.driverId : 'PLATFORM'),
        type: type === 'OrderPayment' ? 'Customer' : (type === 'TopUp' ? 'Driver' : 'Platform'),
        name: type === 'OrderPayment' ? order!.customer.name : (driver ? `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}` : 'Xpress Platform'),
      },
      to: {
        id: type === 'Payout' ? driver!.driverId : 'PLATFORM',
        type: type === 'Payout' ? 'Driver' : 'Platform',
        name: type === 'Payout' ? `${driver!.personalInfo.firstName} ${driver!.personalInfo.lastName}` : 'Xpress Platform',
      },
    },
    breakdown: {
      baseFare: order ? order.pricing.baseFare : randomFloat(30, 100),
      distanceFare: order ? order.pricing.distanceFare : randomFloat(20, 150),
      timeFare: order ? order.pricing.timeFare : randomFloat(10, 80),
      surge: order ? order.pricing.surge : 1,
      discount: order ? order.pricing.discount : 0,
      commission: type === 'Commission' || type === 'OrderPayment' ? amount * 0.2 : 0,
      driverEarnings: type === 'DriverEarnings' || type === 'OrderPayment' ? amount * 0.8 : 0,
      fees: type === 'Fee' ? amount : randomFloat(0, 20),
    },
    payment: {
      method: randomElement(['Cash', 'GCash', 'Maya', 'Card']),
      gateway: Math.random() < 0.6 ? randomElement(['PayMongo', 'Xendit', 'Stripe']) : undefined,
      referenceNumber: `REF${randomInt(100000, 999999)}`,
    },
    metadata: {
      sourceSystem: 'OpsTower V2',
      auditLog: [{
        timestamp: randomDate(30),
        userId: 'SYSTEM',
        action: 'TRANSACTION_CREATED',
        details: `Transaction ${transactionId} initiated`,
      }],
      notes: Math.random() < 0.2 ? 'Special handling required' : undefined,
    },
    timestamps: {
      initiatedAt: randomDate(30),
      completedAt: status === 'Completed' ? randomDate(7) : undefined,
    },
  };
});

// ==================== WALLETS ====================

export const mockWallets: Wallet[] = mockDrivers.slice(0, 15).map(driver => ({
  walletId: `WAL${driver.driverId.replace('DRV', '')}`,
  userId: driver.driverId,
  userType: 'Driver',
  balance: {
    available: driver.earnings.currentBalance,
    pending: driver.earnings.pendingSettlement,
    held: randomFloat(0, 500),
  },
  limits: {
    maxBalance: 50000,
    minWithdrawal: 200,
    maxWithdrawal: 10000,
    dailyWithdrawal: 20000,
  },
  lastTransaction: Math.random() < 0.8 ? {
    transactionId: randomElement(mockTransactions).transactionId,
    amount: randomFloat(50, 1000),
    timestamp: randomDate(7),
  } : undefined,
}));

// ==================== SETTLEMENTS ====================

export const mockSettlements: Settlement[] = mockDrivers.slice(0, 10).map((driver, i) => {
  const settlementId = `STL${String(i + 1).padStart(6, '0')}`;
  const status = randomElement(['Pending', 'Approved', 'Processing', 'Completed', 'Completed', 'Completed', 'Failed'] as const);
  
  return {
    settlementId,
    driverId: driver.driverId,
    period: {
      startDate: randomDate(14),
      endDate: randomDate(7),
    },
    totals: {
      grossEarnings: driver.earnings.totalEarnings * 0.1,
      deductions: randomFloat(100, 1000),
      netPayable: driver.earnings.totalEarnings * 0.1 - randomFloat(100, 1000),
    },
    itemization: {
      tripEarnings: driver.earnings.totalEarnings * 0.08,
      bonuses: randomFloat(0, 2000),
      adjustments: randomFloat(-500, 500),
      fees: randomFloat(50, 500),
    },
    status,
    payout: {
      method: randomElement(['BankTransfer', 'GCash', 'Maya', 'Cash'] as const),
      account: status !== 'Pending' ? randomElement(['****1234', '****5678', '****9012']) : '',
      accountName: status !== 'Pending' ? `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}` : undefined,
      scheduledDate: randomDate(7, 7),
      completedDate: status === 'Completed' ? randomDate(7) : undefined,
      referenceNumber: status === 'Completed' ? `PAY${randomInt(100000, 999999)}` : undefined,
    },
  };
});

// ==================== DASHBOARD STATS ====================

export const mockDashboardStats: DashboardStats = {
  totalOrders: mockOrders.length,
  activeOrders: mockOrders.filter(o => ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'].includes(o.status)).length,
  completedOrders: mockOrders.filter(o => o.status === 'Completed').length,
  cancelledOrders: mockOrders.filter(o => o.status === 'Cancelled').length,
  
  totalRevenue: mockOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.pricing.total, 0),
  revenuePerHour: randomFloat(5000, 15000),
  averageOrderValue: mockOrders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.pricing.total, 0) / Math.max(mockOrders.filter(o => o.status === 'Completed').length, 1),
  
  activeDrivers: mockDrivers.filter(d => d.onlineStatus === 'Online' || d.onlineStatus === 'OnTrip').length,
  idleDrivers: mockDrivers.filter(d => d.onlineStatus === 'Offline').length,
  offlineDrivers: mockDrivers.filter(d => d.status === 'Offline').length,
  totalDrivers: mockDrivers.length,
  
  activeVehicles: mockVehicles.filter(v => v.status === 'Active').length,
  idleVehicles: mockVehicles.filter(v => v.status === 'Idle').length,
  inMaintenance: mockVehicles.filter(v => v.status === 'Maintenance').length,
  totalVehicles: mockVehicles.length,
  
  fleetUtilization: randomFloat(60, 90),
  driverUtilization: randomFloat(50, 85),
  
  averageWaitTime: randomInt(180, 600),
  assignmentSuccessRate: randomFloat(85, 98),
  completionRate: randomFloat(88, 97),
  
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString(),
};

// ==================== LIVE MAP DATA ====================

export const mockLiveMapOrders: LiveMapOrder[] = mockOrders
  .filter(o => ['Searching', 'Assigned', 'Accepted', 'EnRoute', 'Arrived', 'OnTrip'].includes(o.status))
  .map(order => ({
    orderId: order.orderId,
    status: order.status,
    serviceType: order.serviceType,
    pickup: {
      lat: order.route.pickup.lat,
      lng: order.route.pickup.lng,
      timestamp: new Date().toISOString(),
    },
    dropoff: {
      lat: order.route.dropoff.lat,
      lng: order.route.dropoff.lng,
      timestamp: new Date().toISOString(),
    },
    driverLocation: order.driver ? generateLocation() : undefined,
    priority: order.priority,
  }));

export const mockLiveMapDrivers: LiveMapDriver[] = mockDrivers
  .filter(d => d.onlineStatus === 'Online' || d.onlineStatus === 'OnTrip')
  .map(driver => ({
    driverId: driver.driverId,
    name: `${driver.personalInfo.firstName} ${driver.personalInfo.lastName}`,
    status: driver.onlineStatus,
    location: generateLocation(),
    vehicleType: driver.vehicle ? randomElement(['Taxi', 'Moto', 'Delivery', 'Idle']) : 'Taxi',
    currentOrderId: driver.onlineStatus === 'OnTrip' ? mockOrders.find(o => o.driver?.driverId === driver.driverId && ['Accepted', 'EnRoute', 'Arrived', 'OnTrip'].includes(o.status))?.orderId : undefined,
    trustScore: driver.trustScore.overall,
  }));

// ==================== AUTH DATA ====================

export const mockUsers: User[] = [
  {
    id: 'USR000001',
    email: 'admin@xpresstower.ph',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SuperAdmin',
    permissions: ['view:dashboard', 'view:analytics', 'view:orders', 'create:orders', 'edit:orders', 'cancel:orders', 'assign:drivers', 'view:drivers', 'edit:drivers', 'suspend:drivers', 'verify:drivers', 'view:fleet', 'edit:fleet', 'manage:maintenance', 'view:incidents', 'create:incidents', 'edit:incidents', 'investigate:incidents', 'resolve:incidents', 'view:finance', 'process:payouts', 'adjust:transactions', 'manage:users', 'manage:settings', 'view:audit'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    lastLoginAt: new Date().toISOString(),
    createdAt: randomDate(365),
    updatedAt: randomDate(30),
  },
  {
    id: 'USR000002',
    email: 'ops.manager@xpresstower.ph',
    firstName: 'Maria',
    lastName: 'Santos',
    role: 'OperationsManager',
    permissions: ['view:dashboard', 'view:analytics', 'view:orders', 'create:orders', 'edit:orders', 'cancel:orders', 'assign:drivers', 'view:drivers', 'edit:drivers', 'suspend:drivers', 'view:fleet', 'view:incidents', 'create:incidents', 'edit:incidents', 'view:finance'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariasantos',
    lastLoginAt: randomDate(7),
    createdAt: randomDate(365),
    updatedAt: randomDate(30),
  },
  {
    id: 'USR000003',
    email: 'fleet@xpresstower.ph',
    firstName: 'Juan',
    lastName: 'Reyes',
    role: 'FleetManager',
    permissions: ['view:dashboard', 'view:drivers', 'verify:drivers', 'view:fleet', 'edit:fleet', 'manage:maintenance', 'view:incidents'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juanreyes',
    lastLoginAt: randomDate(7),
    createdAt: randomDate(365),
    updatedAt: randomDate(30),
  },
];

// ==================== PEAK HOUR VARIATIONS ====================

export const getPeakHourMultiplier = (): number => {
  const hour = new Date().getHours();
  // Morning rush: 7-10 AM, Evening rush: 5-9 PM
  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21)) {
    return randomFloat(1.3, 2.5);
  }
  return 1;
};

// Helper to filter and paginate data
export const paginateData = <T>(data: T[], page: number, pageSize: number): { data: T[]; total: number; totalPages: number } => {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: data.slice(start, end),
    total,
    totalPages,
  };
};

// Helper to sort data
export const sortData = <T extends Record<string, any>>(data: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal === undefined || bVal === undefined) return 0;
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Helper to filter data
export const filterData = <T extends Record<string, any>>(data: T[], filters: Record<string, any>): T[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      const itemValue = item[key];
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(String(value).toLowerCase());
      }
      return itemValue === value;
    });
  });
};
