// Test detailed compatibility messages
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Detailed Compatibility Messages\n');

  // Test Case 1: Socket Mismatch
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Case 1: Socket Mismatch (LGA1700 CPU + AM5 Mainboard)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const intelCPU = await prisma.product.findFirst({
    where: { 
      category: { slug: 'cpu' },
      name: { contains: 'i5-14400F' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  const amdMB = await prisma.product.findFirst({
    where: { 
      category: { slug: 'mainboard' },
      name: { contains: 'B650' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  if (intelCPU && amdMB) {
    console.log(`✅ Found: ${intelCPU.name}`);
    const cpuSocket = intelCPU.attributes.find(a => a.attributeType.key === 'CPU_SOCKET');
    console.log(`   Socket: ${cpuSocket?.stringValue}`);
    
    console.log(`✅ Found: ${amdMB.name}`);
    const mbSocket = amdMB.attributes.find(a => a.attributeType.key === 'MB_SOCKET');
    console.log(`   Socket: ${mbSocket?.stringValue}`);
    
    console.log('\n   ❌ Expected: Socket không khớp error\n');
  }
  
  // Test Case 2: RAM Type Mismatch
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Case 2: RAM Type Mismatch (DDR4 RAM + DDR5 Mainboard)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const ddr4RAM = await prisma.product.findFirst({
    where: { 
      category: { slug: 'ram' },
      name: { contains: 'DDR4' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  const ddr5MB = await prisma.product.findFirst({
    where: { 
      category: { slug: 'mainboard' },
      attributes: {
        some: {
          attributeType: { key: 'MB_RAM_TYPE' },
          stringValue: 'DDR5'
        }
      }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  if (ddr4RAM && ddr5MB) {
    console.log(`✅ Found: ${ddr4RAM.name}`);
    const ramType = ddr4RAM.attributes.find(a => a.attributeType.key === 'RAM_TYPE');
    console.log(`   Type: ${ramType?.stringValue}`);
    
    console.log(`✅ Found: ${ddr5MB.name}`);
    const mbRamType = ddr5MB.attributes.find(a => a.attributeType.key === 'MB_RAM_TYPE');
    console.log(`   Supports: ${mbRamType?.stringValue}`);
    
    console.log('\n   ❌ Expected: Loại RAM không khớp error\n');
  }
  
  // Test Case 3: GPU Too Long
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Case 3: GPU Too Long (357mm GPU + 360mm Case)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const bigGPU = await prisma.product.findFirst({
    where: { 
      category: { slug: 'gpu' },
      name: { contains: 'RTX 4090' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  const smallCase = await prisma.product.findFirst({
    where: { 
      category: { slug: 'case' },
      name: { contains: '4000D' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  if (bigGPU && smallCase) {
    console.log(`✅ Found: ${bigGPU.name}`);
    const gpuLength = bigGPU.attributes.find(a => a.attributeType.key === 'GPU_LENGTH_MM');
    console.log(`   Length: ${gpuLength?.numberValue}mm`);
    
    console.log(`✅ Found: ${smallCase.name}`);
    const caseClearance = smallCase.attributes.find(a => a.attributeType.key === 'CASE_GPU_CLEARANCE_MM');
    console.log(`   GPU Clearance: ${caseClearance?.numberValue}mm`);
    
    console.log('\n   ❌ Expected: GPU quá dài error\n');
  }
  
  // Test Case 4: Too Many RAM Modules
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Case 4: Too Many RAM Modules (3 kits × 2 modules = 6 modules > 4 slots)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const ram2x16 = await prisma.product.findFirst({
    where: { 
      category: { slug: 'ram' },
      attributes: {
        some: {
          attributeType: { key: 'RAM_MODULES' },
          numberValue: 2
        }
      }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  const mb4Slots = await prisma.product.findFirst({
    where: { 
      category: { slug: 'mainboard' },
      attributes: {
        some: {
          attributeType: { key: 'MB_RAM_SLOTS' },
          numberValue: 4
        }
      }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  if (ram2x16 && mb4Slots) {
    console.log(`✅ Found: ${ram2x16.name}`);
    const ramModules = ram2x16.attributes.find(a => a.attributeType.key === 'RAM_MODULES');
    console.log(`   Modules: ${ramModules?.numberValue} sticks`);
    console.log(`   If select 3 kits: 3 × ${ramModules?.numberValue} = ${3 * (ramModules?.numberValue || 0)} modules`);
    
    console.log(`✅ Found: ${mb4Slots.name}`);
    const mbSlots = mb4Slots.attributes.find(a => a.attributeType.key === 'MB_RAM_SLOTS');
    console.log(`   RAM Slots: ${mbSlots?.numberValue}`);
    
    console.log('\n   ❌ Expected: Quá nhiều thanh RAM error (6 modules > 4 slots)\n');
  }
  
  // Test Case 5: RAM Speed Warning (not error)
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Case 5: RAM Speed Higher Than Mainboard (6400MHz RAM + 6000MHz MB)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const fastRAM = await prisma.product.findFirst({
    where: { 
      category: { slug: 'ram' },
      name: { contains: 'DDR5-6400' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  const mb6000 = await prisma.product.findFirst({
    where: { 
      category: { slug: 'mainboard' },
      attributes: {
        some: {
          attributeType: { key: 'MB_MAX_RAM_SPEED_MHZ' },
          numberValue: 6000
        }
      }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  if (fastRAM && mb6000) {
    console.log(`✅ Found: ${fastRAM.name}`);
    const ramSpeed = fastRAM.attributes.find(a => a.attributeType.key === 'RAM_SPEED_MHZ');
    console.log(`   Speed: ${ramSpeed?.numberValue}MHz`);
    
    console.log(`✅ Found: ${mb6000.name}`);
    const mbSpeed = mb6000.attributes.find(a => a.attributeType.key === 'MB_MAX_RAM_SPEED_MHZ');
    console.log(`   Max Speed: ${mbSpeed?.numberValue}MHz`);
    
    console.log('\n   ⚠️ Expected: Warning - RAM sẽ chạy ở tốc độ thấp hơn\n');
  }
  
  // Test Case 6: Cooler Socket Compatibility
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Case 6: Multi-Socket Cooler (LGA1700/AM5/AM4 supports LGA1700)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const cooler = await prisma.product.findFirst({
    where: { 
      category: { slug: 'cooler' },
      name: { contains: 'MasterLiquid' }
    },
    include: { attributes: { include: { attributeType: true } } }
  });
  
  if (cooler && intelCPU) {
    console.log(`✅ Found: ${cooler.name}`);
    const coolerSocket = cooler.attributes.find(a => a.attributeType.key === 'COOLER_SOCKET_COMPAT');
    console.log(`   Supports: ${coolerSocket?.stringValue}`);
    
    console.log(`✅ CPU: ${intelCPU.name}`);
    const cpuSocketAttr = intelCPU.attributes.find(a => a.attributeType.key === 'CPU_SOCKET');
    console.log(`   Socket: ${cpuSocketAttr?.stringValue}`);
    
    console.log('\n   ✅ Expected: Compatible (LGA1700 is in the support list)\n');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ Test cases prepared. Run PC Builder to see detailed messages!');
  console.log('═══════════════════════════════════════════════════════');
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
