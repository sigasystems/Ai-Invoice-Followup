
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.globalSetting.findUnique({
    where: { id: 'global_config' },
  });

  if (!settings) {
    console.log('No settings found.');
    return;
  }

  let updated = false;
  const updates: any = {};

  if (settings.writeWebhook?.includes('/webhook-test/')) {
    updates.writeWebhook = settings.writeWebhook.replace('/webhook-test/', '/webhook/');
    updated = true;
    console.log(`Updating writeWebhook to: ${updates.writeWebhook}`);
  }

  if (settings.readWebhook?.includes('/webhook-test/')) {
    updates.readWebhook = settings.readWebhook.replace('/webhook-test/', '/webhook/');
    updated = true;
    console.log(`Updating readWebhook to: ${updates.readWebhook}`);
  }

  if (updated) {
    await prisma.globalSetting.update({
      where: { id: 'global_config' },
      data: updates,
    });
    console.log('Settings updated successfully to Production URLs.');
  } else {
    console.log('URLs are already in production format or not using n8n test paths.');
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
