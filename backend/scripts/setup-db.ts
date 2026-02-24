#!/usr/bin/env tsx
/**
 * Database Setup Script for OpsTower V2
 * 
 * This script:
 * 1. Checks if the database is accessible
 * 2. Runs Prisma migrate dev
 * 3. Seeds initial data (vehicles, incidents, transactions)
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkDatabaseConnection(): Promise<boolean> {
  log('\n📡 Checking database connection...', 'cyan');
  
  try {
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`;
    log('✅ Database connection successful!', 'green');
    return true;
  } catch (error) {
    log('❌ Database connection failed!', 'red');
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    return false;
  }
}

async function runMigrations(): Promise<boolean> {
  log('\n🔄 Running Prisma migrations...', 'cyan');
  
  try {
    execSync('npx prisma migrate dev --name init_custom_modules', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    log('✅ Migrations completed successfully!', 'green');
    return true;
  } catch (error) {
    log('❌ Migration failed!', 'red');
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    return false;
  }
}

async function seedVehicles() {
  log('\n🚗 Seeding vehicles...', 'cyan');
  
  const vehicles = [
    {
      plateNumber: 'ABC-1234',
      make: 'Toyota',
      model: 'Hiace',
      year: 2023,
      type: 'VAN',
      status: 'ACTIVE',
      capacityPassengers: 15,
      capacityCargo: 500.00,
      fuelType: 'DIESEL',
      currentLat: 14.5995,
      currentLng: 120.9842,
      currentAddress: 'Manila, Philippines',
      mileage: 15000.50,
      fuelLevel: 85.50,
      lastMaintenanceDate: new Date('2024-12-01'),
      nextMaintenanceDate: new Date('2025-03-01'),
    },
    {
      plateNumber: 'XYZ-5678',
      make: 'Mitsubishi',
      model: 'L300',
      year: 2022,
      type: 'TRUCK',
      status: 'IDLE',
      capacityPassengers: 3,
      capacityCargo: 2000.00,
      fuelType: 'DIESEL',
      currentLat: 14.5547,
      currentLng: 121.0244,
      currentAddress: 'Makati City, Philippines',
      mileage: 25000.75,
      fuelLevel: 60.00,
      lastMaintenanceDate: new Date('2025-01-10'),
      nextMaintenanceDate: new Date('2025-04-10'),
    },
    {
      plateNumber: 'MNO-9012',
      make: 'Honda',
      model: 'Click',
      year: 2024,
      type: 'MOTORCYCLE',
      status: 'MAINTENANCE',
      capacityPassengers: 1,
      capacityCargo: 50.00,
      fuelType: 'GASOLINE',
      currentLat: 14.6760,
      currentLng: 121.0437,
      currentAddress: 'Quezon City, Philippines',
      mileage: 5000.25,
      fuelLevel: 25.00,
      lastMaintenanceDate: new Date('2025-02-05'),
      nextMaintenanceDate: new Date('2025-02-20'),
    },
  ];

  for (const vehicle of vehicles) {
    try {
      await prisma.vehicle.create({ data: vehicle });
      log(`  ✅ Created vehicle: ${vehicle.plateNumber} (${vehicle.make} ${vehicle.model})`, 'green');
    } catch (error) {
      // Vehicle might already exist
      log(`  ⚠️  Vehicle ${vehicle.plateNumber} may already exist, skipping...`, 'yellow');
    }
  }
  
  log('✅ Vehicles seeded successfully!', 'green');
}

async function seedIncidents() {
  log('\n⚠️  Seeding incidents...', 'cyan');
  
  // Get a driver ID for the incidents
  const driver = await prisma.driver.findFirst();
  
  if (!driver) {
    log('  ⚠️  No drivers found in database. Skipping incident seeding.', 'yellow');
    log('  ℹ️  Incidents require existing drivers. Please seed drivers first.', 'yellow');
    return;
  }

  // Get a vehicle for vehicle-related incidents
  const vehicle = await prisma.vehicle.findFirst();

  const incidents = [
    {
      incidentNumber: 'INC-2025-0001',
      type: 'ACCIDENT',
      status: 'INVESTIGATING',
      priority: 'HIGH',
      driverId: driver.id,
      vehicleId: vehicle?.id || null,
      description: 'Minor collision with another vehicle at intersection. No injuries reported.',
      locationLat: 14.5995,
      locationLng: 120.9842,
      locationAddress: 'EDSA corner Ortigas Ave, Mandaluyong City',
      reportedAt: new Date('2025-02-10T09:30:00Z'),
      reportedBy: 'Driver Self-Report',
    },
    {
      incidentNumber: 'INC-2025-0002',
      type: 'BREAKDOWN',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      driverId: driver.id,
      vehicleId: vehicle?.id || null,
      description: 'Engine overheating reported during afternoon shift. Vehicle towed to service center.',
      locationLat: 14.5547,
      locationLng: 121.0244,
      locationAddress: 'Ayala Avenue, Makati City',
      reportedAt: new Date('2025-02-09T14:15:00Z'),
      reportedBy: 'Dispatcher',
      assignedTo: null,
      resolutionNotes: 'Cooling system repaired. Radiator hose replaced. Vehicle returned to service.',
    },
  ];

  for (const incident of incidents) {
    try {
      await prisma.customIncident.create({ data: incident });
      log(`  ✅ Created incident: ${incident.incidentNumber} (${incident.type})`, 'green');
    } catch (error) {
      // Incident might already exist
      log(`  ⚠️  Incident ${incident.incidentNumber} may already exist, skipping...`, 'yellow');
    }
  }
  
  log('✅ Incidents seeded successfully!', 'green');
}

async function seedTransactions() {
  log('\n💰 Seeding transactions...', 'cyan');
  
  // Get a driver ID for the transactions
  const driver = await prisma.driver.findFirst();
  
  if (!driver) {
    log('  ⚠️  No drivers found in database. Skipping transaction seeding.', 'yellow');
    log('  ℹ️  Transactions require existing drivers. Please seed drivers first.', 'yellow');
    return;
  }

  const transactions = [
    {
      transactionNumber: 'TXN-2025-00001',
      type: 'ORDER',
      status: 'COMPLETED',
      amount: 350.00,
      currency: 'PHP',
      description: 'Delivery order #ORD-2025-001 - Electronics package',
      driverId: driver.id,
      orderId: 'ORD-2025-001',
      metadata: { orderValue: 5000.00, deliveryDistance: 12.5, customerRating: 5 },
      processedAt: new Date('2025-02-10T10:30:00Z'),
    },
    {
      transactionNumber: 'TXN-2025-00002',
      type: 'TOPUP',
      status: 'COMPLETED',
      amount: 1000.00,
      currency: 'PHP',
      description: 'Wallet top-up via GCash',
      driverId: driver.id,
      metadata: { paymentMethod: 'GCash', referenceNumber: 'GC123456789' },
      processedAt: new Date('2025-02-10T08:00:00Z'),
    },
    {
      transactionNumber: 'TXN-2025-00003',
      type: 'WITHDRAWAL',
      status: 'PENDING',
      amount: 500.00,
      currency: 'PHP',
      description: 'Withdrawal to bank account',
      driverId: driver.id,
      metadata: { bankAccount: '****1234', bankName: 'BDO' },
      processedAt: null,
    },
    {
      transactionNumber: 'TXN-2025-00004',
      type: 'FEE',
      status: 'COMPLETED',
      amount: 25.00,
      currency: 'PHP',
      description: 'Platform service fee - Order #ORD-2025-002',
      driverId: driver.id,
      orderId: 'ORD-2025-002',
      metadata: { feeType: 'platform', percentage: 5 },
      processedAt: new Date('2025-02-09T16:45:00Z'),
    },
    {
      transactionNumber: 'TXN-2025-00005',
      type: 'ORDER',
      status: 'FAILED',
      amount: 200.00,
      currency: 'PHP',
      description: 'Delivery order #ORD-2025-003 - Failed payment',
      driverId: driver.id,
      orderId: 'ORD-2025-003',
      metadata: { failureReason: 'Payment declined', retryCount: 3 },
      processedAt: null,
    },
  ];

  for (const transaction of transactions) {
    try {
      await prisma.transaction.create({ data: transaction });
      log(`  ✅ Created transaction: ${transaction.transactionNumber} (${transaction.type} - ${transaction.status})`, 'green');
    } catch (error) {
      // Transaction might already exist
      log(`  ⚠️  Transaction ${transaction.transactionNumber} may already exist, skipping...`, 'yellow');
    }
  }
  
  log('✅ Transactions seeded successfully!', 'green');
}

async function seedData() {
  log('\n🌱 Seeding initial data...', 'cyan');
  
  await seedVehicles();
  await seedIncidents();
  await seedTransactions();
  
  log('\n✅ All data seeded successfully!', 'green');
}

async function printSummary() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 DATABASE SETUP SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  
  try {
    const vehicleCount = await prisma.vehicle.count();
    const incidentCount = await prisma.customIncident.count();
    const transactionCount = await prisma.transaction.count();
    const driverCount = await prisma.driver.count();
    
    log(`\n  🚗 Vehicles:        ${vehicleCount}`, 'cyan');
    log(`  ⚠️  Incidents:       ${incidentCount}`, 'cyan');
    log(`  💰 Transactions:    ${transactionCount}`, 'cyan');
    log(`  👤 Drivers:         ${driverCount}`, 'cyan');
    
    log('\n' + '='.repeat(60), 'blue');
    log('✅ Database setup completed successfully!', 'green');
    log('='.repeat(60) + '\n', 'blue');
  } catch (error) {
    log('❌ Error generating summary', 'red');
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 OpsTower V2 - Database Setup', 'blue');
  log('='.repeat(60), 'blue');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    log('\n❌ DATABASE_URL environment variable is not set!', 'red');
    log('Please set it in your .env file or environment variables.', 'yellow');
    log('\nExample:', 'yellow');
    log('DATABASE_URL="postgresql://user:password@localhost:5432/opstower_v2"', 'cyan');
    process.exit(1);
  }
  
  // Check database connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    log('\n❌ Cannot proceed without database connection.', 'red');
    log('Please check your DATABASE_URL and ensure PostgreSQL is running.', 'yellow');
    process.exit(1);
  }
  
  // Run migrations
  const migrationsSuccess = await runMigrations();
  if (!migrationsSuccess) {
    log('\n⚠️  Migration may have been skipped or failed.', 'yellow');
    log('Continuing with seeding...', 'yellow');
  }
  
  // Seed data
  await seedData();
  
  // Print summary
  await printSummary();
}

// Run the script
main()
  .catch((error) => {
    log('\n❌ Unexpected error occurred:', 'red');
    log(error instanceof Error ? error.message : String(error), 'red');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
