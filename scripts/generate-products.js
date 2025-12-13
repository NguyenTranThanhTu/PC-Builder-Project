/**
 * Generate realistic product data for PC Builder
 * Target: 150 products × 8 categories = 1200 products
 * 
 * Usage: node scripts/generate-products.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Product name templates
const PRODUCT_NAMES = {
  cpu: {
    intel: ['Core i3', 'Core i5', 'Core i7', 'Core i9', 'Core Ultra 5', 'Core Ultra 7', 'Core Ultra 9'],
    amd: ['Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'Threadripper'],
    generations: ['12th', '13th', '14th', '15th'],
    models: ['600', '700', '800', '900', '950', '960', '980'],
    suffixes: ['', 'K', 'F', 'KF', 'X', 'X3D']
  },
  mainboard: {
    brands: ['ASUS', 'MSI', 'Gigabyte', 'AsRock'],
    chipsets: ['B550', 'B650', 'B760', 'B860', 'X570', 'X670', 'Z690', 'Z790'],
    series: ['PRIME', 'TUF', 'ROG STRIX', 'PRO', 'GAMING', 'AORUS']
  },
  gpu: {
    nvidia: ['RTX 3050', 'RTX 3060', 'RTX 3060 Ti', 'RTX 3070', 'RTX 3080', 'RTX 4060', 'RTX 4060 Ti', 'RTX 4070', 'RTX 4070 Ti', 'RTX 4080', 'RTX 4090'],
    amd: ['RX 6600', 'RX 6650', 'RX 6700', 'RX 6750', 'RX 6800', 'RX 6900', 'RX 7600', 'RX 7700', 'RX 7800', 'RX 7900'],
    brands: ['ASUS', 'MSI', 'Gigabyte', 'EVGA', 'Zotac', 'Palit'],
    series: ['GAMING', 'VENTUS', 'EAGLE', 'WINDFORCE', 'ROG STRIX', 'TUF']
  },
  ram: {
    brands: ['Corsair', 'Kingston', 'G.Skill', 'Crucial', 'TeamGroup', 'Adata'],
    series: ['Vengeance', 'Fury', 'Trident', 'Ripjaws', 'Elite', 'Delta'],
    capacities: [8, 16, 32, 64],
    speeds: [2666, 3000, 3200, 3600, 4800, 5200, 6000]
  },
  storage: {
    brands: ['Samsung', 'WD', 'Crucial', 'Kingston', 'Seagate', 'Adata'],
    types: ['NVMe SSD', 'SATA SSD', 'HDD'],
    series: ['980 PRO', '990 PRO', 'Blue', 'Black', 'Red', 'P5', 'A400'],
    capacities: [256, 512, 1000, 2000, 4000]
  },
  psu: {
    brands: ['Corsair', 'EVGA', 'Cooler Master', 'Thermaltake', 'Seasonic', 'Be Quiet'],
    wattages: [450, 550, 650, 750, 850, 1000, 1200],
    certs: ['80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum', '80+ Titanium']
  },
  case: {
    brands: ['NZXT', 'Corsair', 'Cooler Master', 'Fractal Design', 'Lian Li', 'Thermaltake'],
    series: ['H510', 'H710', '4000D', '5000D', 'MasterBox', 'TD500', 'O11 Dynamic'],
    colors: ['Black', 'White', 'RGB']
  },
  cooler: {
    brands: ['Noctua', 'Cooler Master', 'NZXT', 'Corsair', 'Be Quiet', 'Deepcool'],
    types: ['Air', 'AIO 240mm', 'AIO 280mm', 'AIO 360mm'],
    series: ['NH-D15', 'Hyper 212', 'Kraken', 'iCUE', 'Dark Rock', 'AK620']
  }
};

// Random helper
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Generate product name
function generateProductName(category) {
  const templates = PRODUCT_NAMES[category];
  
  switch(category) {
    case 'cpu': {
      const brand = randomChoice(['Intel', 'AMD']);
      if (brand === 'Intel') {
        const series = randomChoice(templates.intel);
        const model = randomChoice(templates.models);
        const suffix = randomChoice(templates.suffixes);
        const gen = randomChoice(templates.generations);
        return `Intel ${series} ${model}${suffix} ${gen} Gen`;
      } else {
        const series = randomChoice(templates.amd);
        const model = randomChoice(templates.models);
        const suffix = randomChoice(templates.suffixes);
        return `AMD ${series} ${model}${suffix}`;
      }
    }
    
    case 'mainboard': {
      const brand = randomChoice(templates.brands);
      const chipset = randomChoice(templates.chipsets);
      const series = randomChoice(templates.series);
      return `${brand} ${chipset} ${series}`;
    }
    
    case 'gpu': {
      const vendor = randomChoice(['NVIDIA', 'AMD']);
      const chip = vendor === 'NVIDIA' 
        ? randomChoice(templates.nvidia)
        : randomChoice(templates.amd);
      const brand = randomChoice(templates.brands);
      const series = randomChoice(templates.series);
      return `${brand} ${chip} ${series}`;
    }
    
    case 'ram': {
      const brand = randomChoice(templates.brands);
      const series = randomChoice(templates.series);
      const capacity = randomChoice(templates.capacities);
      const speed = randomChoice(templates.speeds);
      return `${brand} ${series} ${capacity}GB DDR4 ${speed}MHz`;
    }
    
    case 'storage': {
      const brand = randomChoice(templates.brands);
      const type = randomChoice(templates.types);
      const capacity = randomChoice(templates.capacities);
      return `${brand} ${capacity}GB ${type}`;
    }
    
    case 'psu': {
      const brand = randomChoice(templates.brands);
      const wattage = randomChoice(templates.wattages);
      const cert = randomChoice(templates.certs);
      return `${brand} ${wattage}W ${cert}`;
    }
    
    case 'case': {
      const brand = randomChoice(templates.brands);
      const series = randomChoice(templates.series);
      const color = randomChoice(templates.colors);
      return `${brand} ${series} ${color}`;
    }
    
    case 'cooler': {
      const brand = randomChoice(templates.brands);
      const type = randomChoice(templates.types);
      return `${brand} ${type}`;
    }
    
    default:
      return 'Unknown Product';
  }
}

// Generate attributes based on category
function generateAttributes(category, productName) {
  const attrs = [];
  
  switch(category) {
    case 'cpu': {
      const isIntel = productName.includes('Intel');
      const isHighEnd = productName.includes('i9') || productName.includes('Ryzen 9');
      
      attrs.push(
        { key: 'CPU_BRAND', stringValue: isIntel ? 'Intel' : 'AMD' },
        { key: 'CPU_SOCKET', stringValue: isIntel ? randomChoice(['LGA1700', 'LGA1851']) : randomChoice(['AM4', 'AM5']) },
        { key: 'CPU_CORES', numberValue: isHighEnd ? randomInt(16, 24) : randomInt(6, 12) },
        { key: 'CPU_THREADS', numberValue: isHighEnd ? randomInt(24, 32) : randomInt(12, 20) },
        { key: 'CPU_BASE_CLOCK_GHZ', numberValue: randomFloat(3.0, 4.0) },
        { key: 'CPU_BOOST_CLOCK_GHZ', numberValue: randomFloat(4.5, 5.8) },
        { key: 'CPU_CACHE_MB', numberValue: isHighEnd ? randomInt(30, 40) : randomInt(12, 24) },
        { key: 'CPU_TDP_WATT', numberValue: isHighEnd ? randomChoice([125, 150, 170]) : randomChoice([65, 95, 105]) },
        { key: 'CPU_MAX_MEMORY_SPEED_MHZ', numberValue: randomChoice([3200, 4800, 5200, 5600]) }
      );
      
      if (randomInt(1, 100) < 60) {
        attrs.push({ key: 'CPU_INTEGRATED_GPU', stringValue: isIntel ? 'UHD Graphics 770' : 'Radeon Graphics' });
      }
      break;
    }
    
    case 'mainboard': {
      const isIntel = productName.includes('B760') || productName.includes('Z690') || productName.includes('Z790') || productName.includes('B860');
      const isHighEnd = productName.includes('X') || productName.includes('Z');
      
      attrs.push(
        { key: 'MB_SOCKET', stringValue: isIntel ? randomChoice(['LGA1700', 'LGA1851']) : randomChoice(['AM4', 'AM5']) },
        { key: 'MB_CHIPSET', stringValue: productName.match(/[BXZ]\d+/)?.[0] || 'B550' },
        { key: 'MB_FORM_FACTOR', stringValue: randomChoice(['ATX', 'Micro-ATX', 'Mini-ITX']) },
        { key: 'MB_RAM_TYPE', stringValue: randomChoice(['DDR4', 'DDR5']) },
        { key: 'MB_RAM_SLOTS', numberValue: randomChoice([2, 4]) },
        { key: 'MB_MAX_RAM_GB', numberValue: randomChoice([64, 128, 192]) },
        { key: 'MB_MAX_RAM_SPEED_MHZ', numberValue: randomChoice([3200, 4800, 5600, 6400]) },
        { key: 'MB_PCIEX16_SLOTS', numberValue: isHighEnd ? randomInt(2, 3) : 1 },
        { key: 'MB_M2_SLOTS', numberValue: randomInt(2, 4) },
        { key: 'MB_SATA_PORTS', numberValue: randomInt(4, 6) }
      );
      
      if (isHighEnd) {
        attrs.push(
          { key: 'MB_WIFI', stringValue: randomChoice(['Wi-Fi 6', 'Wi-Fi 6E', 'Wi-Fi 7']) },
          { key: 'MB_BLUETOOTH', stringValue: '5.2' }
        );
      }
      break;
    }
    
    case 'gpu': {
      const isNvidia = productName.includes('RTX');
      const isHighEnd = productName.includes('4080') || productName.includes('4090') || productName.includes('7900');
      
      const vram = isHighEnd ? randomChoice([16, 24]) : randomChoice([6, 8, 12]);
      
      attrs.push(
        { key: 'GPU_CHIP', stringValue: productName.match(/(RTX|RX) \d+( Ti)?/)?.[0] || 'Unknown' },
        { key: 'GPU_VRAM_GB', numberValue: vram },
        { key: 'GPU_MEMORY_BUS', numberValue: isHighEnd ? randomChoice([256, 384, 512]) : randomChoice([128, 192, 256]) },
        { key: 'GPU_BOOST_CLOCK_MHZ', numberValue: randomInt(1600, 2500) },
        { key: 'GPU_INTERFACE', stringValue: 'PCIe 4.0 x16' },
        { key: 'GPU_LENGTH_MM', numberValue: isHighEnd ? randomInt(300, 340) : randomInt(220, 280) },
        { key: 'GPU_TDP_WATT', numberValue: isHighEnd ? randomInt(300, 450) : randomInt(150, 250) },
        { key: 'GPU_POWER_CONNECTOR', stringValue: isHighEnd ? '3×8-pin' : randomChoice(['1×8-pin', '2×8-pin']) },
        { key: 'GPU_PCIE_GEN', stringValue: 'PCIe 4.0' }
      );
      break;
    }
    
    case 'ram': {
      const capacityMatch = productName.match(/(\d+)GB/);
      const speedMatch = productName.match(/(\d+)MHz/);
      
      attrs.push(
        { key: 'RAM_TYPE', stringValue: productName.includes('DDR5') ? 'DDR5' : 'DDR4' },
        { key: 'RAM_CAPACITY_GB', numberValue: capacityMatch ? parseInt(capacityMatch[1]) : 16 },
        { key: 'RAM_SPEED_MHZ', numberValue: speedMatch ? parseInt(speedMatch[1]) : 3200 },
        { key: 'RAM_MODULES', numberValue: randomChoice([1, 2]) },
        { key: 'RAM_CL', numberValue: randomInt(14, 18) }
      );
      break;
    }
    
    case 'storage': {
      const capacityMatch = productName.match(/(\d+)GB/);
      const isNVMe = productName.includes('NVMe');
      
      attrs.push(
        { key: 'STORAGE_TYPE', stringValue: productName.includes('HDD') ? 'HDD' : 'SSD' },
        { key: 'STORAGE_INTERFACE', stringValue: isNVMe ? 'NVMe PCIe 4.0' : productName.includes('HDD') ? 'SATA 3.0' : 'SATA 3.0' },
        { key: 'STORAGE_CAPACITY_GB', numberValue: capacityMatch ? parseInt(capacityMatch[1]) : 1000 },
        { key: 'STORAGE_FORM_FACTOR', stringValue: isNVMe ? 'M.2 2280' : productName.includes('HDD') ? '3.5"' : '2.5"' }
      );
      
      if (!productName.includes('HDD')) {
        attrs.push(
          { key: 'STORAGE_READ_SPEED_MBPS', numberValue: isNVMe ? randomInt(5000, 7000) : randomInt(500, 560) },
          { key: 'STORAGE_WRITE_SPEED_MBPS', numberValue: isNVMe ? randomInt(4000, 5000) : randomInt(450, 520) }
        );
      }
      break;
    }
    
    case 'psu': {
      const wattageMatch = productName.match(/(\d+)W/);
      
      attrs.push(
        { key: 'PSU_WATTAGE', numberValue: wattageMatch ? parseInt(wattageMatch[1]) : 650 },
        { key: 'PSU_CERT', stringValue: productName.match(/80\+ \w+/)?.[0] || '80+ Bronze' },
        { key: 'PSU_FORM_FACTOR', stringValue: 'ATX' },
        { key: 'PSU_MODULAR', stringValue: randomChoice(['Full Modular', 'Semi Modular', 'Non Modular']) },
        { key: 'PSU_PCIE_CONNECTORS', stringValue: randomChoice(['2×8-pin', '3×8-pin', '4×8-pin']) },
        { key: 'PSU_EPS_CONNECTORS', stringValue: randomChoice(['1×8-pin', '2×8-pin']) },
        { key: 'PSU_SATA_CONNECTORS', numberValue: randomInt(4, 8) }
      );
      break;
    }
    
    case 'case': {
      attrs.push(
        { key: 'CASE_FORM_FACTOR', stringValue: randomChoice(['ATX', 'Micro-ATX', 'Mini-ITX']) },
        { key: 'CASE_GPU_CLEARANCE_MM', numberValue: randomInt(300, 400) },
        { key: 'CASE_CPU_COOLER_CLEARANCE_MM', numberValue: randomInt(160, 180) },
        { key: 'CASE_MAX_PSU_LENGTH_MM', numberValue: randomInt(180, 220) },
        { key: 'CASE_DRIVE_BAYS_25', numberValue: randomInt(2, 4) },
        { key: 'CASE_DRIVE_BAYS_35', numberValue: randomInt(1, 3) },
        { key: 'CASE_EXPANSION_SLOTS', numberValue: randomInt(6, 8) },
        { key: 'CASE_FRONT_IO', stringValue: 'USB 3.2, USB-C, Audio' },
        { key: 'CASE_TEMPERED_GLASS', stringValue: randomChoice(['Yes', 'No']) }
      );
      break;
    }
    
    case 'cooler': {
      const isAIO = productName.includes('AIO');
      
      attrs.push(
        { key: 'COOLER_TYPE', stringValue: isAIO ? productName.match(/AIO \d+mm/)?.[0] || 'AIO 240mm' : 'Air' },
        { key: 'COOLER_TDP_WATT', numberValue: isAIO ? randomInt(200, 280) : randomInt(150, 220) },
        { key: 'COOLER_MAX_HEIGHT_MM', numberValue: isAIO ? randomInt(120, 160) : randomInt(155, 170) },
        { key: 'COOLER_SOCKET_COMPAT', stringValue: 'LGA1700, LGA1851, AM4, AM5' }
      );
      break;
    }
  }
  
  return attrs;
}

// Generate price based on category and attributes
function generatePrice(category, attrs) {
  const basePrice = {
    cpu: { min: 2000000, max: 15000000 },
    mainboard: { min: 2500000, max: 12000000 },
    gpu: { min: 5000000, max: 15000000 }, // Reduced from 35M to avoid overflow
    ram: { min: 800000, max: 5000000 },
    storage: { min: 1000000, max: 8000000 },
    psu: { min: 1200000, max: 6000000 },
    case: { min: 800000, max: 4000000 },
    cooler: { min: 600000, max: 4000000 }
  };
  
  const range = basePrice[category];
  let price = randomInt(range.min, range.max);
  
  // Adjust based on attributes (high-end = higher price)
  // Max safe: 15M × 1.4 = 21M < 21.4M limit
  if (category === 'cpu') {
    const cores = attrs.find(a => a.key === 'CPU_CORES')?.numberValue || 0;
    if (cores > 16) price *= 1.3; // 15M × 1.3 = 19.5M (safe)
  }
  if (category === 'gpu') {
    const vram = attrs.find(a => a.key === 'GPU_VRAM_GB')?.numberValue || 0;
    if (vram >= 16) price *= 1.4; // 15M × 1.4 = 21M (safe)
  }
  
  // Round to nearest 10000 VND, then convert to cents
  price = Math.round(price / 10000) * 10000;
  return Math.round(price * 100); // Convert VND to cents
}

// Generate product description
function generateDescription(category, productName) {
  const descriptions = {
    cpu: `${productName} - Vi xử lý hiệu năng cao với công nghệ tiên tiến, tối ưu cho gaming và công việc đa nhiệm. Hỗ trợ công nghệ ép xung, tiết kiệm điện năng.`,
    mainboard: `${productName} - Bo mạch chủ chất lượng cao với thiết kế bền bỉ, hỗ trợ đầy đủ các tính năng mở rộng. Trang bị tản nhiệt tốt, khe M.2, cổng USB hiện đại.`,
    gpu: `${productName} - Card đồ họa mạnh mẽ cho gaming 4K mượt mà và render chuyên nghiệp. Trang bị tản nhiệt hiệu quả, RGB đẹp mắt.`,
    ram: `${productName} - Bộ nhớ RAM tốc độ cao, ổn định, tối ưu cho gaming và làm việc. Hỗ trợ XMP/DOCP, tản nhiệt đẹp mắt.`,
    storage: `${productName} - Ổ cứng tốc độ cao, độ tin cậy tốt. Lý tưởng cho lưu trữ game, phần mềm và dữ liệu quan trọng.`,
    psu: `${productName} - Nguồn máy tính ổn định, hiệu suất cao. Bảo vệ toàn diện cho linh kiện, hoạt động êm ái.`,
    case: `${productName} - Vỏ case thiết kế đẹp mắt, thoáng khí tốt. Dễ dàng lắp ráp, hỗ trợ nhiều kích thước linh kiện.`,
    cooler: `${productName} - Tản nhiệt hiệu quả, hoạt động êm ái. Giữ nhiệt độ CPU ổn định ngay cả khi ép xung.`
  };
  
  return descriptions[category] || '';
}

// Main generate function
async function generateProducts(categorySlug, count) {
  console.log(`\n🔵 Generating ${count} products for: ${categorySlug.toUpperCase()}`);
  
  const category = await prisma.category.findFirst({
    where: { slug: categorySlug }
  });
  
  if (!category) {
    console.error(`❌ Category not found: ${categorySlug}`);
    return 0;
  }
  
  let created = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      const name = generateProductName(categorySlug);
      const attrs = generateAttributes(categorySlug, name);
      const price = generatePrice(categorySlug, attrs);
      const description = generateDescription(categorySlug, name);
      
      // Generate unique slug
      let slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      slug = `${slug}-${crypto.randomBytes(4).toString('hex')}`;
      
      // Brand from name
      const brand = name.split(' ')[0];
      
      // Create product
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          priceCents: price, // price đã tính sẵn cents rồi
          stock: randomInt(50, 200),
          categoryId: category.id,
          featured: randomInt(1, 100) <= 10, // 10% featured
          status: 'PUBLISHED',
          brand,
          manufacturer: brand,
          warranty: randomChoice(['12 tháng', '24 tháng', '36 tháng'])
        }
      });
      
      // Create attributes
      for (const attr of attrs) {
        const attrType = await prisma.attributeType.findUnique({
          where: { key: attr.key }
        });
        
        if (attrType) {
          await prisma.productAttribute.create({
            data: {
              productId: product.id,
              attributeTypeId: attrType.id,
              stringValue: attr.stringValue || null,
              numberValue: attr.numberValue || null
            }
          });
        }
      }
      
      created++;
      
      if ((i + 1) % 10 === 0) {
        console.log(`  ✅ Created ${i + 1}/${count} products`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating product ${i + 1}:`, error.message);
    }
  }
  
  console.log(`✅ Completed: ${created}/${count} products created\n`);
  return created;
}

// Main function
async function main() {
  console.log('🚀 Starting product generation...\n');
  console.log('📊 Target: 150 products × 8 categories = 1200 products\n');
  
  const categories = ['cpu', 'mainboard', 'gpu', 'ram', 'storage', 'psu', 'case', 'cooler'];
  const productsPerCategory = 150;
  
  const summary = {
    totalCreated: 0,
    byCategory: []
  };
  
  for (const category of categories) {
    const created = await generateProducts(category, productsPerCategory);
    summary.totalCreated += created;
    summary.byCategory.push({ category, created });
  }
  
  console.log('\n✅ GENERATION COMPLETE!\n');
  console.log('📊 Summary:');
  summary.byCategory.forEach(({ category, created }) => {
    console.log(`   ${category}: ${created} products`);
  });
  console.log(`\n📦 Total: ${summary.totalCreated} products created`);
}

main()
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
