
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.globalSetting.findUnique({ where: { id: 'global_config' } });
  console.log(JSON.stringify(settings, null, 2));
}
main().finally(() => prisma.$disconnect());
