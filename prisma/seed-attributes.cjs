// Seed core Categories and AttributeTypes for electronics components
// Run: node prisma/seed-attributes.cjs

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  { slug: "cpu", name: "CPU" },
  { slug: "mainboard", name: "Mainboard" },
  { slug: "gpu", name: "Card đồ họa" },
  { slug: "ram", name: "RAM" },
  { slug: "psu", name: "Nguồn (PSU)" },
  { slug: "case", name: "Case" },
  { slug: "storage", name: "Lưu trữ" },
  { slug: "cooler", name: "Tản nhiệt CPU" },
];

// [key, label, valueType]
const STRING = "STRING";
const NUMBER = "NUMBER";

const attributeTypes = [
  // CPU
  ["CPU_BRAND", "Hãng CPU", STRING],
  ["CPU_SOCKET", "Socket CPU", STRING],
  ["CPU_CORES", "Số nhân", NUMBER],
  ["CPU_THREADS", "Số luồng", NUMBER],
  ["CPU_BASE_CLOCK_GHZ", "Xung cơ bản (GHz)", NUMBER],
  ["CPU_BOOST_CLOCK_GHZ", "Xung boost (GHz)", NUMBER],
  ["CPU_TDP_WATT", "TDP (W)", NUMBER],
  ["CPU_MAX_MEMORY_SPEED_MHZ", "Tốc độ RAM tối đa (MHz)", NUMBER],
  ["CPU_INTEGRATED_GPU", "iGPU", STRING],

  // Mainboard
  ["MB_SOCKET", "Socket Main", STRING],
  ["MB_CHIPSET", "Chipset", STRING],
  ["MB_FORM_FACTOR", "Form Factor", STRING],
  ["MB_RAM_TYPE", "Loại RAM", STRING],
  ["MB_RAM_SLOTS", "Số khe RAM", NUMBER],
  ["MB_MAX_RAM_GB", "RAM tối đa (GB)", NUMBER],
  ["MB_MAX_RAM_SPEED_MHZ", "Tốc độ RAM tối đa (MHz)", NUMBER],
  ["MB_PCIEX16_SLOTS", "Số khe PCIe x16", NUMBER],
  ["MB_M2_SLOTS", "Số khe M.2", NUMBER],
  ["MB_SATA_PORTS", "Số cổng SATA", NUMBER],
  ["MB_WIFI", "Wi‑Fi", STRING],
  ["MB_BLUETOOTH", "Bluetooth", STRING],

  // GPU
  ["GPU_CHIP", "GPU Chip", STRING],
  ["GPU_VRAM_GB", "VRAM (GB)", NUMBER],
  ["GPU_INTERFACE", "Giao tiếp (PCIe)", STRING],
  ["GPU_LENGTH_MM", "Chiều dài (mm)", NUMBER],
  ["GPU_TDP_WATT", "TDP (W)", NUMBER],
  ["GPU_POWER_CONNECTOR", "Nguồn phụ", STRING],
  ["GPU_PCIE_GEN", "PCIe Gen", STRING],

  // RAM
  ["RAM_TYPE", "Loại RAM", STRING],
  ["RAM_CAPACITY_GB", "Dung lượng (GB)", NUMBER],
  ["RAM_SPEED_MHZ", "Tốc độ (MHz)", NUMBER],
  ["RAM_MODULES", "Số thanh", NUMBER],
  ["RAM_CL", "CL", NUMBER],

  // PSU
  ["PSU_WATTAGE", "Công suất (W)", NUMBER],
  ["PSU_CERT", "Chứng nhận", STRING],
  ["PSU_FORM_FACTOR", "Form Factor", STRING],

  // Case
  ["CASE_FORM_FACTOR", "Form Factor", STRING],
  ["CASE_GPU_CLEARANCE_MM", "Hở GPU (mm)", NUMBER],
  ["CASE_CPU_COOLER_CLEARANCE_MM", "Hở tản CPU (mm)", NUMBER],

  // Storage
  ["STORAGE_TYPE", "Loại lưu trữ", STRING],
  ["STORAGE_INTERFACE", "Giao tiếp", STRING],
  ["STORAGE_CAPACITY_GB", "Dung lượng (GB)", NUMBER],
  ["STORAGE_FORM_FACTOR", "Kích cỡ", STRING],

  // Cooler
  ["COOLER_TYPE", "Loại tản", STRING],
  ["COOLER_TDP_WATT", "Công suất tản (W)", NUMBER],
  ["COOLER_MAX_HEIGHT_MM", "Chiều cao tối đa (mm)", NUMBER],
  ["COOLER_SOCKET_COMPAT", "Socket hỗ trợ", STRING],
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
  }

  for (const [key, label, valueType] of attributeTypes) {
    await prisma.attributeType.upsert({
      where: { key },
      update: { label, valueType },
      create: { key, label, valueType },
    });
  }
}

main()
  .then(async () => {
    console.log("Seeded categories and attribute types.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
