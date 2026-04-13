const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const data = [
    {
      invoice_id: 'INV-001',
      client_name: 'Lalit Khairnar',
      client_email: 'lalitkhairnar93@gmail.com',
      client_phone: '919326780773',
      amount: 15000,
      due_date: '2026-04-12',
      issue_date: '2026-04-07',
      status: 'pending',
      start_followups: 0,
      notes: 'First invoice',
    },
    {
      invoice_id: 'INV-002',
      client_name: 'Lalit Khairnar',
      client_email: 'lalitkhairnar93@gmail.com',
      client_phone: '919812345678',
      amount: 60000,
      due_date: '2026-03-25',
      issue_date: '2026-03-01',
      status: 'paid',
      reminder_stage: 1,
      start_followups: 0,
      notes: 'High value client',
    },
    {
      invoice_id: 'INV-003',
      client_name: 'Ketan Mane',
      client_email: 'ketanmane123456@gmail.com',
      client_phone: '919876543210',
      amount: 22000,
      due_date: '2026-04-05',
      issue_date: '2026-03-22',
      status: 'pending',
      reminder_stage: 0,
      notes: 'New client onboarding',
    },
    {
      invoice_id: 'INV-004',
      client_name: 'Durgesh Suryawanshi',
      client_email: 'durgeshtest3@gmail.com',
      client_phone: '919812345679',
      amount: 18000,
      due_date: '2026-03-28',
      issue_date: '2026-03-10',
      status: 'overdue',
      reminder_stage: 2,
      last_reminder_sent: '2026-03-30',
      notes: 'Follow-up required',
    },
    {
      invoice_id: 'INV-005',
      client_name: 'Pratik Patil',
      client_email: 'pratikn@sigasystems.com',
      client_phone: '919845678902',
      amount: 30000,
      due_date: '2026-04-08',
      issue_date: '2026-03-20',
      status: 'pending',
      reminder_stage: 1,
      last_reminder_sent: '2026-03-31',
      notes: 'Waiting for confirmation',
    },
  ];

  for (const item of data) {
    // Create or find customer
    const customer = await prisma.customer.upsert({
      where: { email: item.client_email },
      update: {
        name: item.client_name,
        phone: item.client_phone,
      },
      create: {
        name: item.client_name,
        email: item.client_email,
        phone: item.client_phone,
      },
    });

    // Upsert Invoice
    await prisma.invoice.upsert({
      where: { invoice_number: item.invoice_id },
      update: {
        amount: item.amount,
        dueDate: new Date(item.due_date),
        issueDate: new Date(item.issue_date),
        status: item.status.toUpperCase() === 'PAID' ? 'PAID' : item.status.toUpperCase() === 'OVERDUE' ? 'OVERDUE' : 'PENDING',
        reminder_stage: item.reminder_stage || 0,
        last_reminder_sent: item.last_reminder_sent ? new Date(item.last_reminder_sent) : null,
        startFollowups: parseInt(item.start_followups) || 0,
        notes: item.notes,
      },
      create: {
        invoice_number: item.invoice_id,
        amount: item.amount,
        dueDate: new Date(item.due_date),
        issueDate: new Date(item.issue_date),
        status: item.status.toUpperCase() === 'PAID' ? 'PAID' : item.status.toUpperCase() === 'OVERDUE' ? 'OVERDUE' : 'PENDING',
        reminder_stage: item.reminder_stage || 0,
        last_reminder_sent: item.last_reminder_sent ? new Date(item.last_reminder_sent) : null,
        startFollowups: parseInt(item.start_followups) || 0,
        notes: item.notes,
        customerId: customer.id,
        reminder_stages: item.reminder_stage !== undefined ? [item.reminder_stage] : [],
        tones: [], // To be populated
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
