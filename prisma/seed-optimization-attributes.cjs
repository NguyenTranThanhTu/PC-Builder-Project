// Seed new AttributeTypes for optimization warnings
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding new AttributeTypes for optimization features...\n');

  const newAttributes = [
    // CPU
    { key: 'CPU_SERIES', label: 'Series', valueType: 'STRING' },
    { key: 'CPU_TIER', label: 'Tier', valueType: 'STRING' },
    
    // Mainboard
    { key: 'MB_CHIPSET_TIER', label: 'Chipset Tier', valueType: 'STRING' },
    { key: 'MB_SUPPORTS_OVERCLOCKING', label: 'Hỗ trợ Overclock', valueType: 'STRING' },
    { key: 'MB_VRM_QUALITY', label: 'VRM Quality', valueType: 'STRING' },
  ];

  for (const attr of newAttributes) {
    const existing = await prisma.attributeType.findUnique({
      where: { key: attr.key }
    });

    if (existing) {
      console.log(`  ⏭️  ${attr.key} already exists`);
    } else {
      await prisma.attributeType.create({ data: attr });
      console.log(`  ✅ Created ${attr.key}`);
    }
  }

  console.log('\n✅ All optimization AttributeTypes are ready!');
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
