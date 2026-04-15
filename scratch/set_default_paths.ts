import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updates = {
    writeWebhook: 'http://localhost:5678/webhook/send-reminder',
    readWebhook: 'http://localhost:5678/webhook/read-sheet'
  };

  console.log('Applying default local n8n paths:', updates);
  await prisma.globalSetting.update({
    where: { id: 'global_config' },
    data: updates,
  });
  console.log('Successfully updated paths to defaults.');
}

main().finally(() => prisma.$disconnect());
