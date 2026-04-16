import { PrismaClient } from '../src/generated-prisma';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.globalSetting.findUnique({
    where: { id: 'global_config' }
  });
  console.log('--- GLOBAL SETTINGS ---');
  console.log(JSON.stringify(settings, null, 2));

  const inv003 = await prisma.invoice.findUnique({
    where: { invoice_number: 'INV-003' }
  });
  console.log('\n--- INV-003 CURRENT STATE ---');
  console.log(JSON.stringify(inv003, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
