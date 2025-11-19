/* Demo product dataset seeding script.
 * Run: npm run seed:demo
 * Assumes categories & attribute types already seeded.
 */
const { PrismaClient, ProductStatus } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function uniqueSlug(base) {
  let s = slugify(base);
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug: s } })) {
    s = `${slugify(base)}-${i++}`;
  }
  return s;
}

const IMAGE_POOL = [
  '/images/products/product-1-sm-1.png',
  '/images/products/product-2-sm-1.png',
  '/images/products/product-3-sm-1.png',
  '/images/products/product-4-sm-1.png',
  '/images/products/product-5-sm-1.png',
  '/images/products/product-6-sm-1.png',
  '/images/products/product-7-sm-1.png',
  '/images/products/product-8-sm-1.png'
];

// Value sets for STRING attributes keyed by attribute key
const STRING_SETS = {
  CPU_BRAND: ['Intel', 'AMD'],
  CPU_SOCKET: ['LGA1700', 'AM5', 'AM4'],
  CPU_INTEGRATED_GPU: ['Intel UHD', 'Radeon Graphics', 'None'],
  MB_SOCKET: ['LGA1700', 'AM5', 'AM4'],
  MB_CHIPSET: ['Z790', 'B650', 'X670', 'B760'],
  MB_FORM_FACTOR: ['ATX', 'Micro-ATX', 'Mini-ITX'],
  MB_RAM_TYPE: ['DDR5', 'DDR4'],
  MB_WIFI: ['Wi-Fi 6E', 'Wi-Fi 6', 'Không'],
  MB_BLUETOOTH: ['5.3', '5.2', 'Không'],
  GPU_CHIP: ['RTX 4060', 'RTX 4070', 'RX 7600', 'RX 7800 XT'],
  GPU_INTERFACE: ['PCIe 4.0', 'PCIe 3.0'],
  GPU_POWER_CONNECTOR: ['8-pin', '2x8-pin', '16-pin'],
  GPU_PCIE_GEN: ['4.0', '3.0'],
  RAM_TYPE: ['DDR5', 'DDR4'],
  PSU_CERT: ['80+ Gold', '80+ Bronze', '80+ Platinum'],
  PSU_FORM_FACTOR: ['ATX', 'SFX'],
  CASE_FORM_FACTOR: ['ATX', 'Micro-ATX', 'Mini-ITX'],
  STORAGE_TYPE: ['SSD', 'NVMe', 'HDD'],
  STORAGE_INTERFACE: ['SATA', 'PCIe 4.0', 'PCIe 3.0'],
  STORAGE_FORM_FACTOR: ['2.5"', 'M.2', '3.5"'],
  COOLER_TYPE: ['Air', 'AIO 240', 'AIO 360'],
  COOLER_SOCKET_COMPAT: ['LGA1700', 'AM5', 'Universal']
};

// Numeric ranges for NUMBER attributes keyed by attribute key
const NUMERIC_RANGES = {
  CPU_CORES: [4, 32],
  CPU_THREADS: [8, 64],
  CPU_BASE_CLOCK_GHZ: [2.5, 4.2],
  CPU_BOOST_CLOCK_GHZ: [4.0, 5.8],
  CPU_TDP_WATT: [35, 170],
  CPU_MAX_MEMORY_SPEED_MHZ: [4800, 8000],
  MB_RAM_SLOTS: [2, 8],
  MB_MAX_RAM_GB: [32, 256],
  MB_MAX_RAM_SPEED_MHZ: [4800, 8000],
  MB_PCIEX16_SLOTS: [1, 4],
  MB_M2_SLOTS: [1, 5],
  MB_SATA_PORTS: [2, 10],
  GPU_VRAM_GB: [8, 24],
  GPU_LENGTH_MM: [200, 360],
  GPU_TDP_WATT: [120, 450],
  RAM_CAPACITY_GB: [8, 64],
  RAM_SPEED_MHZ: [3000, 8000],
  RAM_MODULES: [1, 4],
  RAM_CL: [14, 40],
  PSU_WATTAGE: [450, 1200],
  CASE_GPU_CLEARANCE_MM: [280, 400],
  CASE_CPU_COOLER_CLEARANCE_MM: [140, 190],
  STORAGE_CAPACITY_GB: [256, 8000],
  COOLER_TDP_WATT: [150, 350],
  COOLER_MAX_HEIGHT_MM: [120, 180]
};

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  const categories = await prisma.category.findMany();
  if (!categories.length) {
    console.error('No categories found. Seed categories first.');
    process.exit(1);
  }
  const attrTypes = await prisma.attributeType.findMany();
  const attrTypeByKey = Object.fromEntries(attrTypes.map(a => [a.key, a]));

  let createdCount = 0;

  for (const category of categories) {
    const productTarget = randInt(6, 12); // number of products per category
    for (let i = 0; i < productTarget; i++) {
      const baseName = buildName(category.slug);
      const slug = await uniqueSlug(baseName);
      const priceCents = randInt(100_00, 5_000_00); // 100.00 - 5000.00
      const stock = randInt(0, 120);
      const status = Math.random() < 0.7 ? ProductStatus.PUBLISHED : ProductStatus.DRAFT;
      const featured = status === ProductStatus.PUBLISHED && Math.random() < 0.2;
      const imageUrl = pick(IMAGE_POOL);

      // Build attributes list based on attribute types relevant to category (by template key prefix grouping in mapping below)
      const attributeEntries = buildAttributesForCategory(category.slug, attrTypeByKey);

      const description = `Sản phẩm ${category.slug} hiệu năng cao dành cho người dùng yêu cầu ổn định.`;

      await prisma.product.create({
        data: {
          name: baseName,
          slug,
          description,
          priceCents,
          stock,
          imageUrl,
          featured,
          status,
          categoryId: category.id,
          attributes: {
            create: attributeEntries.map(a => ({
              attributeTypeId: a.attributeTypeId,
              stringValue: a.stringValue,
              numberValue: a.numberValue
            }))
          }
        }
      });
      createdCount++;
    }
  }
  console.log(`Seeded demo products: ${createdCount}`);
}

function buildName(slug) {
  switch (slug) {
    case 'cpu': return `${pick(['Intel', 'AMD'])} ${pick(['Core i5', 'Core i7', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9'])} ${randInt(1000, 9999)}`;
    case 'gpu': return `${pick(['NVIDIA', 'AMD'])} ${pick(['RTX 4060', 'RTX 4070', 'RX 7600', 'RX 7800'])}`;
    case 'mainboard': return `${pick(['ASUS', 'MSI', 'GIGABYTE'])} ${pick(['Z790', 'B650', 'X670', 'B760'])}`;
    case 'ram': return `${pick(['Corsair', 'G.Skill', 'Kingston'])} ${pick(['DDR5', 'DDR4'])} ${randInt(16, 64)}GB`;
    case 'psu': return `${pick(['Corsair', 'Seasonic', 'Cooler Master'])} ${randInt(550, 1000)}W`;
    case 'case': return `${pick(['LianLi', 'NZXT', 'Corsair'])} ${pick(['ATX', 'Micro-ATX', 'Mini-ITX'])} Case`;
    case 'storage': return `${pick(['Samsung', 'WD', 'Seagate'])} ${pick(['NVMe', 'SSD', 'HDD'])} ${randInt(256, 4000)}GB`;
    case 'cooler': return `${pick(['Noctua', 'Deepcool', 'NZXT'])} ${pick(['Air', 'AIO 240', 'AIO 360'])}`;
    default: return `${slug} Product ${randInt(1, 999)}`;
  }
}

function buildAttributesForCategory(slug, attrTypeByKey) {
  // Map category slug to attribute keys (subset) if needed; else create all known for that category prefix groups.
  const categoryAttributeKeyPrefixes = {
    cpu: 'CPU_',
    mainboard: 'MB_',
    gpu: 'GPU_',
    ram: 'RAM_',
    psu: 'PSU_',
    case: 'CASE_',
    storage: 'STORAGE_',
    cooler: 'COOLER_'
  };
  const prefix = categoryAttributeKeyPrefixes[slug];
  const keys = Object.keys(attrTypeByKey).filter(k => prefix && k.startsWith(prefix));
  return keys.map(key => {
    const attrType = attrTypeByKey[key];
    if (!attrType) return null;
    if (attrType.valueType === 'STRING') {
      const set = STRING_SETS[key] || ['N/A'];
      return { attributeTypeId: attrType.id, stringValue: pick(set), numberValue: null };
    } else {
      const range = NUMERIC_RANGES[key] || [1, 100];
      const val = range[1] - range[0] > 20 ? randFloat(range[0], range[1]) : randInt(range[0], range[1]);
      return { attributeTypeId: attrType.id, stringValue: null, numberValue: val };
    }
  }).filter(Boolean);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
