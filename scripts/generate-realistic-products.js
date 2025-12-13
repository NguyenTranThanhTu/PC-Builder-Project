/**
 * REALISTIC PRODUCT GENERATOR
 * Generates variations from curated real products
 */

const REAL_PRODUCTS = require('./curated-products');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper functions
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function varyPrice(basePrice, variance = 0.1) {
  const factor = 1 + (Math.random() * variance * 2 - variance);
  return Math.round(basePrice * factor / 10000) * 10000; // Round to 10K
}

// Generate CPU variations
function generateCPUVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.cpu;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    // Create variation
    const product = {
      ...base,
      name: base.name, // Keep original name
      price: varyPrice(base.price, 0.05), // ±5% price variation
      stock: randomInt(5, 50),
      warranty: randomChoice(['12 tháng', '24 tháng', '36 tháng']),
      featured: i < 10, // First 10 are featured
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate GPU variations  
function generateGPUVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.gpu;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(3, 30),
      warranty: randomChoice(['24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Mainboard variations
function generateMainboardVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.mainboard;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(5, 40),
      warranty: randomChoice(['24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate RAM variations
function generateRAMVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.ram;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 100),
      warranty: randomChoice(['12 tháng', '24 tháng', '36 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Storage variations
function generateStorageVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.storage;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 80),
      warranty: randomChoice(['36 tháng', '60 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate PSU variations
function generatePSUVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.psu;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(10, 60),
      warranty: randomChoice(['36 tháng', '60 tháng', '84 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Case variations
function generateCaseVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.case;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
      price: varyPrice(base.price, 0.05),
      stock: randomInt(5, 40),
      warranty: randomChoice(['12 tháng', '24 tháng']),
      featured: i < 10,
    };
    
    products.push(product);
  }
  
  return products;
}

// Generate Cooler variations
function generateCoolerVariations(count) {
  const products = [];
  const baseProducts = REAL_PRODUCTS.cooler;
  
  for (let i = 0; i < count; i++) {
    const base = randomChoice(baseProducts);
    
    const product = {
      ...base,
      name: base.name,
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
  const descriptions = {
    cpu: `${productName} - Vi xử lý hiệu năng cao với công nghệ tiên tiến, tối ưu cho gaming và công việc đa nhiệm. Hỗ trợ công nghệ ép xung, tiết kiệm điện năng.`,
    mainboard: `${productName} - Bo mạch chủ chất lượng cao với thiết kế bền bỉ, hỗ trợ đầy đủ các tính năng mở rộng. Trang bị tản nhiệt tốt, khe M.2, cổng USB hiện đại.`,
    gpu: `${productName} - Card đồ họa mạnh mẽ cho gaming 4K mượt mà và render chuyên nghiệp. Trang bị tản nhiệt hiệu quả, RGB đẹp mắt.`,
    ram: `${productName} - Bộ nhớ RAM tốc độ cao, ổn định, tối ưu cho gaming và làm việc. Hỗ trợ XMP/DOCP, tản nhiệt đẹp mắt.`,
    storage: `${productName} - Ổ cứng SSD tốc độ cao, độ tin cậy tốt. Lý tưởng cho lưu trữ game, phần mềm và dữ liệu quan trọng.`,
    psu: `${productName} - Nguồn máy tính ổn định, hiệu suất cao. Bảo vệ toàn diện cho linh kiện, hoạt động êm ái.`,
    case: `${productName} - Vỏ case thiết kế đẹp mắt, thoáng khí tốt. Dễ dàng lắp ráp, hỗ trợ nhiều kích thước linh kiện.`,
    cooler: `${productName} - Tản nhiệt hiệu quả, hoạt động êm ái. Giữ nhiệt độ CPU ổn định ngay cả khi ép xung.`
  };
  
  return descriptions[category] || '';
}

// Map product attributes to database format
function mapCPUAttributes(product) {
  return [
    { key: 'CPU_SOCKET', stringValue: product.socket },
    { key: 'CPU_CORES', numberValue: product.cores },
    { key: 'CPU_THREADS', numberValue: product.threads },
    { key: 'CPU_BASE_CLOCK_GHZ', numberValue: product.baseClock },
    { key: 'CPU_BOOST_CLOCK_GHZ', numberValue: product.boostClock },
    { key: 'CPU_CACHE_MB', numberValue: product.cache },
    { key: 'CPU_TDP_W', numberValue: product.tdp },
    { key: 'CPU_GENERATION', stringValue: product.gen },
  ];
}

function mapGPUAttributes(product) {
  return [
    { key: 'GPU_CHIPSET', stringValue: product.chip },
    { key: 'GPU_VRAM_GB', numberValue: product.vram },
    { key: 'GPU_MEMORY_BUS_BIT', numberValue: product.memoryBus },
    { key: 'GPU_BASE_CLOCK_MHZ', numberValue: product.baseClock },
    { key: 'GPU_BOOST_CLOCK_MHZ', numberValue: product.boostClock },
    { key: 'GPU_TDP_W', numberValue: product.tdp },
    { key: 'GPU_INTERFACE', stringValue: product.interface },
  ];
}

function mapMainboardAttributes(product) {
  return [
    { key: 'MOBO_SOCKET', stringValue: product.socket },
    { key: 'MOBO_CHIPSET', stringValue: product.chipset },
    { key: 'MOBO_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'MOBO_MEMORY_SLOTS', numberValue: product.memorySlots },
    { key: 'MOBO_MAX_MEMORY_GB', numberValue: product.maxMemory },
    { key: 'MOBO_M2_SLOTS', numberValue: product.m2Slots },
    product.wifi && { key: 'MOBO_WIFI', stringValue: product.wifi },
  ].filter(Boolean);
}

function mapRAMAttributes(product) {
  return [
    { key: 'RAM_CAPACITY_GB', numberValue: product.capacity },
    { key: 'RAM_KIT_CONFIG', stringValue: product.kit },
    { key: 'RAM_TYPE', stringValue: product.type },
    { key: 'RAM_SPEED_MHZ', numberValue: product.speed },
    { key: 'RAM_CAS_LATENCY', numberValue: product.cas },
    { key: 'RAM_VOLTAGE', numberValue: product.voltage },
    product.rgb && { key: 'RAM_RGB', stringValue: 'Yes' },
  ].filter(Boolean);
}

function mapStorageAttributes(product) {
  return [
    { key: 'STORAGE_CAPACITY_GB', numberValue: product.capacity },
    { key: 'STORAGE_INTERFACE', stringValue: product.interface },
    { key: 'STORAGE_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'STORAGE_READ_SPEED_MBS', numberValue: product.readSpeed },
    { key: 'STORAGE_WRITE_SPEED_MBS', numberValue: product.writeSpeed },
    { key: 'STORAGE_TBW', numberValue: product.tbw },
  ];
}

function mapPSUAttributes(product) {
  return [
    { key: 'PSU_WATTAGE_W', numberValue: product.wattage },
    { key: 'PSU_CERTIFICATION', stringValue: product.cert },
    { key: 'PSU_MODULAR', stringValue: product.modular },
    { key: 'PSU_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'PSU_PCIE_CONNECTORS', stringValue: product.pcieConnectors },
    { key: 'PSU_EPS_CONNECTORS', stringValue: product.epsConnectors },
  ];
}

function mapCaseAttributes(product) {
  return [
    { key: 'CASE_FORM_FACTOR', stringValue: product.formFactor },
    { key: 'CASE_GPU_CLEARANCE_MM', numberValue: product.gpuClearance },
    { key: 'CASE_CPU_COOLER_CLEARANCE_MM', numberValue: product.cpuCoolerClearance },
    { key: 'CASE_MAX_PSU_LENGTH_MM', numberValue: product.psuLength },
    { key: 'CASE_DRIVE_BAYS_25', numberValue: product.driveBays25 },
    { key: 'CASE_DRIVE_BAYS_35', numberValue: product.driveBays35 },
    { key: 'CASE_EXPANSION_SLOTS', numberValue: product.expansionSlots },
    { key: 'CASE_TEMPERED_GLASS', stringValue: product.temperedGlass ? 'Yes' : 'No' },
  ];
}

function mapCoolerAttributes(product) {
  return [
    { key: 'COOLER_TYPE', stringValue: product.type },
    product.radiatorSize && { key: 'COOLER_RADIATOR_SIZE_MM', numberValue: product.radiatorSize },
    { key: 'COOLER_FAN_COUNT', numberValue: product.fanCount },
    { key: 'COOLER_TDP_RATING_W', numberValue: product.tdpRating },
    { key: 'COOLER_SOCKET_SUPPORT', stringValue: product.socket },
    product.rgb && { key: 'COOLER_RGB', stringValue: 'Yes' },
  ].filter(Boolean);
}

// Import products to database
async function importProducts(categorySlug, products, attributeMapper) {
  console.log(`\n🔵 Importing ${products.length} products for: ${categorySlug.toUpperCase()}`);
  
  const category = await prisma.category.findFirst({
    where: { slug: categorySlug }
  });
  
  if (!category) {
    console.error(`❌ Category not found: ${categorySlug}`);
    return 0;
  }
  
  let successCount = 0;
  let errors = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      // Create slug
      const slug = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + `-${Date.now()}-${i}`;
      
      // Convert price to cents (already in VND)
      const priceCents = Math.round(product.price * 100);
      
      // Max safe INT4: 2,147,483,647 cents = ~21.4M VND
      if (priceCents > 2147483647) {
        console.warn(`  ⚠️  Product ${i+1} price too high: ${product.price} VND, skipping`);
        continue;
      }
      
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
          categoryId: category.id,
        }
      });
      
      // Create attributes
      const attrs = attributeMapper(product);
      
      for (const attr of attrs) {
        const attrType = await prisma.attributeType.findFirst({
          where: { key: attr.key }
        });
        
        if (attrType) {
          await prisma.productAttribute.create({
            data: {
              productId: createdProduct.id,
              attributeTypeId: attrType.id,
              numberValue: attr.numberValue || null,
              stringValue: attr.stringValue || null,
            }
          });
        }
      }
      
      successCount++;
      if ((i + 1) % 10 === 0) {
        console.log(`  ✅ Created ${i + 1}/${products.length} products`);
      }
      
    } catch (error) {
      errors.push({ product: product.name, error: error.message });
      console.error(`  ❌ Error creating product ${i+1}:`, error.message);
    }
  }
  
  console.log(`✅ Completed: ${successCount}/${products.length} products created`);
  if (errors.length > 0) {
    console.log(`⚠️  Errors: ${errors.length}`);
  }
  
  return successCount;
}

// Main function
async function main() {
  console.log('🚀 REALISTIC PRODUCT GENERATOR\n');
  console.log('📊 Generating from curated real products...\n');
  
  // Delete old generated products first
  console.log('🗑️  Deleting old data (orders, reviews, products)...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('✅ Cleanup complete\n');
  
  const results = {};
  
  // Generate and import each category
  const categories = [
    { slug: 'cpu', generator: generateCPUVariations, mapper: mapCPUAttributes, count: 150 },
    { slug: 'mainboard', generator: generateMainboardVariations, mapper: mapMainboardAttributes, count: 150 },
    { slug: 'gpu', generator: generateGPUVariations, mapper: mapGPUAttributes, count: 150 },
    { slug: 'ram', generator: generateRAMVariations, mapper: mapRAMAttributes, count: 150 },
    { slug: 'storage', generator: generateStorageVariations, mapper: mapStorageAttributes, count: 150 },
    { slug: 'psu', generator: generatePSUVariations, mapper: mapPSUAttributes, count: 150 },
    { slug: 'case', generator: generateCaseVariations, mapper: mapCaseAttributes, count: 150 },
    { slug: 'cooler', generator: generateCoolerVariations, mapper: mapCoolerAttributes, count: 150 },
  ];
  
  for (const cat of categories) {
    const products = cat.generator(cat.count);
    const count = await importProducts(cat.slug, products, cat.mapper);
    results[cat.slug] = count;
  }
  
  // Summary
  console.log('\n✅ GENERATION COMPLETE!\n');
  console.log('📊 Summary:');
  for (const [key, count] of Object.entries(results)) {
    console.log(`   ${key}: ${count} products`);
  }
  
  const total = Object.values(results).reduce((sum, count) => sum + count, 0);
  console.log(`\n📦 Total: ${total} products created`);
}

// Run
if (require.main === module) {
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { 
  generateCPUVariations, 
  generateGPUVariations,
  generateMainboardVariations,
  generateRAMVariations,
  generateStorageVariations,
  generatePSUVariations,
  generateCaseVariations,
  generateCoolerVariations
};
