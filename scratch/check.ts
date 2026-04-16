
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const inv = await prisma.invoice.findFirst();
  console.log(JSON.stringify(inv, null, 2));
}
test().catch(console.error).finally(() => prisma.$disconnect());
