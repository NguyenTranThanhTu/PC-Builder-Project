// Clean up old compatibility rules
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up old/invalid compatibility rules...\n');

  // Rules to delete (old/invalid attribute types)
  const rulesToDelete = [
    { leftAttrKey: 'MB_CHIPSET', rightAttrKey: 'CPU_CHIPSET_SUPPORT' },
    { leftAttrKey: 'PSU_POWER_CONNECTOR', rightAttrKey: 'GPU_POWER_CONNECTOR' },
    { leftAttrKey: 'STORAGE_INTERFACE', rightAttrKey: null },
    { leftAttrKey: 'STORAGE_FORM_FACTOR', rightAttrKey: 'CASE_FORM_FACTOR' }
  ];

  for (const rule of rulesToDelete) {
    const leftAttr = rule.leftAttrKey ? await prisma.attributeType.findUnique({ where: { key: rule.leftAttrKey } }) : null;
    const rightAttr = rule.rightAttrKey ? await prisma.attributeType.findUnique({ where: { key: rule.rightAttrKey } }) : null;

    if (leftAttr || rightAttr) {
      const deleted = await prisma.compatibilityRule.deleteMany({
        where: {
          AND: [
            leftAttr ? { leftAttributeTypeId: leftAttr.id } : {},
            rightAttr ? { rightAttributeTypeId: rightAttr.id } : {}
          ]
        }
      });
      console.log(`  ✅ Deleted ${deleted.count} rule(s) with ${rule.leftAttrKey || 'N/A'} ↔ ${rule.rightAttrKey || 'N/A'}`);
    }
  }

  const remaining = await prisma.compatibilityRule.count();
  console.log(`\n✅ Cleanup complete. Remaining rules: ${remaining}`);
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
