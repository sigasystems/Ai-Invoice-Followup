import { PrismaClient } from '../src/generated-prisma';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.globalSetting.findUnique({
    where: { id: 'global_config' }
  });

  const inv003 = await prisma.invoice.findUnique({
    where: { invoice_number: 'INV-003' }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
