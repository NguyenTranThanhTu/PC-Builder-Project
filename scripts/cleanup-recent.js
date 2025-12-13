const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  // Delete products created in last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const result = await prisma.product.deleteMany({
    where: {
      createdAt: {
        gte: tenMinutesAgo
      }
    }
  });
  
  console.log(`✅ Deleted ${result.count} products`);
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
