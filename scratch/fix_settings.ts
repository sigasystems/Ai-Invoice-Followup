// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const setting = await prisma.globalSetting.findUnique({
//     where: { id: 'global_config' },
//   });

//   if (setting && setting.writeWebhook && setting.writeWebhook.includes('http://localhost:3000')) {
//     console.log('Detected malformed writeWebhook:', setting.writeWebhook);
    
//     // Attempt to extract the base n8n URL
//     const parts = setting.writeWebhook.split('http');
//     // parts[0] is empty if it started with http
//     // parts[1] is ://localhost:5678/webhook-test/
//     // parts[2] is ://localhost:3000/api/invoices
    
//     if (parts.length > 2) {
//       const cleanUrl = 'http' + parts[1].replace(/\/$/, '') + '/trigger-reminder';
//       console.log('Cleaning to:', cleanUrl);
      
//       await prisma.globalSetting.update({
//         where: { id: 'global_config' },
//         data: { writeWebhook: cleanUrl },
//       });
//       console.log('Updated writeWebhook successfully.');
//     }
//   } else {
//     console.log('Settings look okay or not found.');
//   }
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());
