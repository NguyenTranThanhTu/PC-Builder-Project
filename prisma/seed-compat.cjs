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
    // Seed các AttributeType còn thiếu nếu chưa có
    async function ensureAttrType({ key, label, valueType = "STRING" }) {
      const exists = await prisma.attributeType.findUnique({ where: { key } });
      if (!exists) {
        await prisma.attributeType.create({ data: { key, label, valueType } });
      }
    }

    await ensureAttrType({ key: "CPU_CHIPSET_SUPPORT", label: "Chipset CPU hỗ trợ", valueType: "STRING" });
    await ensureAttrType({ key: "MB_CHIPSET", label: "Chipset Mainboard", valueType: "STRING" });
    await ensureAttrType({ key: "GPU_POWER_CONNECTOR", label: "Đầu nguồn phụ GPU", valueType: "STRING" });
    await ensureAttrType({ key: "PSU_POWER_CONNECTOR", label: "Đầu nguồn phụ PSU", valueType: "STRING" });

    // Category IDs
    const cpuCat = await getCategoryId("cpu");
    const mbCat = await getCategoryId("mainboard");
    const gpuCat = await getCategoryId("gpu");
    const caseCat = await getCategoryId("case");
    const psuCat = await getCategoryId("psu");
    const ramCat = await getCategoryId("ram");
    const coolerCat = await getCategoryId("cooler");
    const storageCat = await getCategoryId("storage");

    // Attribute Type IDs
    const MB_FORM_FACTOR = await getAttrTypeId("MB_FORM_FACTOR");
    const CASE_FORM_FACTOR = await getAttrTypeId("CASE_FORM_FACTOR");
    const PSU_FORM_FACTOR = await getAttrTypeId("PSU_FORM_FACTOR");
    const MB_RAM_SLOTS = await getAttrTypeId("MB_RAM_SLOTS");
    const RAM_MODULES = await getAttrTypeId("RAM_MODULES");
    const MB_MAX_RAM_GB = await getAttrTypeId("MB_MAX_RAM_GB");
    const RAM_CAPACITY_GB = await getAttrTypeId("RAM_CAPACITY_GB");
    const STORAGE_INTERFACE = await getAttrTypeId("STORAGE_INTERFACE");
    const MB_SATA_PORTS = await getAttrTypeId("MB_SATA_PORTS");
    const MB_M2_SLOTS = await getAttrTypeId("MB_M2_SLOTS");
    const STORAGE_FORM_FACTOR = await getAttrTypeId("STORAGE_FORM_FACTOR");
    const MB_RAM_TYPE = await getAttrTypeId("MB_RAM_TYPE");

    // --- Mainboard ↔ Case: Form Factor ---
    await upsertRule({
      leftCategoryId: mbCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: MB_FORM_FACTOR,
      rightAttributeTypeId: CASE_FORM_FACTOR,
      operator: Operator.EQ,
      note: "Form factor mainboard phải vừa với case."
    });

    // --- PSU ↔ Case: Form Factor ---
    await upsertRule({
      leftCategoryId: psuCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: PSU_FORM_FACTOR,
      rightAttributeTypeId: CASE_FORM_FACTOR,
      operator: Operator.EQ,
      note: "Form factor PSU phải phù hợp với case."
    });

    // --- RAM ↔ Mainboard: Số khe RAM ---
    await upsertRule({
      leftCategoryId: ramCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: RAM_MODULES,
      rightAttributeTypeId: MB_RAM_SLOTS,
      operator: Operator.LTE,
      note: "Số lượng thanh RAM không vượt quá số khe RAM trên mainboard. (Cần cộng tổng số thanh RAM ở backend)"
    });

    // --- RAM Capacity ↔ Mainboard: Dung lượng tối đa ---
    await upsertRule({
      leftCategoryId: ramCat,
      rightCategoryId: mbCat,
      leftAttributeTypeId: RAM_CAPACITY_GB,
      rightAttributeTypeId: MB_MAX_RAM_GB,
      operator: Operator.LTE,
      note: "Tổng dung lượng RAM không vượt quá mức mainboard hỗ trợ. (Cần cộng tổng dung lượng RAM ở backend)"
    });
    const RAM_TYPE = await getAttrTypeId("RAM_TYPE");
    const MB_MAX_RAM_SPEED_MHZ = await getAttrTypeId("MB_MAX_RAM_SPEED_MHZ");
    const RAM_SPEED_MHZ = await getAttrTypeId("RAM_SPEED_MHZ");
    const CPU_SOCKET = await getAttrTypeId("CPU_SOCKET");
    const MB_SOCKET = await getAttrTypeId("MB_SOCKET");
    const GPU_LENGTH_MM = await getAttrTypeId("GPU_LENGTH_MM");
    const CASE_GPU_CLEARANCE_MM = await getAttrTypeId("CASE_GPU_CLEARANCE_MM");
    const PSU_WATTAGE = await getAttrTypeId("PSU_WATTAGE");
    const CPU_TDP_WATT = await getAttrTypeId("CPU_TDP_WATT");
    const GPU_TDP_WATT = await getAttrTypeId("GPU_TDP_WATT");
    const COOLER_MAX_HEIGHT_MM = await getAttrTypeId("COOLER_MAX_HEIGHT_MM");
    const CASE_CPU_COOLER_CLEARANCE_MM = await getAttrTypeId("CASE_CPU_COOLER_CLEARANCE_MM");
    const COOLER_SOCKET_COMPAT = await getAttrTypeId("COOLER_SOCKET_COMPAT");

    // --- Cooler Compatibility Rules ---
        // --- Storage Compatibility Rules ---
        // Rule: Storage interface must be supported by mainboard (SATA/NVMe)
        await upsertRule({
          leftCategoryId: storageCat,
          rightCategoryId: mbCat,
          leftAttributeTypeId: STORAGE_INTERFACE,
          rightAttributeTypeId: null,
          operator: Operator.EQ,
          compareString: "SATA",
          note: "Ổ lưu trữ SATA chỉ tương thích nếu mainboard có cổng SATA. (Cần kiểm tra MB_SATA_PORTS > 0 ở backend)"
        });
        await upsertRule({
          leftCategoryId: storageCat,
          rightCategoryId: mbCat,
          leftAttributeTypeId: STORAGE_INTERFACE,
          rightAttributeTypeId: null,
          operator: Operator.EQ,
          compareString: "NVMe",
          note: "Ổ lưu trữ NVMe chỉ tương thích nếu mainboard có khe M.2. (Cần kiểm tra MB_M2_SLOTS > 0 ở backend)"
        });
        // Rule: Storage form factor phải khớp với case
        await upsertRule({
          leftCategoryId: storageCat,
          rightCategoryId: caseCat,
          leftAttributeTypeId: STORAGE_FORM_FACTOR,
          rightAttributeTypeId: CASE_FORM_FACTOR,
          operator: Operator.EQ,
          note: "Kích cỡ ổ lưu trữ phải phù hợp với case."
        });
    // Rule: Cooler height must be <= Case CPU cooler clearance
    await upsertRule({
      leftCategoryId: coolerCat,
      rightCategoryId: caseCat,
      leftAttributeTypeId: COOLER_MAX_HEIGHT_MM,
      rightAttributeTypeId: CASE_CPU_COOLER_CLEARANCE_MM,
      operator: Operator.LTE,
      note: "Chiều cao tản nhiệt không vượt quá clearance của Case",
    });
    // Rule: Cooler socket must match CPU socket
    await upsertRule({
      leftCategoryId: coolerCat,
      rightCategoryId: cpuCat,
      leftAttributeTypeId: COOLER_SOCKET_COMPAT,
      rightAttributeTypeId: CPU_SOCKET,
      operator: Operator.EQ,
      note: "Socket tản nhiệt phải khớp với CPU",
    });

    // --- Other Compatibility Rules ---
  // Category IDs
  // RAM ↔ Mainboard compatibility rules
  await upsertRule({
    leftCategoryId: ramCat,
    rightCategoryId: mbCat,
    leftAttributeTypeId: RAM_TYPE,
    rightAttributeTypeId: MB_RAM_TYPE,
    operator: Operator.EQ,
    note: "Loại RAM phải khớp với Mainboard",
  });

  // 4b) RAM speed must be <= Mainboard max supported speed
  await upsertRule({
    leftCategoryId: ramCat,
    rightCategoryId: mbCat,
    leftAttributeTypeId: RAM_SPEED_MHZ,
    rightAttributeTypeId: MB_MAX_RAM_SPEED_MHZ,
    operator: Operator.LTE,
    note: "Tốc độ RAM không vượt quá mức Mainboard hỗ trợ",
  });

  // 1) CPU socket must equal Mainboard socket
  await upsertRule({
    leftCategoryId: cpuCat,
    rightCategoryId: mbCat,
    leftAttributeTypeId: CPU_SOCKET,
    rightAttributeTypeId: MB_SOCKET,
    operator: Operator.EQ,
    note: "CPU socket phải khớp socket Mainboard",
  });

  // 2) GPU length must be <= Case GPU clearance
  await upsertRule({
    leftCategoryId: gpuCat,
    rightCategoryId: caseCat,
    leftAttributeTypeId: GPU_LENGTH_MM,
    rightAttributeTypeId: CASE_GPU_CLEARANCE_MM,
    operator: Operator.LTE,
    note: "Chiều dài GPU không vượt quá không gian Case",
  });

  // 3a) PSU wattage >= CPU TDP
  await upsertRule({
    leftCategoryId: cpuCat,
    rightCategoryId: psuCat,
    leftAttributeTypeId: CPU_TDP_WATT,
    rightAttributeTypeId: PSU_WATTAGE,
    operator: Operator.LTE, // CPU TDP (left) <= PSU Wattage (right)
    note: "Công suất PSU phải >= TDP CPU",
  });

  // 3b) PSU wattage >= GPU TDP
  await upsertRule({
    leftCategoryId: gpuCat,
    rightCategoryId: psuCat,
    leftAttributeTypeId: GPU_TDP_WATT,
    rightAttributeTypeId: PSU_WATTAGE,
    operator: Operator.LTE, // GPU TDP (left) <= PSU Wattage (right)
    note: "Công suất PSU phải >= TDP GPU",
  });

    // --- BỔ SUNG RULE MAPPING ---
    // 4) Chipset mainboard phải hỗ trợ dòng CPU
    const MB_CHIPSET = await getAttrTypeId("MB_CHIPSET");
    const CPU_CHIPSET_SUPPORT = await getAttrTypeId("CPU_CHIPSET_SUPPORT");
    await upsertRule({
      leftCategoryId: mbCat,
      rightCategoryId: cpuCat,
      leftAttributeTypeId: MB_CHIPSET,
      rightAttributeTypeId: CPU_CHIPSET_SUPPORT,
      operator: Operator.EQ, // MB_CHIPSET phải nằm trong danh sách CPU hỗ trợ
      note: "Chipset mainboard phải nằm trong danh sách hỗ trợ của CPU",
    });

    // 5) PSU phải có đủ đầu cấp nguồn phụ cho GPU
    const PSU_POWER_CONNECTOR = await getAttrTypeId("PSU_POWER_CONNECTOR");
    const GPU_POWER_CONNECTOR = await getAttrTypeId("GPU_POWER_CONNECTOR");
    await upsertRule({
      leftCategoryId: psuCat,
      rightCategoryId: gpuCat,
      leftAttributeTypeId: PSU_POWER_CONNECTOR,
      rightAttributeTypeId: GPU_POWER_CONNECTOR,
      operator: Operator.EQ, // PSU_POWER_CONNECTOR phải chứa GPU_POWER_CONNECTOR
      note: "PSU phải có đủ đầu cấp nguồn phụ cho GPU",
    });
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
