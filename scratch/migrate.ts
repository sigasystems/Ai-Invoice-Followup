
import { PrismaClient } from '../src/generated-prisma';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration...');

  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { followupStartDate: null },
        { nextActionAt: null }
      ]
    }
  });

  console.log(`Found ${invoices.length} invoices to update.`);

  for (const invoice of invoices) {
    const followupStartDate = invoice.followupStartDate || addDays(invoice.issueDate, invoice.startFollowups);
    const nextActionAt = invoice.nextActionAt || followupStartDate;

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        followupStartDate,
        nextActionAt
      }
    });
    console.log(`Updated invoice ${invoice.invoice_number}`);
  }

  console.log('Migration completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
