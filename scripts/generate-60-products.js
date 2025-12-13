/**
 * Generate 60 realistic products per category with FULL attributes
 * With proper images and complete specs matching ATTRIBUTE_TEMPLATES
 */

const { PrismaClient } = require('@prisma/client');
const REAL_PRODUCTS = require('./curated-products.js');

const prisma = new PrismaClient();

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function varyPrice(basePrice, variance) {
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.round(basePrice * factor / 10000) * 10000;
}

// Generate CPU variations (60 products)
function generateCPUVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.cpu;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(5, 50),
      warranty: randomChoice(['12 tháng', '24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate GPU variations (60 products, skip high-price ones)
function generateGPUVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.gpu.filter(g => g.price <= 21000000); // Only affordable GPUs
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(3, 30),
      warranty: randomChoice(['24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Mainboard variations (60 products)
function generateMainboardVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.mainboard;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(5, 40),
      warranty: randomChoice(['24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate RAM variations (60 products)
function generateRAMVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.ram;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 100),
      warranty: randomChoice(['12 tháng', '24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Storage variations (60 products)
function generateStorageVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.storage;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 60),
      warranty: randomChoice(['36 tháng', '60 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate PSU variations (60 products)
function generatePSUVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.psu;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 60),
      warranty: randomChoice(['36 tháng', '60 tháng', '84 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Case variations (60 products)
function generateCaseVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.case;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(5, 40),
      warranty: randomChoice(['12 tháng', '24 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Cooler variations (60 products)
function generateCoolerVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.cooler;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 60),
      warranty: randomChoice(['24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate product description
function generateDescription(category, productName) {
  const templates = {
    cpu: `${productName} - Vi xử lý hiệu năng cao với công nghệ tiên tiến, tối ưu cho gaming và công việc đa nhiệm. Hỗ trợ công nghệ ép xung, tiết kiệm điện năng.`,
    gpu: `${productName} - Card đồ họa mạnh mẽ cho gaming 4K mượt mà và render chuyên nghiệp. Trang bị tản nhiệt hiệu quả, RGB đẹp mắt.`,
    mainboard: `${productName} - Bo mạch chủ cao cấp, hỗ trợ đầy đủ tính năng hiện đại. Thiết kế chắc chắn, khả năng mở rộng tốt.`,
    ram: `${productName} - Bộ nhớ RAM tốc độ cao, ổn định, tối ưu cho gaming và làm việc. Hỗ trợ XMP/DOCP, tản nhiệt đẹp mắt.`,
    storage: `${productName} - Ổ cứng SSD tốc độ cao, độ tin cậy tốt. Lý tưởng cho lưu trữ game, phần mềm và dữ liệu quan trọng.`,
    psu: `${productName} - Nguồn máy tính chất lượng cao, ổn định, hiệu suất tốt. Bảo vệ linh kiện an toàn, vận hành êm ái.`,
    case: `${productName} - Vỏ case thiết kế đẹp mắt, thoáng khí tốt. Hỗ trợ nhiều cấu hình, dễ dàng lắp đặt và nâng cấp.`,
    cooler: `${productName} - Tản nhiệt hiệu quả, hoạt động êm ái. Giữ nhiệt độ CPU ổn định ngay cả khi ép xung.`,
  };
  return templates[category] || `${productName} - Sản phẩm chất lượng cao, hiệu năng tốt.`;
}

// Map CPU attributes - FIXED to match ATTRIBUTE_TEMPLATES exactly
function mapCPUAttributes(product) {
  // Determine CPU series (K/KF/non-K)
  const name = product.name;
  let series = 'non-K';
  if (name.includes('KF')) series = 'KF';
  else if (name.endsWith('K') || name.includes('K ')) series = 'K';
  
  // Determine tier based on model
  let tier = 'Mid-range';
  if (name.includes('i9-') || name.includes('Ryzen 9')) tier = 'High-end';
  else if (name.includes('i3-') || name.includes('Ryzen 3')) tier = 'Budget';
  
  return [
    { key: 'CPU_BRAND', stringValue: product.brand },
    { key: 'CPU_SOCKET', stringValue: product.socket },
    { key: 'CPU_SERIES', stringValue: series },
    { key: 'CPU_TIER', stringValue: tier },
    { key: 'CPU_CORES', numberValue: product.cores },
    { key: 'CPU_THREADS', numberValue: product.threads },
    { key: 'CPU_BASE_CLOCK_GHZ', numberValue: product.baseClock },
    { key: 'CPU_BOOST_CLOCK_GHZ', numberValue: product.boostClock },
    { key: 'CPU_CACHE_MB', numberValue: product.cache },
    { key: 'CPU_TDP_WATT', numberValue: product.tdp },
    { key: 'CPU_MAX_MEMORY_SPEED_MHZ', numberValue: product.socket === 'LGA1700' ? 5600 : 5200 },
    product.socket === 'LGA1700' && { key: 'CPU_INTEGRATED_GPU', stringValue: product.name.includes('KF') || product.name.includes('F') ? 'None' : 'UHD Graphics 770' },
  ].filter(Boolean);
}

// Map GPU attributes
function mapGPUAttributes(product) {
  return [
    { key: 'GPU_CHIP', stringValue: product.chip },
    { key: 'GPU_VRAM_GB', numberValue: product.vram },
    { key: 'GPU_MEMORY_BUS', numberValue: product.memoryBus },
    { key: 'GPU_BOOST_CLOCK_MHZ', numberValue: product.boostClock },
    { key: 'GPU_INTERFACE', stringValue: product.interface },
    { key: 'GPU_LENGTH_MM', numberValue: product.length },
    { key: 'GPU_TDP_WATT', numberValue: product.tdp },
    { key: 'GPU_POWER_CONNECTOR', stringValue: product.powerConnector },
    { key: 'GPU_PCIE_GEN', stringValue: product.pcieGen },
  ];
}

// Map Mainboard attributes - Updated with chipset tier and OC support
function mapMainboardAttributes(product) {
  const chipset = product.chipset;
  
  // Determine chipset tier
  let chipsetTier = 'Mid-range';
  let supportsOC = 'No';
  let vrmQuality = 'Average';
  
  if (chipset.startsWith('Z')) {
    chipsetTier = 'High-end';
    supportsOC = 'Yes';
    vrmQuality = product.price > 15000000 ? 'Excellent' : 'Good';
  } else if (chipset.startsWith('X')) {
    chipsetTier = 'High-end';
    supportsOC = 'Yes';
    vrmQuality = product.price > 15000000 ? 'Excellent' : 'Good';
  } else if (chipset.startsWith('B')) {
    chipsetTier = 'Mid-range';
    supportsOC = chipset.startsWith('B650') || chipset.startsWith('B550') ? 'Yes' : 'No'; // AMD B-series supports OC
    vrmQuality = product.price > 7000000 ? 'Good' : 'Average';
  } else if (chipset.startsWith('H') || chipset.startsWith('A')) {
    chipsetTier = 'Budget';
    supportsOC = 'No';
    vrmQuality = 'Basic';
  }
  
  return [
    { key: 'MB_SOCKET', stringValue: product.socket },
    { key: 'MB_CHIPSET', stringValue: product.chipset },
    { key: 'MB_CHIPSET_TIER', stringValue: chipsetTier },
    { key: 'MB_SUPPORTS_OVERCLOCKING', stringValue: supportsOC },
    { key: 'MB_VRM_QUALITY', stringValue: vrmQuality },
    { key: 'MB_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'MB_RAM_TYPE', stringValue: product.ramType },
    { key: 'MB_RAM_SLOTS', numberValue: product.memorySlots },
    { key: 'MB_MAX_RAM_GB', numberValue: product.maxMemory },
    { key: 'MB_MAX_RAM_SPEED_MHZ', numberValue: product.ramMaxSpeed },
    { key: 'MB_PCIEX16_SLOTS', numberValue: product.pciex16Slots },
    { key: 'MB_M2_SLOTS', numberValue: product.m2Slots },
    { key: 'MB_SATA_PORTS', numberValue: product.sataPorts },
    product.wifi && { key: 'MB_WIFI', stringValue: product.wifi },
    product.bluetooth && { key: 'MB_BLUETOOTH', stringValue: product.bluetooth },
  ].filter(Boolean);
}

// Map RAM attributes
function mapRAMAttributes(product) {
  return [
    { key: 'RAM_TYPE', stringValue: product.type },
    { key: 'RAM_CAPACITY_GB', numberValue: product.capacity },
    { key: 'RAM_SPEED_MHZ', numberValue: product.speed },
    { key: 'RAM_MODULES', numberValue: product.modules },
    { key: 'RAM_CL', numberValue: product.cas },
  ];
}

// Map Storage attributes
function mapStorageAttributes(product) {
  return [
    { key: 'STORAGE_TYPE', stringValue: product.type },
    { key: 'STORAGE_INTERFACE', stringValue: product.interface },
    { key: 'STORAGE_CAPACITY_GB', numberValue: product.capacity },
    { key: 'STORAGE_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'STORAGE_READ_SPEED_MBPS', numberValue: product.readSpeed },
    { key: 'STORAGE_WRITE_SPEED_MBPS', numberValue: product.writeSpeed },
  ];
}

// Map PSU attributes
function mapPSUAttributes(product) {
  return [
    { key: 'PSU_WATTAGE', numberValue: product.wattage },
    { key: 'PSU_CERT', stringValue: product.cert },
    { key: 'PSU_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'PSU_MODULAR', stringValue: product.modular },
    { key: 'PSU_PCIE_CONNECTORS', stringValue: product.pcieConnectors },
    { key: 'PSU_EPS_CONNECTORS', stringValue: product.epsConnectors },
    { key: 'PSU_SATA_CONNECTORS', numberValue: product.sataPorts },
  ];
}

// Map Case attributes
function mapCaseAttributes(product) {
  return [
    { key: 'CASE_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'CASE_GPU_CLEARANCE_MM', numberValue: product.gpuClearance },
    { key: 'CASE_CPU_COOLER_CLEARANCE_MM', numberValue: product.cpuCoolerClearance },
    { key: 'CASE_MAX_PSU_LENGTH_MM', numberValue: product.psuLength },
    { key: 'CASE_DRIVE_BAYS_25', numberValue: product.driveBays25 },
    { key: 'CASE_DRIVE_BAYS_35', numberValue: product.driveBays35 },
    { key: 'CASE_EXPANSION_SLOTS', numberValue: product.expansionSlots },
    { key: 'CASE_FRONT_IO', stringValue: product.frontIO },
    { key: 'CASE_TEMPERED_GLASS', stringValue: product.temperedGlass },
    { key: 'CASE_MAX_RADIATOR', stringValue: product.maxRadiator },
    { key: 'CASE_FANS_INCLUDED', stringValue: product.fansIncluded },
  ];
}

// Map Cooler attributes
function mapCoolerAttributes(product) {
  return [
    { key: 'COOLER_TYPE', stringValue: product.type },
    { key: 'COOLER_TDP_WATT', numberValue: product.tdpRating },
    { key: 'COOLER_MAX_HEIGHT_MM', numberValue: product.maxHeight },
    { key: 'COOLER_SOCKET_COMPAT', stringValue: product.socket },
  ];
}

// Import products to database
async function importProducts(category, products, attributeMapper) {
  const categorySlug = category.toLowerCase();
  console.log(`\n🔵 Importing ${products.length} products for: ${category.toUpperCase()}`);
  
  const dbCategory = await prisma.category.findFirst({
    where: { slug: categorySlug }
  });
  
  if (!dbCategory) {
    console.error(`❌ Category ${categorySlug} not found!`);
    return 0;
  }
  
  let created = 0;
  let errors = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      // Convert price to cents
      const priceCents = Math.round(product.price * 100);
      
      // Skip if price exceeds INT4 max
      if (priceCents > 2147483647) {
        console.log(`  ⚠️  Product ${i + 1} price too high: ${product.price / 1000000}M VND, skipping`);
        continue;
      }
      
      // Generate slug
      const slug = `${product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}-${Date.now()}-${i}`;
      
      // Create product
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          slug,
          description: generateDescription(categorySlug, product.name),
          imageUrl: `/images/products/${product.image}`,
          priceCents,
          stock: product.stock,
          brand: product.brand,
          manufacturer: product.brand,
          warranty: product.warranty,
          featured: product.featured,
          status: 'PUBLISHED',
          categoryId: dbCategory.id,
        }
      });
      
      // Create attributes
      const attrs = attributeMapper(product);
      
      for (const attr of attrs) {
        const attrType = await prisma.attributeType.findUnique({
          where: { key: attr.key }
        });
        
        if (!attrType) {
          console.error(`    ⚠️  AttributeType ${attr.key} not found`);
          continue;
        }
        
        await prisma.productAttribute.create({
          data: {
            productId: createdProduct.id,
            attributeTypeId: attrType.id,
            stringValue: attr.stringValue || null,
            numberValue: attr.numberValue || null,
          }
        });
      }
      
      created++;
      
      if ((i + 1) % 10 === 0 || i === products.length - 1) {
        console.log(`  ✅ Created ${created}/${products.length} products`);
      }
      
    } catch (error) {
      errors++;
      console.error(`❌ Error creating product ${i + 1}:`, error.message);
      if (errors > 10) {
        console.error('Too many errors, aborting...');
        break;
      }
    }
  }
  
  console.log(`✅ Completed: ${created}/${products.length} products created`);
  if (errors > 0) {
    console.log(`⚠️  Errors: ${errors}`);
  }
  
  return created;
}

// Main execution
async function main() {
  console.log('🚀 Starting 60-product generation with FULL attributes...\n');
  
  // Clean up existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('✅ Cleanup complete!\n');
  
  const summary = {};
  
  // Generate and import CPU (60)
  const cpuProducts = generateCPUVariations(60);
  summary.cpu = await importProducts('cpu', cpuProducts, mapCPUAttributes);
  
  // Generate and import Mainboard (60)
  const mainboardProducts = generateMainboardVariations(60);
  summary.mainboard = await importProducts('mainboard', mainboardProducts, mapMainboardAttributes);
  
  // Generate and import GPU (60, filtered)
  const gpuProducts = generateGPUVariations(60);
  summary.gpu = await importProducts('gpu', gpuProducts, mapGPUAttributes);
  
  // Generate and import RAM (60)
  const ramProducts = generateRAMVariations(60);
  summary.ram = await importProducts('ram', ramProducts, mapRAMAttributes);
  
  // Generate and import Storage (60)
  const storageProducts = generateStorageVariations(60);
  summary.storage = await importProducts('storage', storageProducts, mapStorageAttributes);
  
  // Generate and import PSU (60)
  const psuProducts = generatePSUVariations(60);
  summary.psu = await importProducts('psu', psuProducts, mapPSUAttributes);
  
  // Generate and import Case (60)
  const caseProducts = generateCaseVariations(60);
  summary.case = await importProducts('case', caseProducts, mapCaseAttributes);
  
  // Generate and import Cooler (60)
  const coolerProducts = generateCoolerVariations(60);
  summary.cooler = await importProducts('cooler', coolerProducts, mapCoolerAttributes);
  
  // Summary
  console.log('\n✅ GENERATION COMPLETE!\n');
  console.log('📊 Summary:');
  Object.entries(summary).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} products`);
  });
  
  const total = Object.values(summary).reduce((sum, count) => sum + count, 0);
  console.log(`\n📦 Total: ${total} products created`);
}

main()
  .catch(e => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
