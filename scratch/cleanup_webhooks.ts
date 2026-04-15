// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   const setting = await prisma.globalSetting.findUnique({ where: { id: 'global_config' } });
//   if (!setting) return;

//   const updates: any = {};
  
//   if (setting.writeWebhook?.includes('http://localhost:3000')) {
//     const parts = setting.writeWebhook.split('http');
//     updates.writeWebhook = 'http' + parts[1].replace(/\/$/, '') + '/trigger-reminder';
//   }

//   if (setting.readWebhook?.includes('http://localhost:3000')) {
//     const parts = setting.readWebhook.split('http');
//     updates.readWebhook = 'http' + parts[1].replace(/\/$/, '') + '/read-sheet';
//   }

//   if (Object.keys(updates).length > 0) {
//     console.log('Applying cleanup:', updates);
//     await prisma.globalSetting.update({
//       where: { id: 'global_config' },
//       data: updates,
//     });
//     console.log('Cleanup complete.');
//   } else {
//     console.log('No cleanup needed.');
//   }
// }

// main().finally(() => prisma.$disconnect());
