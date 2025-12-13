// Test PC Builder compatibility system
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing PC Builder compatibility system...\n');

  // Get some sample products to test
  const cpuIntel = await prisma.product.findFirst({
    where: { category: { slug: 'cpu' }, name: { contains: 'Intel' } },
    include: { category: true, attributes: { include: { attributeType: true } } }
  });

  const cpuAMD = await prisma.product.findFirst({
    where: { category: { slug: 'cpu' }, name: { contains: 'AMD' } },
    include: { category: true, attributes: { include: { attributeType: true } } }
  });

  const mbLGA1700 = await prisma.product.findFirst({
    where: { 
      category: { slug: 'mainboard' },
      attributes: { some: { attributeType: { key: 'MB_SOCKET' }, stringValue: 'LGA1700' } }
    },
    include: { category: true, attributes: { include: { attributeType: true } } }
  });

  const mbAM5 = await prisma.product.findFirst({
    where: { 
      category: { slug: 'mainboard' },
      attributes: { some: { attributeType: { key: 'MB_SOCKET' }, stringValue: 'AM5' } }
    },
    include: { category: true, attributes: { include: { attributeType: true } } }
  });

  const coolerMultiSocket = await prisma.product.findFirst({
    where: { 
      category: { slug: 'cooler' },
      attributes: { some: { attributeType: { key: 'COOLER_SOCKET_COMPAT' }, stringValue: { contains: 'LGA1700' } } }
    },
    include: { category: true, attributes: { include: { attributeType: true } } }
  });

  const ram16GB = await prisma.product.findFirst({
    where: { 
      category: { slug: 'ram' },
      attributes: { some: { attributeType: { key: 'RAM_CAPACITY_GB' }, numberValue: 16 } }
    },
    include: { category: true, attributes: { include: { attributeType: true } } }
  });

  console.log('📦 Sample Products Found:');
  console.log(`  - CPU Intel: ${cpuIntel?.name || 'N/A'}`);
  console.log(`  - CPU AMD: ${cpuAMD?.name || 'N/A'}`);
  console.log(`  - MB LGA1700: ${mbLGA1700?.name || 'N/A'}`);
  console.log(`  - MB AM5: ${mbAM5?.name || 'N/A'}`);
  console.log(`  - Cooler: ${coolerMultiSocket?.name || 'N/A'}`);
  console.log(`  - RAM 16GB: ${ram16GB?.name || 'N/A'}\n`);

  // Test attributes
  if (cpuIntel) {
    const socketAttr = cpuIntel.attributes.find(a => a.attributeType.key === 'CPU_SOCKET');
    const tdpAttr = cpuIntel.attributes.find(a => a.attributeType.key === 'CPU_TDP_WATT');
    console.log(`🔍 CPU Intel Attributes:`);
    console.log(`  - Socket: ${socketAttr?.stringValue || 'N/A'}`);
    console.log(`  - TDP: ${tdpAttr?.numberValue || 'N/A'}W\n`);
  }

  if (mbLGA1700) {
    const socketAttr = mbLGA1700.attributes.find(a => a.attributeType.key === 'MB_SOCKET');
    const ramTypeAttr = mbLGA1700.attributes.find(a => a.attributeType.key === 'MB_RAM_TYPE');
    const ramSlotsAttr = mbLGA1700.attributes.find(a => a.attributeType.key === 'MB_RAM_SLOTS');
    const formFactorAttr = mbLGA1700.attributes.find(a => a.attributeType.key === 'MB_FORM_FACTOR');
    console.log(`🔍 Mainboard LGA1700 Attributes:`);
    console.log(`  - Socket: ${socketAttr?.stringValue || 'N/A'}`);
    console.log(`  - RAM Type: ${ramTypeAttr?.stringValue || 'N/A'}`);
    console.log(`  - RAM Slots: ${ramSlotsAttr?.numberValue || 'N/A'}`);
    console.log(`  - Form Factor: ${formFactorAttr?.stringValue || 'N/A'}\n`);
  }

  if (coolerMultiSocket) {
    const socketAttr = coolerMultiSocket.attributes.find(a => a.attributeType.key === 'COOLER_SOCKET_COMPAT');
    const tdpAttr = coolerMultiSocket.attributes.find(a => a.attributeType.key === 'COOLER_TDP_WATT');
    const heightAttr = coolerMultiSocket.attributes.find(a => a.attributeType.key === 'COOLER_MAX_HEIGHT_MM');
    console.log(`🔍 Cooler Attributes:`);
    console.log(`  - Socket Compat: ${socketAttr?.stringValue || 'N/A'}`);
    console.log(`  - TDP: ${tdpAttr?.numberValue || 'N/A'}W`);
    console.log(`  - Height: ${heightAttr?.numberValue || 'N/A'}mm\n`);
  }

  if (ram16GB) {
    const typeAttr = ram16GB.attributes.find(a => a.attributeType.key === 'RAM_TYPE');
    const modulesAttr = ram16GB.attributes.find(a => a.attributeType.key === 'RAM_MODULES');
    const capacityAttr = ram16GB.attributes.find(a => a.attributeType.key === 'RAM_CAPACITY_GB');
    const speedAttr = ram16GB.attributes.find(a => a.attributeType.key === 'RAM_SPEED_MHZ');
    console.log(`🔍 RAM Attributes:`);
    console.log(`  - Type: ${typeAttr?.stringValue || 'N/A'}`);
    console.log(`  - Modules: ${modulesAttr?.numberValue || 'N/A'}`);
    console.log(`  - Capacity: ${capacityAttr?.numberValue || 'N/A'}GB`);
    console.log(`  - Speed: ${speedAttr?.numberValue || 'N/A'}MHz\n`);
  }

  console.log('✅ Test data retrieved successfully!');
  console.log('\n💡 Next step: Test compatibility.evaluateCompatibility() with these products');
  console.log('   You can use the PC Builder page to test the full compatibility system.\n');
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
