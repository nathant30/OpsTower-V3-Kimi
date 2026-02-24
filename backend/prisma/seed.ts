/**
 * Database Seed Script
 * Creates initial users and test data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@opstower.com' },
    update: {},
    create: {
      email: 'admin@opstower.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+639123456789',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create dispatcher user
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@opstower.com' },
    update: {},
    create: {
      email: 'dispatcher@opstower.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Dispatcher',
      phone: '+639123456790',
      role: 'DISPATCH_LEAD',
      isActive: true,
    },
  });
  console.log('✅ Created dispatcher user:', dispatcher.email);

  // Create operator user
  const operator = await prisma.user.upsert({
    where: { email: 'operator@opstower.com' },
    update: {},
    create: {
      email: 'operator@opstower.com',
      passwordHash: userPassword,
      firstName: 'Jane',
      lastName: 'Operator',
      phone: '+639123456791',
      role: 'OVERWATCH_STAFF',
      isActive: true,
    },
  });
  console.log('✅ Created operator user:', operator.email);

  // Create viewer user
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@opstower.com' },
    update: {},
    create: {
      email: 'viewer@opstower.com',
      passwordHash: userPassword,
      firstName: 'Bob',
      lastName: 'Viewer',
      phone: '+639123456792',
      role: 'VIEWER',
      isActive: true,
    },
  });
  console.log('✅ Created viewer user:', viewer.email);

  // Create sample drivers
  const drivers = [
    { employeeId: 'DRV001', firstName: 'Juan', lastName: 'Dela Cruz', phonePrimary: '+639171234567', currentTier: 'GOLD', status: 'ACTIVE', licenseNumber: 'LIC001', licenseExpiry: new Date('2026-12-31') },
    { employeeId: 'DRV002', firstName: 'Maria', lastName: 'Santos', phonePrimary: '+639171234568', currentTier: 'SILVER', status: 'ACTIVE', licenseNumber: 'LIC002', licenseExpiry: new Date('2026-12-31') },
    { employeeId: 'DRV003', firstName: 'Pedro', lastName: 'Reyes', phonePrimary: '+639171234569', currentTier: 'BRONZE', status: 'ACTIVE', licenseNumber: 'LIC003', licenseExpiry: new Date('2026-12-31') },
    { employeeId: 'DRV004', firstName: 'Ana', lastName: 'Garcia', phonePrimary: '+639171234570', currentTier: 'PLATINUM', status: 'ACTIVE', licenseNumber: 'LIC004', licenseExpiry: new Date('2026-12-31') },
    { employeeId: 'DRV005', firstName: 'Miguel', lastName: 'Torres', phonePrimary: '+639171234571', currentTier: 'UNRANKED', status: 'TRAINING', licenseNumber: 'LIC005', licenseExpiry: new Date('2026-12-31') },
  ];

  for (const driverData of drivers) {
    await prisma.driver.upsert({
      where: { employeeId: driverData.employeeId },
      update: {},
      create: {
        employeeId: driverData.employeeId,
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        phonePrimary: driverData.phonePrimary,
        currentTier: driverData.currentTier as any,
        status: driverData.status as any,
        licenseNumber: driverData.licenseNumber,
        licenseExpiry: driverData.licenseExpiry,
        serviceSegment: 'FOUR_WHEEL_TNVS' as any,
        hireDate: new Date('2024-01-01'),
        securityBondBalance: 5000,
        securityBondRequired: 5000,
      },
    });
    console.log('✅ Created driver:', driverData.employeeId);
  }

  console.log('');
  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:     admin@opstower.com / admin123');
  console.log('  Dispatcher: dispatcher@opstower.com / password123');
  console.log('  Operator:   operator@opstower.com / password123');
  console.log('  Viewer:     viewer@opstower.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
