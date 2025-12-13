// Seed sample CompatibilityRule records for PC builder suggestions
// Run: node prisma/seed-compat.cjs

const { PrismaClient, Operator } = require("@prisma/client");
const prisma = new PrismaClient();

async function getCategoryId(slug) {
  const c = await prisma.category.findUnique({ where: { slug } });
  if (!c) throw new Error(`Category not found: ${slug}`);
  return c.id;
}

async function getAttrTypeId(key) {
  const a = await prisma.attributeType.findUnique({ where: { key } });
  if (!a) throw new Error(`AttributeType not found: ${key}`);
  return a.id;
}

async function upsertRule(rule) {
  // No unique constraint, so try to find by essential fields to avoid duplicates
  const existing = await prisma.compatibilityRule.findFirst({
    where: {
      leftCategoryId: rule.leftCategoryId ?? null,
      rightCategoryId: rule.rightCategoryId ?? null,
      leftAttributeTypeId: rule.leftAttributeTypeId,
      rightAttributeTypeId: rule.rightAttributeTypeId ?? null,
      operator: rule.operator,
    },
  });
  if (existing) {
    return prisma.compatibilityRule.update({ where: { id: existing.id }, data: rule });
  }
  return prisma.compatibilityRule.create({ data: rule });
}

async function main() {
    console.log('🔄 Starting compatibility rules seeding...\n');

    console.log('📦 Fetching category IDs...');
    const cpuCat = await getCategoryId("cpu");
    const mbCat = await getCategoryId("mainboard");
    const gpuCat = await getCategoryId("gpu");
    const caseCat = await getCategoryId("case");
    const psuCat = await getCategoryId("psu");
    const ramCat = await getCategoryId("ram");
    const coolerCat = await getCategoryId("cooler");
    const storageCat = await getCategoryId("storage");
    console.log('✅ Categories loaded\n');

    console.log('🔍 Fetching attribute type IDs...');
    // Attribute Type IDs - Core attributes
    const CPU_SOCKET = await getAttrTypeId("CPU_SOCKET");
    const CPU_TDP_WATT = await getAttrTypeId("CPU_TDP_WATT");
    
    const MB_SOCKET = await getAttrTypeId("MB_SOCKET");
    const MB_CHIPSET = await getAttrTypeId("MB_CHIPSET");
    const MB_FORM_FACTOR = await getAttrTypeId("MB_FORM_FACTOR");
    const MB_RAM_TYPE = await getAttrTypeId("MB_RAM_TYPE");
    const MB_RAM_SLOTS = await getAttrTypeId("MB_RAM_SLOTS");
    const MB_MAX_RAM_GB = await getAttrTypeId("MB_MAX_RAM_GB");
    const MB_MAX_RAM_SPEED_MHZ = await getAttrTypeId("MB_MAX_RAM_SPEED_MHZ");
    const MB_M2_SLOTS = await getAttrTypeId("MB_M2_SLOTS");
    const MB_SATA_PORTS = await getAttrTypeId("MB_SATA_PORTS");
    
    const GPU_LENGTH_MM = await getAttrTypeId("GPU_LENGTH_MM");
    const GPU_TDP_WATT = await getAttrTypeId("GPU_TDP_WATT");
    const GPU_POWER_CONNECTOR = await getAttrTypeId("GPU_POWER_CONNECTOR");
    const GPU_PCIE_GEN = await getAttrTypeId("GPU_PCIE_GEN");
    
    const RAM_TYPE = await getAttrTypeId("RAM_TYPE");
    const RAM_MODULES = await getAttrTypeId("RAM_MODULES");
    const RAM_CAPACITY_GB = await getAttrTypeId("RAM_CAPACITY_GB");
    const RAM_SPEED_MHZ = await getAttrTypeId("RAM_SPEED_MHZ");
    
    const STORAGE_TYPE = await getAttrTypeId("STORAGE_TYPE");
    const STORAGE_INTERFACE = await getAttrTypeId("STORAGE_INTERFACE");
    const STORAGE_FORM_FACTOR = await getAttrTypeId("STORAGE_FORM_FACTOR");
    
    const PSU_WATTAGE = await getAttrTypeId("PSU_WATTAGE");
    const PSU_FORM_FACTOR = await getAttrTypeId("PSU_FORM_FACTOR");
    const PSU_PCIE_CONNECTORS = await getAttrTypeId("PSU_PCIE_CONNECTORS");
    
    const CASE_FORM_FACTOR = await getAttrTypeId("CASE_FORM_FACTOR");
    const CASE_GPU_CLEARANCE_MM = await getAttrTypeId("CASE_GPU_CLEARANCE_MM");
    const CASE_CPU_COOLER_CLEARANCE_MM = await getAttrTypeId("CASE_CPU_COOLER_CLEARANCE_MM");
    
    const COOLER_MAX_HEIGHT_MM = await getAttrTypeId("COOLER_MAX_HEIGHT_MM");
    const COOLER_SOCKET_COMPAT = await getAttrTypeId("COOLER_SOCKET_COMPAT");
    const COOLER_TDP_WATT = await getAttrTypeId("COOLER_TDP_WATT");
    console.log('✅ Attribute types loaded\n');

    console.log('🔧 Creating compatibility rules...\n');

    // ==========================================
    // 1. CPU ↔ MAINBOARD COMPATIBILITY
    // ==========================================
    console.log('  📌 CPU ↔ Mainboard rules...');
    
    // 1a) CPU Socket must match Mainboard Socket
    await upsertRule({
      leftCategoryId: cpuCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: CPU_SOCKET,
      rightAttributeTypeId: MB_SOCKET,
      operator: Operator.EQ,
      note: "Socket CPU phải khớp với socket Mainboard (LGA1700, AM5, AM4, etc.)"
    });

    // ==========================================
    // 2. COOLER ↔ CPU & CASE COMPATIBILITY
    // ==========================================
    console.log('  📌 Cooler ↔ CPU & Case rules...');
    
    // 2a) Cooler Socket must support CPU Socket
    await upsertRule({
      leftCategoryId: coolerCat,
      rightCategoryId: cpuCat,
      leftAttributeTypeId: COOLER_SOCKET_COMPAT,
      rightAttributeTypeId: CPU_SOCKET,
      operator: Operator.EQ,
      note: "Socket tản nhiệt phải hỗ trợ socket CPU (có thể có nhiều socket: LGA1700/AM5/AM4)"
    });

    // 2b) Cooler TDP rating should >= CPU TDP (recommendation)
    await upsertRule({
      leftCategoryId: cpuCat,
      rightCategoryId: coolerCat,
      leftAttributeTypeId: CPU_TDP_WATT,
      rightAttributeTypeId: COOLER_TDP_WATT,
      operator: Operator.LTE,
      note: "TDP của CPU không nên vượt quá công suất tản nhiệt của cooler"
    });

    // 2c) Cooler Height must <= Case CPU Cooler Clearance
    await upsertRule({
      leftCategoryId: coolerCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: COOLER_MAX_HEIGHT_MM,
      rightAttributeTypeId: CASE_CPU_COOLER_CLEARANCE_MM,
      operator: Operator.LTE,
      note: "Chiều cao tản nhiệt không được vượt quá khoảng trống của case"
    });

    // ==========================================
    // 3. RAM ↔ MAINBOARD COMPATIBILITY
    // ==========================================
    console.log('  📌 RAM ↔ Mainboard rules...');
    
    // 3a) RAM Type must match Mainboard RAM Type (DDR4/DDR5)
    await upsertRule({
      leftCategoryId: ramCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: RAM_TYPE,
      rightAttributeTypeId: MB_RAM_TYPE,
      operator: Operator.EQ,
      note: "Loại RAM phải khớp với mainboard (DDR4 hoặc DDR5)"
    });

    // 3b) Total RAM modules <= Mainboard RAM slots (sum-based check)
    await upsertRule({
      leftCategoryId: ramCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: RAM_MODULES,
      rightAttributeTypeId: MB_RAM_SLOTS,
      operator: Operator.LTE,
      note: "Tổng số thanh RAM không vượt quá số khe RAM trên mainboard"
    });

    // 3c) Total RAM capacity <= Mainboard max RAM (sum-based check)
    await upsertRule({
      leftCategoryId: ramCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: RAM_CAPACITY_GB,
      rightAttributeTypeId: MB_MAX_RAM_GB,
      operator: Operator.LTE,
      note: "Tổng dung lượng RAM không vượt quá mức mainboard hỗ trợ"
    });

    // 3d) RAM Speed should <= Mainboard max RAM speed
    await upsertRule({
      leftCategoryId: ramCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: RAM_SPEED_MHZ,
      rightAttributeTypeId: MB_MAX_RAM_SPEED_MHZ,
      operator: Operator.LTE,
      note: "Tốc độ RAM không nên vượt quá mức mainboard hỗ trợ (sẽ chạy ở tốc độ thấp hơn)"
    });

    // ==========================================
    // 4. GPU ↔ CASE & PSU COMPATIBILITY
    // ==========================================
    console.log('  📌 GPU ↔ Case & PSU rules...');
    
    // 4a) GPU Length must <= Case GPU Clearance
    await upsertRule({
      leftCategoryId: gpuCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: GPU_LENGTH_MM,
      rightAttributeTypeId: CASE_GPU_CLEARANCE_MM,
      operator: Operator.LTE,
      note: "Chiều dài GPU không được vượt quá không gian trong case"
    });

    // 4b) GPU TDP should be considered for PSU wattage (handled in total power calc)
    await upsertRule({
      leftCategoryId: gpuCat,
      rightCategoryId: psuCat,
      leftAttributeTypeId: GPU_TDP_WATT,
      rightAttributeTypeId: PSU_WATTAGE,
      operator: Operator.LTE,
      note: "TDP GPU không nên vượt quá công suất PSU (cần xét tổng với CPU)"
    });

    // ==========================================
    // 5. PSU ↔ CASE & POWER REQUIREMENTS
    // ==========================================
    console.log('  📌 PSU ↔ Case & Power rules...');
    
    // 5a) PSU Form Factor should match Case (most cases support ATX)
    // Note: ATX PSU fits in most ATX cases, but SFX needs SFX case
    await upsertRule({
      leftCategoryId: psuCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: PSU_FORM_FACTOR,
      rightAttributeTypeId: CASE_FORM_FACTOR,
      operator: Operator.EQ,
      note: "Form factor PSU nên khớp với case (ATX, Micro-ATX, Mini-ITX)"
    });

    // 5b) CPU TDP should be within PSU capacity
    await upsertRule({
      leftCategoryId: cpuCat,
      rightCategoryId: psuCat,
      leftAttributeTypeId: CPU_TDP_WATT,
      rightAttributeTypeId: PSU_WATTAGE,
      operator: Operator.LTE,
      note: "TDP CPU phải trong khả năng cấp nguồn của PSU"
    });

    // ==========================================
    // 6. STORAGE ↔ MAINBOARD & CASE
    // ==========================================
    console.log('  📌 Storage ↔ Mainboard & Case rules...');
    
    // Note: Storage interface checks are complex - need custom logic
    // NVMe requires M.2 slots (MB_M2_SLOTS > 0)
    // SATA requires SATA ports (MB_SATA_PORTS > 0)
    // For now, we create rules that backend can interpret

    // ==========================================
    // 7. MAINBOARD ↔ CASE COMPATIBILITY
    // ==========================================
    console.log('  📌 Mainboard ↔ Case rules...');
    
    // 7a) Mainboard Form Factor must fit Case Form Factor
    await upsertRule({
      leftCategoryId: mbCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: MB_FORM_FACTOR,
      rightAttributeTypeId: CASE_FORM_FACTOR,
      operator: Operator.EQ,
      note: "Form factor mainboard phải vừa với case (ATX, Micro-ATX, Mini-ITX)"
    });

    console.log('\n✅ All compatibility rules created!\n');
}

main()
  .then(async () => {
    console.log("Seeded compatibility rules.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
