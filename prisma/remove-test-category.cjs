// Remove duplicate test category 'Card đồ họa' with slug not equal to 'gpu'
// Run: node prisma/remove-test-category.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({ where: { name: 'Card đồ họa' } });
  const toRemove = cats.filter(c => c.slug !== 'gpu');
  if (!toRemove.length) {
    console.log('No duplicate test category found.');
    return;
  }
  for (const c of toRemove) {
    // Safety: ensure no products linked; if there are, abort.
    const count = await prisma.product.count({ where: { categoryId: c.id } });
    if (count > 0) {
      console.warn(`Skip deleting category ${c.slug} because it has ${count} products.`);
      continue;
    }
    await prisma.category.delete({ where: { id: c.id } });
    console.log(`Deleted duplicate category slug='${c.slug}' id=${c.id}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
