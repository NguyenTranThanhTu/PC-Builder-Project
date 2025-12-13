/**
 * Script to add missing PSU and Case attributes to the database
 * Run with: node prisma/add-psu-case-attributes.cjs
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Starting to add missing attributes...\n");

  // PSU attributes
  console.log("📦 Adding PSU attributes...");
  const psuAttributes = [
    { 
      key: "PSU_MODULAR", 
      label: "Dây modular", 
      valueType: "STRING",
    },
    { 
      key: "PSU_PCIE_CONNECTORS", 
      label: "Đầu PCIe GPU", 
      valueType: "STRING",
    },
    { 
      key: "PSU_EPS_CONNECTORS", 
      label: "Đầu CPU (EPS)", 
      valueType: "STRING",
    },
    { 
      key: "PSU_SATA_CONNECTORS", 
      label: "Số đầu SATA", 
      valueType: "NUMBER",
    },
  ];

  for (const attr of psuAttributes) {
    try {
      await prisma.attributeType.upsert({
        where: { key: attr.key },
        update: { label: attr.label, valueType: attr.valueType },
        create: attr,
      });
      console.log(`  ✅ ${attr.key}`);
    } catch (error) {
      console.log(`  ⚠️  ${attr.key} - ${error.message}`);
    }
  }

  // Case attributes
  console.log("\n📦 Adding Case attributes...");
  const caseAttributes = [
    { 
      key: "CASE_MAX_PSU_LENGTH_MM", 
      label: "PSU tối đa (mm)", 
      valueType: "NUMBER",
    },
    { 
      key: "CASE_DRIVE_BAYS_25", 
      label: "Khay ổ 2.5\"", 
      valueType: "NUMBER",
    },
    { 
      key: "CASE_DRIVE_BAYS_35", 
      label: "Khay ổ 3.5\"", 
      valueType: "NUMBER",
    },
    { 
      key: "CASE_EXPANSION_SLOTS", 
      label: "Số slot mở rộng", 
      valueType: "NUMBER",
    },
    { 
      key: "CASE_FRONT_IO", 
      label: "Cổng phía trước", 
      valueType: "STRING",
    },
    { 
      key: "CASE_TEMPERED_GLASS", 
      label: "Kính cường lực", 
      valueType: "STRING",
    },
    { 
      key: "CASE_MAX_RADIATOR", 
      label: "Radiator tối đa", 
      valueType: "STRING",
    },
    { 
      key: "CASE_FANS_INCLUDED", 
      label: "Quạt đi kèm", 
      valueType: "STRING",
    },
  ];

  for (const attr of caseAttributes) {
    try {
      await prisma.attributeType.upsert({
        where: { key: attr.key },
        update: { label: attr.label, valueType: attr.valueType },
        create: attr,
      });
      console.log(`  ✅ ${attr.key}`);
    } catch (error) {
      console.log(`  ⚠️  ${attr.key} - ${error.message}`);
    }
  }

  // Optional: Add some useful attributes for other categories
  console.log("\n📦 Adding optional enhancement attributes...");
  const optionalAttributes = [
    // CPU
    { 
      key: "CPU_CACHE_MB", 
      label: "Cache (MB)", 
      valueType: "NUMBER",
    },
    // GPU
    { 
      key: "GPU_BOOST_CLOCK_MHZ", 
      label: "Xung boost (MHz)", 
      valueType: "NUMBER",
    },
    { 
      key: "GPU_MEMORY_BUS", 
      label: "Memory Bus (bit)", 
      valueType: "NUMBER",
    },
    // Storage
    { 
      key: "STORAGE_READ_SPEED_MBPS", 
      label: "Tốc độ đọc (MB/s)", 
      valueType: "NUMBER",
    },
    { 
      key: "STORAGE_WRITE_SPEED_MBPS", 
      label: "Tốc độ ghi (MB/s)", 
      valueType: "NUMBER",
    },
  ];

  for (const attr of optionalAttributes) {
    try {
      await prisma.attributeType.upsert({
        where: { key: attr.key },
        update: { label: attr.label, valueType: attr.valueType },
        create: attr,
      });
      console.log(`  ✅ ${attr.key}`);
    } catch (error) {
      console.log(`  ⚠️  ${attr.key} - ${error.message}`);
    }
  }

  console.log("\n✅ All attributes added successfully!");
  
  // Show summary
  const totalAttributes = await prisma.attributeType.count();
  console.log(`\n📊 Total attributes in database: ${totalAttributes}`);
  
  // Show breakdown by category
  console.log("\n📋 Attribute breakdown:");
  const allAttrs = await prisma.attributeType.findMany({
    select: { key: true, label: true },
    orderBy: { key: 'asc' },
  });
  
  const categories = {
    CPU: allAttrs.filter(a => a.key.startsWith('CPU_')),
    MB: allAttrs.filter(a => a.key.startsWith('MB_')),
    GPU: allAttrs.filter(a => a.key.startsWith('GPU_')),
    RAM: allAttrs.filter(a => a.key.startsWith('RAM_')),
    PSU: allAttrs.filter(a => a.key.startsWith('PSU_')),
    CASE: allAttrs.filter(a => a.key.startsWith('CASE_')),
    STORAGE: allAttrs.filter(a => a.key.startsWith('STORAGE_')),
    COOLER: allAttrs.filter(a => a.key.startsWith('COOLER_')),
  };
  
  Object.entries(categories).forEach(([cat, attrs]) => {
    console.log(`  ${cat}: ${attrs.length} attributes`);
  });
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
