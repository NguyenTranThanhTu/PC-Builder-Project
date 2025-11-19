// Normalize existing product imageUrl values to start with '/' for Next/Image
// Run: node prisma/fix-image-urls.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ select: { id: true, imageUrl: true } });
  let updated = 0;
  for (const p of products) {
    if (!p.imageUrl) continue;
    if (/^https?:\/\//i.test(p.imageUrl)) continue; // absolute ok
    if (p.imageUrl.startsWith('/')) continue; // already normalized
    const newUrl = '/' + p.imageUrl.replace(/^\/+/, '');
    await prisma.product.update({ where: { id: p.id }, data: { imageUrl: newUrl } });
    updated++;
  }
  console.log(`Normalized ${updated} product imageUrl values.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
