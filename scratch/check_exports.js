const prisma = require('@prisma/client');
console.log('Exports:', Object.keys(prisma));
if (prisma.$Enums) {
  console.log('Enums:', Object.keys(prisma.$Enums));
}
