/**
 * Test script để verify logic phân tích PC
 */

// Test case 1: PC không có tản nhiệt
console.log("\n=== Test 1: PC không có tản nhiệt ===");
const pc1 = {
  cpu: { id: "1", name: "Intel i9", price: 500, tdp: 125 },
  gpu: { id: "2", name: "RTX 4090", price: 1500, tdp: 450 },
  ram: { id: "3", name: "32GB DDR5", price: 200, capacity: 32 },
  psu: { id: "4", name: "850W PSU", price: 150, wattage: 850 },
  // cooling: null - không có
};

// Expected: Thermal issue với severity 80, điểm nên giảm xuống ~20
const cpuTDP1 = pc1.cpu.tdp || 65;
const gpuTDP1 = pc1.gpu.tdp || 150;
const estimatedPower1 = cpuTDP1 + gpuTDP1 + 100; // 125 + 450 + 100 = 675W
const psuCapacity1 = pc1.psu.wattage; // 850W
const headroom1 = psuCapacity1 - estimatedPower1; // 850 - 675 = 175W
console.log(`CPU TDP: ${cpuTDP1}W, GPU TDP: ${gpuTDP1}W`);
console.log(`Estimated Power: ${estimatedPower1}W`);
console.log(`PSU Capacity: ${psuCapacity1}W`);
console.log(`Headroom: ${headroom1}W (${((headroom1/psuCapacity1)*100).toFixed(1)}%)`);
console.log(`Expected bottleneck: THERMAL_ISSUE (severity: 80)`);
console.log(`Expected score: ~20 (100 - 80*0.7 - 80*0.3 = 20)`);

// Test case 2: Tản nhiệt không đủ (50W cho CPU 125W)
console.log("\n=== Test 2: Tản nhiệt không đủ ===");
const pc2 = {
  cpu: { id: "1", name: "Intel i9", price: 500, tdp: 125 },
  gpu: { id: "2", name: "RTX 4090", price: 1500, tdp: 450 },
  ram: { id: "3", name: "32GB DDR5", price: 200, capacity: 32 },
  psu: { id: "4", name: "850W PSU", price: 150, wattage: 850 },
  cooling: { id: "5", name: "Stock Cooler", price: 20, tdpRating: 50 },
};

console.log(`CPU TDP: ${pc2.cpu.tdp}W`);
console.log(`Cooler Rating: ${pc2.cooling.tdpRating}W`);
console.log(`Expected bottleneck: THERMAL_ISSUE (severity: 85) - Cooler < CPU TDP`);
console.log(`Expected score: ~10-15 (100 - 85*0.7 - 85*0.3 = 15)`);

// Test case 3: Tản nhiệt đủ nhưng sát sao (130W cho CPU 125W)
console.log("\n=== Test 3: Tản nhiệt sát sao ===");
const pc3 = {
  cpu: { id: "1", name: "Intel i9", price: 500, tdp: 125 },
  gpu: { id: "2", name: "RTX 4090", price: 1500, tdp: 450 },
  ram: { id: "3", name: "32GB DDR5", price: 200, capacity: 32 },
  psu: { id: "4", name: "850W PSU", price: 150, wattage: 850 },
  cooling: { id: "5", name: "Mid Cooler", price: 40, tdpRating: 130 },
};

const cpuTDP3 = pc3.cpu.tdp;
const coolerRating3 = pc3.cooling.tdpRating;
const requiredCooler3 = cpuTDP3 * 1.2; // 125 * 1.2 = 150W
console.log(`CPU TDP: ${cpuTDP3}W`);
console.log(`Cooler Rating: ${coolerRating3}W`);
console.log(`Recommended Cooler: ${requiredCooler3}W (CPU TDP * 1.2)`);
console.log(`Expected bottleneck: THERMAL_ISSUE (severity: 50) - Cooler < CPU TDP * 1.2`);
console.log(`Expected score: ~50 (100 - 50*0.7 - 50*0.3 = 50)`);

// Test case 4: Tản nhiệt tốt (200W cho CPU 125W)
console.log("\n=== Test 4: Tản nhiệt tốt ===");
const pc4 = {
  cpu: { id: "1", name: "Intel i9", price: 500, tdp: 125 },
  gpu: { id: "2", name: "RTX 4090", price: 1500, tdp: 450 },
  ram: { id: "3", name: "32GB DDR5", price: 200, capacity: 32 },
  psu: { id: "4", name: "850W PSU", price: 150, wattage: 850 },
  cooling: { id: "5", name: "High-end Cooler", price: 80, tdpRating: 200 },
};

console.log(`CPU TDP: ${pc4.cpu.tdp}W`);
console.log(`Cooler Rating: ${pc4.cooling.tdpRating}W`);
console.log(`Expected bottleneck: None`);
console.log(`Expected score: 100`);

// Test case 5: PSU không đủ (500W cho hệ thống cần 675W)
console.log("\n=== Test 5: PSU không đủ ===");
const pc5 = {
  cpu: { id: "1", name: "Intel i9", price: 500, tdp: 125 },
  gpu: { id: "2", name: "RTX 4090", price: 1500, tdp: 450 },
  ram: { id: "3", name: "32GB DDR5", price: 200, capacity: 32 },
  psu: { id: "4", name: "500W PSU", price: 80, wattage: 500 },
  cooling: { id: "5", name: "Good Cooler", price: 60, tdpRating: 160 },
};

const estimated5 = 125 + 450 + 100; // 675W
const psuCap5 = 500;
const headroom5 = psuCap5 - estimated5; // -175W
console.log(`Estimated Power: ${estimated5}W`);
console.log(`PSU Capacity: ${psuCap5}W`);
console.log(`Headroom: ${headroom5}W (OVERLOAD!)`);
console.log(`Expected bottleneck: PSU_UNDERPOWERED (severity: 95)`);
console.log(`Expected score: ~5 (100 - 95*0.7 - 95*0.3 = 5)`);

// Test case 6: Multiple bottlenecks (thermal + PSU + RAM)
console.log("\n=== Test 6: Multiple bottlenecks ===");
const pc6 = {
  cpu: { id: "1", name: "Intel i9", price: 500, tdp: 125 },
  gpu: { id: "2", name: "RTX 4090", price: 1500, tdp: 450 },
  ram: { id: "3", name: "8GB DDR4", price: 50, capacity: 8 }, // Warning: 8GB
  psu: { id: "4", name: "550W PSU", price: 90, wattage: 550 }, // Warning: insufficient
  cooling: { id: "5", name: "Weak Cooler", price: 20, tdpRating: 65 }, // Critical: not enough
};

console.log(`Bottleneck 1: THERMAL_ISSUE (severity: 85) - 65W cooler for 125W CPU`);
console.log(`Bottleneck 2: PSU_UNDERPOWERED (severity: 95) - 550W PSU for 675W system`);
console.log(`Bottleneck 3: RAM_INSUFFICIENT (severity: 60) - 8GB RAM`);
console.log(`Max severity: 95`);
console.log(`Avg severity: (85 + 95 + 60) / 3 = 80`);
console.log(`Weighted: 95*0.7 + 80*0.3 = 66.5 + 24 = 90.5`);
console.log(`Penalty: (3-1)*2 = 4`);
console.log(`Expected score: 100 - 90.5 - 4 = 5.5 (~6)`);

console.log("\n=== Logic Summary ===");
console.log("1. detectThermalIssue() now checks if cooling is missing");
console.log("2. calculateHealthScore() filters out BALANCED bottlenecks");
console.log("3. Score = 100 - (maxSeverity*0.7 + avgSeverity*0.3) - countPenalty");
console.log("4. Severity thresholds:");
console.log("   - CRITICAL (80-100): Score < 20");
console.log("   - WARNING (50-79): Score 20-50");
console.log("   - INFO (30-49): Score 50-70");
console.log("   - OK (0-29): Score 70-100");
