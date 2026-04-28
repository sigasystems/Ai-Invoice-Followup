
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.globalSetting.findUnique({
    where: { id: 'global_config' },
  });

  if (!settings) {
    return;
  }

  let updated = false;
  const updates: any = {};

  if (settings.writeWebhook?.includes('/webhook-test/')) {
    updates.writeWebhook = settings.writeWebhook.replace('/webhook-test/', '/webhook/');
    updated = true;
  }

  if (settings.readWebhook?.includes('/webhook-test/')) {
    updates.readWebhook = settings.readWebhook.replace('/webhook-test/', '/webhook/');
    updated = true;
  }

  if (updated) {
    await prisma.globalSetting.update({
      where: { id: 'global_config' },
      data: updates,
    });
  } else {
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
