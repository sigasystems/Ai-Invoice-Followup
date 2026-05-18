export {};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 0. Clear existing data
  await prisma.activityLog.deleteMany({});
  await prisma.ladderStep.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.customer.deleteMany({});

  // 1. Create Ladder Steps
  const steps = [
    { delayDays: 1, tone: 'NEUTRAL', enabled: true, order: 1 },
    { delayDays: 3, tone: 'POLITE', enabled: true, order: 2 },
    { delayDays: 7, tone: 'FIRM', enabled: true, order: 3 },
    { delayDays: 10, tone: 'URGENT', enabled: true, order: 4 },
    { delayDays: 15, tone: 'ESCALATION', enabled: true, order: 5 },
  ];

  for (const step of steps) {
    await prisma.ladderStep.create({ data: step });
  }

  // 2. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      company: 'Acme Industries',
      riskLevel: 'HIGH',
      collectionScore: 45,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Globex Corporation',
      email: 'finance@globex.net',
      company: 'Globex Global',
      riskLevel: 'LOW',
      collectionScore: 92,
    },
  });

  // 3. Create Invoices
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-1001',
      customerId: customer1.id,
      amount: 1200.0,
      issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),   // 15 days ago
      status: 'OVERDUE',
      currentStage: 3,
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-1002',
      customerId: customer2.id,
      amount: 450.0,
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),  // 10 days in future
      status: 'PENDING',
      currentStage: 0,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
