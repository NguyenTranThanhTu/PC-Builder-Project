// Check compatibility rules
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const rules = await prisma.compatibilityRule.findMany({
    include: {
      leftCategory: true,
      rightCategory: true,
      leftAttrType: true,
      rightAttrType: true
    },
    orderBy: [
      { leftCategoryId: 'asc' },
      { rightCategoryId: 'asc' }
    ]
  });

  console.log(`\n📊 Total rules: ${rules.length}\n`);
  
  rules.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.leftCategory?.slug || 'ANY'}] ${r.leftAttrType?.key || 'N/A'}`);
    console.log(`   ${r.operator}`);
    console.log(`   [${r.rightCategory?.slug || 'ANY'}] ${r.rightAttrType?.key || 'N/A'}`);
    console.log(`   💡 ${r.note || 'N/A'}\n`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
