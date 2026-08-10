import { PrismaClient, Role, CustomerType, CustomerStatus, StockMovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.followUp.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // Default hashed password for test users
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Seed Users (4 Roles)
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@fundsroom.com',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sales Manager',
      email: 'sales@fundsroom.com',
      passwordHash: defaultPasswordHash,
      role: Role.SALES,
      isActive: true,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Warehouse Supervisor',
      email: 'warehouse@fundsroom.com',
      passwordHash: defaultPasswordHash,
      role: Role.WAREHOUSE,
      isActive: true,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Accounts Executive',
      email: 'accounts@fundsroom.com',
      passwordHash: defaultPasswordHash,
      role: Role.ACCOUNTS,
      isActive: true,
    },
  });

  console.log('👥 Seeded 4 Users with different roles.');

  // 2. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      customerName: 'Apex Retailers Ltd',
      mobileNumber: '9876543210',
      email: 'contact@apexretail.com',
      businessName: 'Apex Retailers Pvt Ltd',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: CustomerType.RETAIL,
      address: 'Plot 42, Industrial Area Phase 1, Mumbai',
      status: CustomerStatus.ACTIVE,
      notes: 'Key retail client, prefers monthly billing.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      customerName: 'Metro Distributors',
      mobileNumber: '9876543211',
      email: 'info@metrodist.com',
      businessName: 'Metro Distribution Network',
      gstNumber: '27BBBBB1111B1Z2',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Suite 108, Trade Center, Pune',
      status: CustomerStatus.ACTIVE,
      notes: 'High-volume regional distributor.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      customerName: 'Sunrise Wholesale Corp',
      mobileNumber: '9876543212',
      email: 'orders@sunrisewholesale.in',
      businessName: 'Sunrise Enterprises',
      gstNumber: '27CCCCC2222C1Z9',
      customerType: CustomerType.WHOLESALE,
      address: 'Gala 5, Wholesale Hub, Thane',
      status: CustomerStatus.ACTIVE,
      notes: 'Bulk purchaser of hardware & packaging.',
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      customerName: 'Global Traders Inc',
      mobileNumber: '9876543213',
      email: 'sales@globaltraders.org',
      businessName: 'Global Traders',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      notes: 'Inquired about electrical equipment bulk pricing.',
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      customerName: 'Corner Store Mart',
      mobileNumber: '9876543214',
      email: 'help@cornerstore.com',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.INACTIVE,
      notes: 'Account suspended due to non-activity.',
    },
  });

  console.log('🏢 Seeded 5 Customers.');

  // 3. Seed Products
  const product1 = await prisma.product.create({
    data: {
      productName: 'Industrial LED Flood Light 100W',
      sku: 'PROD-ELEC-001',
      category: 'Electronics',
      unitPrice: 1499.00,
      currentStock: 150,
      minimumStock: 20,
      warehouse: 'Main Warehouse - Bay A',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      productName: 'Smart Circuit Breaker 63A',
      sku: 'PROD-ELEC-002',
      category: 'Electronics',
      unitPrice: 2299.50,
      currentStock: 80,
      minimumStock: 15,
      warehouse: 'Main Warehouse - Bay B',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      productName: 'Stainless Steel Bolt Set (Pack of 100)',
      sku: 'PROD-HARD-001',
      category: 'Hardware',
      unitPrice: 450.00,
      currentStock: 500,
      minimumStock: 50,
      warehouse: 'Secondary Storage',
    },
  });

  const product4 = await prisma.product.create({
    data: {
      productName: 'Heavy Duty Corrugated Boxes (Pack of 50)',
      sku: 'PROD-PACK-001',
      category: 'Packaging',
      unitPrice: 1250.00,
      currentStock: 300,
      minimumStock: 40,
      warehouse: 'Main Warehouse - Bay C',
    },
  });

  console.log('📦 Seeded 4 Products.');

  // 4. Seed Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        quantity: 150,
        type: StockMovementType.IN,
        reason: 'Initial Inventory Inward',
        createdBy: warehouseUser.id,
      },
      {
        productId: product2.id,
        quantity: 100,
        type: StockMovementType.IN,
        reason: 'Initial Inventory Inward',
        createdBy: warehouseUser.id,
      },
      {
        productId: product2.id,
        quantity: 20,
        type: StockMovementType.OUT,
        reason: 'Sample Dispatch to Client',
        createdBy: warehouseUser.id,
      },
      {
        productId: product3.id,
        quantity: 500,
        type: StockMovementType.IN,
        reason: 'Initial Stock Shipment',
        createdBy: warehouseUser.id,
      },
      {
        productId: product4.id,
        quantity: 300,
        type: StockMovementType.IN,
        reason: 'Initial Stock Shipment',
        createdBy: warehouseUser.id,
      },
    ],
  });

  console.log('📊 Seeded initial Stock Movements.');

  // 5. Seed FollowUps
  await prisma.followUp.createMany({
    data: [
      {
        customerId: customer4.id,
        note: 'Sent product catalog and price list for LED flood lights.',
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: salesUser.id,
      },
      {
        customerId: customer1.id,
        note: 'Discussed Q3 bulk discount proposal.',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: salesUser.id,
      },
    ],
  });

  console.log('📞 Seeded Customer Follow-Ups.');

  // 6. Seed Sample Sales Challans & Items with Snapshots
  const challan1 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-001',
      customerId: customer1.id,
      totalQuantity: 10,
      status: ChallanStatus.DRAFT,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            productNameSnapshot: product1.productName,
            skuSnapshot: product1.sku,
            unitPriceSnapshot: product1.unitPrice,
            quantity: 10,
            totalPrice: Number(product1.unitPrice) * 10,
          },
        ],
      },
    },
  });

  const challan2 = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-002',
      customerId: customer2.id,
      totalQuantity: 25,
      status: ChallanStatus.CONFIRMED,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product2.id,
            productNameSnapshot: product2.productName,
            skuSnapshot: product2.sku,
            unitPriceSnapshot: product2.unitPrice,
            quantity: 5,
            totalPrice: Number(product2.unitPrice) * 5,
          },
          {
            productId: product3.id,
            productNameSnapshot: product3.productName,
            skuSnapshot: product3.sku,
            unitPriceSnapshot: product3.unitPrice,
            quantity: 20,
            totalPrice: Number(product3.unitPrice) * 20,
          },
        ],
      },
    },
  });

  console.log('📄 Seeded Sample Challans with snapshot items.');
  console.log('✅ Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
