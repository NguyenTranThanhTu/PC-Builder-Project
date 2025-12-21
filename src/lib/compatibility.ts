import { prisma } from "@/lib/prisma";

type Op = "EQ" | "NEQ" | "LT" | "LTE" | "GT" | "GTE";

export type CompatibilityIssue = {
  ruleId: string;
  severity: "error" | "warning" | "info"; // error: không tương thích, warning: hoạt động nhưng không tối ưu, info: gợi ý
  message: string;
  details?: string; // Chi tiết kỹ thuật
  recommendation?: string; // Gợi ý giải pháp
  leftProductId?: string;
  leftProductName?: string;
  rightProductId?: string;
  rightProductName?: string;
  affectedComponents?: string[]; // Các linh kiện bị ảnh hưởng
};

export type Suggestion = {
  categorySlug: string;
  suggestedProductIds: string[];
  reason: string;
};

// Evaluate basic compatibility across selected products (by ids)
// This is a scaffold; we will extend with optimized queries and domain rules.
export async function evaluateCompatibility(selectedProductIds: string[]): Promise<{
  ok: boolean;
  issues: CompatibilityIssue[];
  suggestions: Suggestion[];
}> {
  if (selectedProductIds.length === 0) return { ok: true, issues: [], suggestions: [] };

  // Fetch products, categories, and attributes
  const products = await prisma.product.findMany({
    where: { id: { in: selectedProductIds } },
    include: {
      category: true,
      attributes: { include: { attributeType: true } },
    },
  });

  // Load generic rules (we can scope by categories later)
  const rules = await prisma.compatibilityRule.findMany({
    include: {
      leftCategory: true,
      rightCategory: true,
      leftAttrType: true,
      rightAttrType: true,
    },
  });

  const result = checkCompatibilityRules({ products, rules });
  
  // Add optimization warnings
  const optimizationIssues = checkOptimizationWarnings(products);
  result.issues.push(...optimizationIssues);
  
  return result;
}

// Pure function: check compatibility rules on given products and rules (không phụ thuộc prisma)
export function checkCompatibilityRules({ products, rules }: {
  products: any[],
  rules: any[],
}): { ok: boolean, issues: CompatibilityIssue[], suggestions: Suggestion[] } {
  const issues: CompatibilityIssue[] = [];
  const suggestions: Suggestion[] = [];
  
  const productsByCategory: Record<string, typeof products> = {};
  for (const p of products) {
    if (!productsByCategory[p.categoryId]) productsByCategory[p.categoryId] = [];
    productsByCategory[p.categoryId].push(p);
  }
  
  for (const rule of rules) {
    // Special handling for sum-based checks (RAM modules, RAM capacity)
    const sumBased = [
      { left: "RAM_MODULES", right: "MB_RAM_SLOTS" },
      { left: "RAM_CAPACITY_GB", right: "MB_MAX_RAM_GB" },
    ].some(pair =>
      rule.leftAttrType?.key === pair.left && rule.rightAttrType?.key === pair.right && rule.operator === "LTE"
    );
    
    if (sumBased) {
      const leftProducts = rule.leftCategoryId ? productsByCategory[rule.leftCategoryId] || [] : products;
      const rightProducts = rule.rightCategoryId ? productsByCategory[rule.rightCategoryId] || [] : products;
      
      const leftSum = leftProducts.reduce((sum, p) => {
        const attr = p.attributes.find(a => a.attributeTypeId === rule.leftAttributeTypeId);
        if (!attr) return sum;
        const v = attr.attributeType.valueType === "NUMBER" ? attr.numberValue : Number(attr.stringValue);
        return sum + (typeof v === "number" && !isNaN(v) ? v : 0);
      }, 0);
      
      let rightMax = 0;
      for (const rp of rightProducts) {
        const attr = rp.attributes.find(a => a.attributeTypeId === rule.rightAttributeTypeId);
        if (!attr) continue;
        const v = attr.attributeType.valueType === "NUMBER" ? attr.numberValue : Number(attr.stringValue);
        if (typeof v === "number" && !isNaN(v) && v > rightMax) rightMax = v;
      }
      
      const pass = compareValues(leftSum, rightMax, rule.operator);
      if (!pass) {
        const leftLabel = rule.leftAttrType.label;
        const rightLabel = rule.rightAttrType?.label;
        const leftKey = rule.leftAttrType?.key;
        const rightKey = rule.rightAttrType?.key;
        
        let severity: "error" | "warning" | "info" = "error";
        let message = '';
        let details = '';
        let recommendation = '';
        
        // RAM_MODULES sum check
        if (leftKey === "RAM_MODULES" && rightKey === "MB_RAM_SLOTS") {
          severity = "error";
          const ramProducts = leftProducts.map(p => p.name).join(', ');
          const mbProduct = rightProducts[0]?.name || 'mainboard';
          message = `❌ Quá nhiều thanh RAM: Tổng ${leftSum} thanh RAM không vừa trong ${rightMax} khe của mainboard`;
          details = `RAM đã chọn: ${ramProducts}. Mainboard ${mbProduct} chỉ có ${rightMax} khe RAM nhưng bạn đang chọn tổng cộng ${leftSum} thanh.`;
          recommendation = `Chọn ít kit RAM hơn (tổng ≤ ${rightMax} thanh) hoặc chọn mainboard có nhiều khe RAM hơn.`;
        }
        // RAM_CAPACITY_GB sum check
        else if (leftKey === "RAM_CAPACITY_GB" && rightKey === "MB_MAX_RAM_GB") {
          const diff = leftSum - rightMax;
          if (diff > 32) {
            severity = "error";
            message = `❌ Dung lượng RAM vượt quá: Tổng ${leftSum}GB vượt giới hạn mainboard ${rightMax}GB`;
            details = `Mainboard chỉ hỗ trợ tối đa ${rightMax}GB RAM. Bạn đang chọn tổng ${leftSum}GB (vượt ${diff}GB).`;
            recommendation = `Giảm dung lượng RAM xuống ≤${rightMax}GB hoặc chọn mainboard hỗ trợ dung lượng lớn hơn.`;
          } else {
            severity = "warning";
            message = `⚠️ Dung lượng RAM hơi cao: Tổng ${leftSum}GB gần giới hạn mainboard ${rightMax}GB`;
            details = `Mainboard hỗ trợ tối đa ${rightMax}GB. Bạn đang dùng ${leftSum}GB (còn ${rightMax - leftSum}GB).`;
            recommendation = `Vẫn hoạt động nhưng không còn chỗ nâng cấp. Cân nhắc mainboard hỗ trợ dung lượng cao hơn nếu dự định nâng cấp sau.`;
          }
        }
        else {
          message = `Tổng ${leftLabel} (${leftSum}) không được lớn hơn ${rightLabel} (${rightMax})`;
          details = `Tổng giá trị từ các linh kiện đã chọn vượt quá giới hạn cho phép.`;
        }
        
        issues.push({
          ruleId: rule.id,
          severity,
          message,
          details,
          recommendation,
          affectedComponents: [rule.leftCategory?.slug, rule.rightCategory?.slug].filter(Boolean) as string[]
        });
      }
      continue;
    }
    
    // Special handling for socket compatibility (supports multiple sockets like "LGA1700/AM5/AM4")
    const socketCompatCheck = rule.leftAttrType?.key === "COOLER_SOCKET_COMPAT" && rule.rightAttrType?.key === "CPU_SOCKET";
    
    // Default: pairwise logic
    const leftCandidates = rule.leftCategoryId
      ? products.filter((p) => p.categoryId === rule.leftCategoryId)
      : products;
    const rightCandidates = rule.rightCategoryId
      ? products.filter((p) => p.categoryId === rule.rightCategoryId)
      : products;
    
    for (const lp of leftCandidates) {
      const lv = lp.attributes.find((a) => a.attributeTypeId === rule.leftAttributeTypeId);
      if (!lv) continue;
      
      for (const rp of rightCandidates) {
        if (lp.id === rp.id) continue;
        
        const rv = rule.rightAttributeTypeId
          ? rp.attributes.find((a) => a.attributeTypeId === rule.rightAttributeTypeId!)
          : undefined;
        
        const lhs = lv.attributeType.valueType === "NUMBER" ? lv.numberValue : lv.stringValue;
        const rhs = rule.rightAttributeTypeId
          ? (rv?.attributeType.valueType === "NUMBER" ? rv?.numberValue : rv?.stringValue)
          : (rule.compareNumber ?? rule.compareString);
        
        let pass = false;
        
        // Special socket compatibility check
        if (socketCompatCheck && typeof lhs === 'string' && typeof rhs === 'string') {
          // COOLER_SOCKET_COMPAT might be "LGA1700/AM5/AM4"
          // CPU_SOCKET might be "LGA1700"
          const supportedSockets = lhs.split('/').map(s => s.trim().toUpperCase());
          const cpuSocket = rhs.trim().toUpperCase();
          pass = supportedSockets.includes(cpuSocket);
        } else {
          pass = compareValues(lhs, rhs, rule.operator);
        }
        
        if (!pass) {
          const issue = createDetailedIssue(rule, lp, rp, lhs, rhs, rule.operator, socketCompatCheck);
          issues.push(issue);
        }
      }
    }
  }
  
  return { ok: issues.length === 0, issues, suggestions };
}

function compareValues(a: unknown, b: unknown, op: Op): boolean {
  if (a == null || b == null) return false;
  switch (op) {
    case "EQ":
      return a === b;
    case "NEQ":
      return a !== b;
    case "LT":
      return a < b;
    case "LTE":
      return a <= b;
    case "GT":
      return a > b;
    case "GTE":
      return a >= b;
    default:
      return false;
  }
}

// Helper function để tạo detailed compatibility issue
function createDetailedIssue(
  rule: any,
  lp: any,
  rp: any,
  lhs: any,
  rhs: any,
  operator: Op,
  socketCompatCheck: boolean = false
): CompatibilityIssue {
  const leftLabel = rule.leftAttrType.label;
  const rightLabel = rule.rightAttrType?.label;
  const leftKey = rule.leftAttrType?.key;
  const rightKey = rule.rightAttrType?.key;
  const leftVal = lhs ?? 'N/A';
  const rightVal = rhs ?? 'N/A';
  
  let severity: "error" | "warning" | "info" = "error";
  let message = '';
  let details = '';
  let recommendation = '';
  
  // CPU ↔ MAINBOARD: Socket mismatch
  if (leftKey === "CPU_SOCKET" && rightKey === "MB_SOCKET" && operator === "EQ") {
    severity = "error";
    message = `❌ Socket không khớp: CPU ${lp.name} (${leftVal}) không tương thích với Mainboard ${rp.name} (${rightVal})`;
    details = `CPU sử dụng socket ${leftVal} chỉ có thể lắp vào mainboard có socket tương ứng. Đây là yếu tố quan trọng nhất - không thể lắp ráp nếu socket không khớp.`;
    recommendation = `Chọn mainboard có socket ${leftVal} hoặc chọn CPU có socket ${rightVal}.`;
  }
  
  // COOLER ↔ CPU: Socket compatibility
  else if (socketCompatCheck) {
    severity = "error";
    message = `❌ Tản nhiệt không hỗ trợ socket CPU: ${lp.name} (${leftVal}) không hỗ trợ CPU ${rp.name} (${rightVal})`;
    details = `Tản nhiệt này hỗ trợ các socket: ${leftVal}. CPU của bạn sử dụng socket ${rightVal}.`;
    recommendation = `Chọn tản nhiệt hỗ trợ socket ${rightVal} hoặc kiểm tra bracket tương thích từ nhà sản xuất.`;
  }
  
  // COOLER ↔ CPU: TDP insufficient
  else if (leftKey === "CPU_TDP_WATT" && rightKey === "COOLER_TDP_WATT" && operator === "LTE") {
    const diff = Number(leftVal) - Number(rightVal);
    if (diff > 30) {
      severity = "error";
      message = `❌ Công suất tản nhiệt không đủ: CPU ${rp.name} (${leftVal}W) quá cao cho tản nhiệt ${lp.name} (${rightVal}W)`;
      details = `TDP của CPU vượt quá khả năng tản nhiệt ${Math.abs(diff)}W. CPU sẽ bị throttle (giảm hiệu suất) hoặc tắt máy khi nhiệt độ quá cao.`;
      recommendation = `Chọn tản nhiệt có TDP rating ít nhất ${Number(leftVal) + 20}W để đảm bảo hoạt động ổn định.`;
    } else {
      severity = "warning";
      message = `⚠️ Công suất tản nhiệt hơi thấp: CPU ${rp.name} (${leftVal}W) gần giới hạn tản nhiệt ${lp.name} (${rightVal}W)`;
      details = `TDP của CPU chỉ thấp hơn khả năng tản nhiệt ${Math.abs(diff)}W. Tản nhiệt vẫn hoạt động được nhưng sẽ chạy ở tốc độ cao, có thể ồn và nhiệt độ CPU sẽ cao hơn.`;
      recommendation = `Để hiệu suất và độ ồn tốt hơn, nên chọn tản nhiệt có TDP rating ${Number(leftVal) + 50}W trở lên.`;
    }
  }
  
  // COOLER ↔ CASE: Height clearance
  else if (leftKey === "COOLER_MAX_HEIGHT_MM" && rightKey === "CASE_CPU_COOLER_CLEARANCE_MM" && operator === "LTE") {
    severity = "error";
    message = `❌ Tản nhiệt quá cao: ${lp.name} (${leftVal}mm) không vừa trong case ${rp.name} (giới hạn ${rightVal}mm)`;
    details = `Chiều cao tản nhiệt vượt quá khoảng trống của case ${Number(leftVal) - Number(rightVal)}mm. Không thể đóng nắp case hoặc tản nhiệt sẽ bị cong/hỏng.`;
    recommendation = `Chọn tản nhiệt có chiều cao tối đa ${Number(rightVal) - 5}mm hoặc chọn case có khoảng trống lớn hơn.`;
  }
  
  // RAM ↔ MAINBOARD: Type mismatch
  else if (leftKey === "RAM_TYPE" && rightKey === "MB_RAM_TYPE" && operator === "EQ") {
    severity = "error";
    message = `❌ Loại RAM không khớp: ${lp.name} (${leftVal}) không tương thích với mainboard ${rp.name} (${rightVal})`;
    details = `DDR4 và DDR5 có cấu trúc vật lý khác nhau - không thể lắp nhầm. Khe RAM trên mainboard chỉ hỗ trợ một loại.`;
    recommendation = `Chọn RAM loại ${rightVal} để tương thích với mainboard.`;
  }
  
  // RAM ↔ MAINBOARD: Speed too high
  else if (leftKey === "RAM_SPEED_MHZ" && rightKey === "MB_MAX_RAM_SPEED_MHZ" && operator === "LTE") {
    severity = "warning";
    message = `⚠️ Tốc độ RAM cao hơn mainboard: ${lp.name} (${leftVal}MHz) sẽ chạy ở tốc độ thấp hơn (${rightVal}MHz)`;
    details = `RAM vẫn hoạt động bình thường nhưng sẽ tự động chạy ở tốc độ ${rightVal}MHz thay vì ${leftVal}MHz. Đây là tính năng downclocking tự động.`;
    recommendation = `Để tận dụng hiệu suất, chọn mainboard hỗ trợ tốc độ ${leftVal}MHz hoặc chọn RAM ${rightVal}MHz để phù hợp với mainboard.`;
  }
  
  // GPU ↔ CASE: Length clearance
  else if (leftKey === "GPU_LENGTH_MM" && rightKey === "CASE_GPU_CLEARANCE_MM" && operator === "LTE") {
    const diff = Number(leftVal) - Number(rightVal);
    severity = "error";
    message = `❌ GPU quá dài: ${lp.name} (${leftVal}mm) không vừa trong case ${rp.name} (giới hạn ${rightVal}mm)`;
    details = `GPU dài hơn khoảng trống của case ${diff}mm. Không thể lắp GPU hoặc sẽ đụng vào ổ cứng/PSU/fan.`;
    recommendation = `Chọn GPU có chiều dài tối đa ${Number(rightVal) - 10}mm hoặc chọn case có khoảng trống lớn hơn ${Number(leftVal) + 20}mm. Một số case cho phép tháo drive cage để tăng khoảng trống.`;
  }
  
  // GPU/CPU ↔ PSU: Power check (DEPRECATED - now handled by calculateTotalSystemPower)
  // We keep this for individual component reference but the total power check takes priority
  else if ((leftKey === "GPU_TDP_WATT" || leftKey === "CPU_TDP_WATT") && rightKey === "PSU_WATTAGE" && operator === "LTE") {
    // Skip individual component checks - total system power is checked in checkOptimizationWarnings()
    // This ensures we don't get duplicate or conflicting messages
    severity = "info";
    message = `💡 Đang kiểm tra công suất tổng hệ thống...`;
    details = `Công suất từng linh kiện được tính vào tổng công suất hệ thống. Xem phần "Tổng công suất hệ thống" để biết chi tiết.`;
  }
  
  // PSU/MB ↔ CASE: Form factor
  else if ((leftKey === "PSU_FORM_FACTOR" || leftKey === "MB_FORM_FACTOR") && rightKey === "CASE_FORM_FACTOR" && operator === "EQ") {
    severity = "error";
    const componentType = leftKey === "PSU_FORM_FACTOR" ? "PSU" : "Mainboard";
    message = `❌ Form factor không khớp: ${componentType} ${lp.name} (${leftVal}) không vừa với case ${rp.name} (${rightVal})`;
    details = `${componentType} ${leftVal} có kích thước vật lý không tương thích với case ${rightVal}. Lỗ bắt vít và kích thước không khớp.`;
    
    if (leftKey === "MB_FORM_FACTOR") {
      // ATX case can fit smaller boards
      if (leftVal === "ATX" && (rightVal === "Micro-ATX" || rightVal === "Mini-ITX")) {
        severity = "warning";
        message = `⚠️ Mainboard nhỏ trong case lớn: ${lp.name} (${leftVal}) nhỏ hơn case ${rp.name} (${rightVal})`;
        details = `Mainboard ${leftVal} có thể lắp vào case ${rightVal} nhưng sẽ trông trống và có thể gặp vấn đề với vị trí lỗ bắt vít.`;
        recommendation = `Case vẫn dùng được nhưng nên chọn case ${leftVal} để phù hợp hơn về thẩm mỹ và kích thước.`;
      } else {
        recommendation = `Chọn case ${leftVal} hoặc mainboard ${rightVal}.`;
      }
    } else {
      recommendation = `Chọn ${componentType} ${rightVal} hoặc case ${leftVal}.`;
    }
  }
  
  // Default case
  else {
    severity = "error";
    switch (operator) {
      case "LTE":
        message = `❌ ${leftLabel} (${leftVal}) không được lớn hơn ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
        break;
      case "LT":
        message = `❌ ${leftLabel} (${leftVal}) phải nhỏ hơn ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
        break;
      case "GTE":
        message = `❌ ${leftLabel} (${leftVal}) không được nhỏ hơn ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
        break;
      case "GT":
        message = `❌ ${leftLabel} (${leftVal}) phải lớn hơn ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
        break;
      case "EQ":
        message = `❌ ${leftLabel} (${leftVal}) phải giống ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
        break;
      case "NEQ":
        message = `❌ ${leftLabel} (${leftVal}) phải khác ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
        break;
      default:
        message = `❌ ${leftLabel} (${leftVal}) không hợp lệ với ${rightLabel} (${rightVal})`;
        details = `${lp.name}: ${leftLabel} = ${leftVal}. ${rp.name}: ${rightLabel} = ${rightVal}.`;
    }
  }
  
  return {
    ruleId: rule.id,
    severity,
    message,
    details,
    recommendation,
    leftProductId: lp.id,
    leftProductName: lp.name,
    rightProductId: rp.id,
    rightProductName: rp.name,
    affectedComponents: [lp.category?.slug || 'unknown', rp.category?.slug || 'unknown']
  };
}

// Helper function to calculate total system power consumption
function calculateTotalSystemPower(products: any[]): {
  cpuPower: number;
  gpuPower: number;
  motherboardPower: number;
  ramPower: number;
  storagePower: number;
  fansPower: number;
  totalPower: number;
  breakdown: string[];
  recommendedPSU: number;
} {
  const getAttr = (product: any, key: string) => {
    const attr = product.attributes.find((a: any) => a.attributeType.key === key);
    return attr?.attributeType.valueType === "NUMBER" ? attr?.numberValue : attr?.stringValue;
  };

  let cpuPower = 0;
  let gpuPower = 0;
  let motherboardPower = 0;
  let ramPower = 0;
  let storagePower = 0;
  const fansPower = 30; // Estimate for fans, RGB, etc.
  const breakdown: string[] = [];

  // Calculate CPU power (TDP)
  const cpus = products.filter(p => p.category?.slug === 'cpu');
  for (const cpu of cpus) {
    const tdp = getAttr(cpu, 'CPU_TDP_WATT') as number;
    if (tdp) {
      cpuPower += tdp;
      breakdown.push(`CPU ${cpu.name}: ${tdp}W`);
    }
  }

  // Calculate GPU power (TDP)
  const gpus = products.filter(p => p.category?.slug === 'gpu');
  for (const gpu of gpus) {
    const tdp = getAttr(gpu, 'GPU_TDP_WATT') as number;
    if (tdp) {
      gpuPower += tdp;
      breakdown.push(`GPU ${gpu.name}: ${tdp}W`);
    }
  }

  // Motherboard power (estimate based on chipset)
  const mainboards = products.filter(p => p.category?.slug === 'mainboard');
  if (mainboards.length > 0) {
    const mb = mainboards[0];
    const chipset = getAttr(mb, 'MB_CHIPSET')?.toString() || '';
    // High-end chipsets (Z790, X670E) consume more power
    if (chipset.startsWith('Z') || chipset.startsWith('X')) {
      motherboardPower = 80;
    } else if (chipset.startsWith('B') || chipset.startsWith('H')) {
      motherboardPower = 60;
    } else {
      motherboardPower = 70;
    }
    breakdown.push(`Mainboard ${mb.name}: ${motherboardPower}W`);
  }

  // RAM power (~5W per module)
  const rams = products.filter(p => p.category?.slug === 'ram');
  for (const ram of rams) {
    const modules = getAttr(ram, 'RAM_MODULES') as number || 1;
    const power = modules * 5;
    ramPower += power;
    breakdown.push(`RAM ${ram.name}: ${power}W (${modules} module${modules > 1 ? 's' : ''})`);
  }

  // Storage power (~5-10W per drive)
  const storages = products.filter(p => p.category?.slug === 'storage');
  for (const storage of storages) {
    const type = getAttr(storage, 'STORAGE_TYPE')?.toString() || '';
    const power = type.includes('NVMe') || type.includes('M.2') ? 8 : 5;
    storagePower += power;
    breakdown.push(`Storage ${storage.name}: ${power}W`);
  }

  // Fans, RGB, peripherals
  if (products.some(p => p.category?.slug === 'case')) {
    breakdown.push(`Fans, RGB, khác: ${fansPower}W`);
  }

  const totalPower = cpuPower + gpuPower + motherboardPower + ramPower + storagePower + fansPower;
  // Recommended PSU: total power * 1.25 (20% headroom) + 100W buffer, rounded up to nearest 50W
  const recommendedPSU = Math.ceil((totalPower * 1.25 + 100) / 50) * 50;

  return {
    cpuPower,
    gpuPower,
    motherboardPower,
    ramPower,
    storagePower,
    fansPower,
    totalPower,
    breakdown,
    recommendedPSU
  };
}

// Check optimization warnings (not compatibility errors, but suboptimal configurations)
function checkOptimizationWarnings(products: any[]): CompatibilityIssue[] {
  const warnings: CompatibilityIssue[] = [];
  
  // Helper to get attribute value
  const getAttr = (product: any, key: string) => {
    const attr = product.attributes.find((a: any) => a.attributeType.key === key);
    return attr?.attributeType.valueType === "NUMBER" ? attr?.numberValue : attr?.stringValue;
  };
  
  const productsByCategory: Record<string, typeof products> = {};
  for (const p of products) {
    if (!productsByCategory[p.categoryId]) productsByCategory[p.categoryId] = [];
    productsByCategory[p.categoryId].push(p);
  }
  
  // Get CPU and Mainboard products
  const cpus = products.filter(p => p.category?.slug === 'cpu');
  const mainboards = products.filter(p => p.category?.slug === 'mainboard');
  const gpus = products.filter(p => p.category?.slug === 'gpu');
  const psus = products.filter(p => p.category?.slug === 'psu');
  const rams = products.filter(p => p.category?.slug === 'ram');
  const coolers = products.filter(p => p.category?.slug === 'cooler');

  // CRITICAL CHECK: Total system power vs PSU wattage
  // This must be checked FIRST before individual component checks
  if (psus.length > 0 && (cpus.length > 0 || gpus.length > 0)) {
    const powerCalc = calculateTotalSystemPower(products);
    const psu = psus[0];
    const psuWattage = getAttr(psu, 'PSU_WATTAGE') as number;

    if (psuWattage && powerCalc.totalPower > 0) {
      const usage = (powerCalc.totalPower / psuWattage) * 100;
      const breakdownText = powerCalc.breakdown.map(line => `  • ${line}`).join('\n');

      if (usage > 90) {
        // CRITICAL ERROR: PSU severely underpowered
        warnings.push({
          ruleId: 'CRITICAL_PSU_TOTAL_POWER_INSUFFICIENT',
          severity: 'error',
          message: `❌ NGUY HIỂM: Nguồn quá yếu cho hệ thống - ${psu.name} (${psuWattage}W) chỉ đủ ${Math.round(usage)}% tải`,
          details: `⚠️ HỆ THỐNG KHÔNG THỂ HOẠT ĐỘNG ỔN ĐỊNH!\n\nTổng công suất hệ thống: ${powerCalc.totalPower}W\nCông suất PSU: ${psuWattage}W\nTỷ lệ sử dụng: ${Math.round(usage)}% (NGUY HIỂM!)\n\nChi tiết công suất từng linh kiện:\n${breakdownText}\n\n🔥 HẬU QUẢ KHI DÙNG PSU QUÁ YẾU:\n• PC tự tắt nguồn hoặc restart khi chơi game/render\n• Blue Screen of Death (BSOD) thường xuyên\n• Hỏng PSU do quá tải liên tục\n• CÓ THỂ HỎA HOẠN nếu PSU kém chất lượng\n• GPU/CPU bị hư hỏng do điện áp không ổn định\n• Mất dữ liệu do tắt nguồn đột ngột\n\n⚡ PSU luôn cần dự phòng 20-30% công suất để:\n• Chịu được peak power (CPU/GPU boost)\n• Hoạt động ở hiệu suất tối ưu (50-80% load)\n• Đảm bảo tuổi thọ và độ ổn định`,
          recommendation: `🔴 BẮT BUỘC PHẢI ĐỔI PSU:\n• PSU tối thiểu: ${powerCalc.recommendedPSU}W (khuyến nghị)\n• Hiệu suất: 80+ Gold trở lên\n• Thương hiệu uy tín: Corsair, Seasonic, EVGA, be quiet!\n• Modular/Semi-modular để quản lý dây tốt\n\n💡 Gợi ý cụ thể:\n• Build Gaming tầm trung: ${powerCalc.recommendedPSU}W 80+ Bronze/Gold\n• Build Gaming cao cấp: ${powerCalc.recommendedPSU + 100}W 80+ Gold/Platinum\n• Workstation/Rendering: ${powerCalc.recommendedPSU + 150}W 80+ Platinum/Titanium`,
          leftProductId: psu.id,
          leftProductName: psu.name,
          affectedComponents: ['psu', 'cpu', 'gpu', 'mainboard', 'ram', 'storage']
        });
      } else if (usage > 80) {
        // ERROR: PSU underpowered
        warnings.push({
          ruleId: 'ERROR_PSU_TOTAL_POWER_LOW',
          severity: 'error',
          message: `❌ Nguồn không đủ công suất - ${psu.name} (${psuWattage}W) cho hệ thống ${powerCalc.totalPower}W`,
          details: `Tổng công suất hệ thống: ${powerCalc.totalPower}W\nCông suất PSU: ${psuWattage}W\nTỷ lệ sử dụng: ${Math.round(usage)}% (QUÁ CAO!)\n\nChi tiết công suất:\n${breakdownText}\n\n⚠️ VẤN ĐỀ:\n• PSU chạy gần công suất tối đa (${Math.round(usage)}%) → quá tải\n• Khi CPU/GPU boost, tổng công suất có thể vượt ${psuWattage}W\n• PSU nóng, quạt ồn, hiệu suất kém\n• PC có thể tắt nguồn đột ngột khi chơi game nặng\n• Tuổi thọ PSU giảm đáng kể\n• Điện áp không ổn định ảnh hưởng linh kiện\n\nPSU nên hoạt động ở 50-80% công suất để tối ưu hiệu suất và tuổi thọ.`,
          recommendation: `Nên nâng cấp PSU:\n• PSU khuyến nghị: ${powerCalc.recommendedPSU}W+\n• Hiệu suất: 80+ Bronze trở lên (khuyến nghị 80+ Gold)\n• Với hệ thống ${powerCalc.totalPower}W, PSU ${psuWattage}W quá sát ngưỡng\n• Thêm 100-150W dự phòng cho an toàn và nâng cấp sau này`,
          leftProductId: psu.id,
          leftProductName: psu.name,
          affectedComponents: ['psu', 'cpu', 'gpu']
        });
      } else if (usage > 70) {
        // WARNING: PSU marginal
        warnings.push({
          ruleId: 'WARN_PSU_TOTAL_POWER_MARGINAL',
          severity: 'warning',
          message: `⚠️ Nguồn hơi thấp - ${psu.name} (${psuWattage}W) cho hệ thống ${powerCalc.totalPower}W`,
          details: `Tổng công suất hệ thống: ${powerCalc.totalPower}W\nCông suất PSU: ${psuWattage}W\nTỷ lệ sử dụng: ${Math.round(usage)}%\n\nChi tiết:\n${breakdownText}\n\nPSU đủ cho hệ thống hiện tại nhưng:\n• Khi CPU/GPU boost, công suất tăng 10-20%\n• PSU chạy ở ${Math.round(usage)}% load → hiệu suất không tối ưu\n• Ít headroom cho nâng cấp sau này\n• Quạt PSU có thể ồn hơn khi load cao`,
          recommendation: `Có thể sử dụng nhưng nên cân nhắc:\n• PSU lý tưởng: ${powerCalc.recommendedPSU}W (hiệu suất tối ưu, yên tâm hơn)\n• PSU hiện tại CÓ THỂ dùng được nếu không overclock\n• Nếu giữ PSU này: Theo dõi nhiệt độ và đừng overclock CPU/GPU\n• Nếu có budget: Nâng cấp lên ${powerCalc.recommendedPSU}W để an toàn lâu dài`,
          leftProductId: psu.id,
          leftProductName: psu.name,
          affectedComponents: ['psu']
        });
      } else if (usage < 40 && psuWattage > 750) {
        // INFO: PSU overkill (only for very high wattage PSUs)
        warnings.push({
          ruleId: 'INFO_PSU_OVERKILL',
          severity: 'info',
          message: `💡 Nguồn hơi dư thừa - ${psu.name} (${psuWattage}W) cho hệ thống ${powerCalc.totalPower}W`,
          details: `Tổng công suất hệ thống: ${powerCalc.totalPower}W\nCông suất PSU: ${psuWattage}W\nTỷ lệ sử dụng: ${Math.round(usage)}%\n\nPSU ${psuWattage}W khá dư thừa cho hệ thống ${powerCalc.totalPower}W. Điều này không có hại nhưng:\n• Chi phí cao hơn cần thiết\n• PSU hoạt động ở ${Math.round(usage)}% load → hiệu suất không tối ưu nhất\n• PSU hoạt động hiệu quả nhất ở 50-80% load`,
          recommendation: `Không có vấn đề, nhưng nếu muốn tiết kiệm:\n• PSU ${powerCalc.recommendedPSU}W là đủ và tối ưu hơn\n• PSU ${psuWattage}W tốt cho nâng cấp sau này (GPU mạnh hơn)\n• Hoặc giữ lại nếu đã mua, không cần đổi`,
          leftProductId: psu.id,
          leftProductName: psu.name,
          affectedComponents: ['psu']
        });
      } else {
        // SUCCESS: PSU is good
        warnings.push({
          ruleId: 'INFO_PSU_TOTAL_POWER_OK',
          severity: 'info',
          message: `✅ Nguồn phù hợp - ${psu.name} (${psuWattage}W) cho hệ thống ${powerCalc.totalPower}W`,
          details: `Tổng công suất hệ thống: ${powerCalc.totalPower}W\nCông suất PSU: ${psuWattage}W\nTỷ lệ sử dụng: ${Math.round(usage)}% (TỐI ƯU!)\n\nChi tiết:\n${breakdownText}\n\nPSU hoạt động ở mức lý tưởng:\n• Đủ công suất cho CPU/GPU boost\n• Hiệu suất chuyển đổi tối ưu (50-70% load)\n• Quạt PSU êm, nhiệt độ thấp\n• Còn headroom cho nâng cấp nhỏ`,
          recommendation: `PSU phù hợp! Không cần thay đổi.\n• Công suất lý tưởng cho hệ thống\n• Đủ dự phòng cho peak power\n• An toàn và bền bỉ lâu dài`,
          leftProductId: psu.id,
          leftProductName: psu.name,
          affectedComponents: ['psu']
        });
      }
    }
  }
  
  // WARNING 1: K-series CPU with B-series Chipset (Intel)
  for (const cpu of cpus) {
    const cpuName = cpu.name;
    const cpuBrand = getAttr(cpu, 'CPU_BRAND');
    const cpuSeries = getAttr(cpu, 'CPU_SERIES');
    
    // Check if Intel K/KF series
    const isKSeries = cpuName.includes('-K') || cpuName.includes('K ') || cpuName.includes('KF') || cpuSeries === 'K' || cpuSeries === 'KF';
    const isIntel = cpuBrand === 'Intel' || cpuName.includes('Intel');
    
    if (isIntel && isKSeries) {
      for (const mb of mainboards) {
        const chipset = getAttr(mb, 'MB_CHIPSET');
        const supportsOC = getAttr(mb, 'MB_SUPPORTS_OVERCLOCKING');
        
        // B-series or H-series chipset doesn't support overclocking
        const isBSeries = chipset?.toString().startsWith('B');
        const isHSeries = chipset?.toString().startsWith('H');
        const noOC = supportsOC === 'No' || isBSeries || isHSeries;
        
        if (noOC) {
          warnings.push({
            ruleId: 'OPT_CPU_CHIPSET_MISMATCH',
            severity: 'warning',
            message: `⚠️ CPU cao cấp với chipset phổ thông: ${cpu.name} (K-series) + ${mb.name} (${chipset})`,
            details: `CPU ${cpu.name} là phiên bản K-series có khả năng overclock, nhưng chipset ${chipset} KHÔNG hỗ trợ overclock. CPU sẽ chạy ở tốc độ stock và không thể tăng xung. Ngoài ra, VRM của ${chipset} có thể không đủ mạnh để CPU duy trì boost clocks lâu dài, dẫn đến throttling và hiệu suất thấp hơn kỳ vọng.`,
            recommendation: `Để tận dụng tối đa hiệu năng CPU K-series:\n• Chọn mainboard chipset Z790 (Intel 13th/14th gen) hoặc Z690 (Intel 12th gen) để có thể overclock\n• Hoặc chọn CPU non-K (như i5-14400F, i7-14700) để tiết kiệm chi phí vì không cần overclock\n• Chipset Z có VRM mạnh hơn, hỗ trợ CPU chạy boost cao hơn và ổn định hơn`,
            leftProductId: cpu.id,
            leftProductName: cpu.name,
            rightProductId: mb.id,
            rightProductName: mb.name,
            affectedComponents: ['cpu', 'mainboard']
          });
        }
      }
    }
  }
  
  // WARNING 2: High-end CPU (i9/Ryzen 9) with budget chipset
  for (const cpu of cpus) {
    const cpuName = cpu.name;
    const isHighEnd = cpuName.includes('i9-') || cpuName.includes('Ryzen 9');
    
    if (isHighEnd) {
      for (const mb of mainboards) {
        const chipset = getAttr(mb, 'MB_CHIPSET');
        const vrmQuality = getAttr(mb, 'MB_VRM_QUALITY');
        const mbPrice = mb.price || 0;
        const chipsetStr = chipset?.toString() || '';
        
        // High-end chipsets: Z790, Z690, Z890, X670E, X670, X870E (KHÔNG cảnh báo)
        const isHighEndChipset = 
          chipsetStr.startsWith('Z7') || // Z790, Z790, Z690
          chipsetStr.startsWith('Z8') || // Z890
          chipsetStr.startsWith('Z6') || // Z690
          chipsetStr.startsWith('X6') || // X670, X670E
          chipsetStr.startsWith('X8') || // X870, X870E
          chipsetStr === 'X670E' ||
          chipsetStr === 'X670' ||
          chipsetStr === 'X870E' ||
          chipsetStr === 'X870';
        
        // Bỏ qua nếu là chipset cao cấp
        if (isHighEndChipset) continue;
        
        // Budget chipsets: B760, B650, H610, A620, hoặc giá rất thấp với VRM kém
        const isBudgetChipset = 
          chipsetStr === 'B760' || 
          chipsetStr === 'B650' || 
          chipsetStr === 'H610' || 
          chipsetStr === 'A620' ||
          chipsetStr === 'H770' ||
          chipsetStr === 'B660' ||
          (vrmQuality === 'Basic' && mbPrice < 7000000) || // VRM Basic + giá < 7M
          mbPrice < 4000000; // Dưới 4M chắc chắn là budget
        
        if (isBudgetChipset) {
          const cpuTier = cpuName.includes('i9-') ? 'i9' : 'Ryzen 9';
          warnings.push({
            ruleId: 'OPT_HIGHEND_CPU_BUDGET_MB',
            severity: 'warning',
            message: `⚠️ CPU cao cấp với mainboard phổ thông: ${cpu.name} + ${mb.name}`,
            details: `CPU ${cpuTier} là dòng cao cấp nhất với TDP và power draw rất cao, đặc biệt khi chạy boost. Mainboard ${chipsetStr} là chipset phổ thông với VRM (nguồn CPU) không được thiết kế cho CPU cao cấp. Kết quả:\n• VRM quá nóng, có thể throttle CPU\n• CPU không duy trì được boost clocks tối đa\n• Tuổi thọ VRM giảm do chạy quá tải liên tục\n• Tiếng ồn quạt tăng do VRM nóng`,
            recommendation: `Với CPU ${cpuTier}, nên chọn:\n• Intel: Chipset Z790 hoặc Z690 (VRM mạnh, nhiều phase hơn)\n• AMD: Chipset X670E hoặc X670 (VRM mạnh cho Ryzen 9)\n• Mainboard giá từ 8-10 triệu trở lên để đảm bảo VRM chất lượng\n• Hoặc giảm xuống CPU i7/Ryzen 7 nếu muốn dùng mainboard phổ thông`,
            leftProductId: cpu.id,
            leftProductName: cpu.name,
            rightProductId: mb.id,
            rightProductName: mb.name,
            affectedComponents: ['cpu', 'mainboard']
          });
        }
      }
    }
  }
  
  // WARNING 3: High-end GPU with low efficiency PSU
  for (const gpu of gpus) {
    const gpuTDP = getAttr(gpu, 'GPU_TDP_WATT') as number;
    const gpuName = gpu.name;
    const isHighEndGPU = gpuTDP >= 300; // RTX 4080/4090, RX 7900 XTX
    
    if (isHighEndGPU) {
      for (const psu of psus) {
        const psuCert = getAttr(psu, 'PSU_CERT');
        const psuWattage = getAttr(psu, 'PSU_WATTAGE') as number;
        
        const isLowEfficiency = 
          psuCert?.toString().includes('White') || 
          psuCert?.toString().includes('Bronze') ||
          psuCert?.toString().includes('80+') && !psuCert?.toString().includes('Gold');
        
        if (isLowEfficiency) {
          const wastage = Math.round(gpuTDP * 0.15); // ~15% loss with Bronze vs Gold
          warnings.push({
            ruleId: 'OPT_HIGHEND_GPU_LOW_EFF_PSU',
            severity: 'warning',
            message: `⚠️ GPU cao cấp với PSU hiệu suất thấp: ${gpuName} (${gpuTDP}W) + PSU ${psuCert}`,
            details: `GPU ${gpuName} tiêu thụ ${gpuTDP}W ở TDP và có thể lên đến ${Math.round(gpuTDP * 1.2)}W khi boost. PSU ${psuCert} có hiệu suất chuyển đổi thấp (80-85%), nghĩa là:\n• Lãng phí ~${wastage}W điện năng thành nhiệt\n• Hóa đơn tiền điện cao hơn ~15-20% so với PSU 80+ Gold\n• PSU nóng hơn, quạt ồn hơn\n• Điện áp output không ổn định bằng PSU cao cấp, ảnh hưởng đến tuổi thọ GPU\n• Với ${psuWattage}W, công suất thực tế chỉ ~${Math.round(psuWattage * 0.8)}W ở hiệu suất tối ưu`,
            recommendation: `Với GPU cao cấp ${gpuTDP}W+, nên chọn:\n• PSU 80+ Gold trở lên (hiệu suất 90-92%)\n• PSU 80+ Platinum/Titanium cho build cao cấp (93-95% hiệu suất)\n• Fully Modular để quản lý dây tốt hơn\n• Tiết kiệm điện: ~${Math.round(wastage * 8 * 30)}W/tháng (~${Math.round(wastage * 8 * 30 * 3 / 1000)}k VND/tháng với 3k/kWh)`,
            leftProductId: gpu.id,
            leftProductName: gpu.name,
            rightProductId: psu.id,
            rightProductName: psu.name,
            affectedComponents: ['gpu', 'psu']
          });
        }
      }
    }
  }
  
  // WARNING 4: Single channel RAM (1 module)
  for (const ram of rams) {
    const ramModules = getAttr(ram, 'RAM_MODULES') as number;
    const ramName = ram.name;
    
    if (ramModules === 1 || ramName.toLowerCase().includes('(1x')) {
      warnings.push({
        ruleId: 'OPT_SINGLE_CHANNEL_RAM',
        severity: 'warning',
        message: `⚠️ RAM chạy Single Channel: ${ramName}`,
        details: `RAM ${ramName} chỉ có 1 module (Single Channel). Hiệu suất RAM bị giảm 30-50% so với Dual Channel (2 modules):\n• Băng thông bộ nhớ giảm một nửa\n• FPS trong game giảm 5-15% (đặc biệt với CPU AMD)\n• Rendering/encoding chậm hơn\n• Multi-tasking bị ảnh hưởng\n• Không tận dụng được khả năng Dual Channel của mainboard`,
        recommendation: `Luôn sử dụng RAM Dual Channel:\n• Chọn kit 2 modules (2x8GB, 2x16GB, 2x32GB)\n• Lắp vào khe A2 + B2 (khe 2 và 4 từ CPU) để chạy Dual Channel\n• Nếu cần nâng cấp, mua thêm 1 module giống hệt (khuyến nghị mua cùng lúc)\n• Quad Channel (4 modules) chỉ tăng hiệu suất 5-10% so với Dual, không đáng chi phí`,
        leftProductId: ram.id,
        leftProductName: ram.name,
        affectedComponents: ['ram']
      });
    }
  }
  
  // WARNING 5: Slow RAM with high-end platform
  for (const ram of rams) {
    const ramSpeed = getAttr(ram, 'RAM_SPEED_MHZ') as number;
    const ramType = getAttr(ram, 'RAM_TYPE');
    
    const isSlowRAM = 
      (ramType === 'DDR5' && ramSpeed < 5600) || // DDR5 < 5600 is slow
      (ramType === 'DDR4' && ramSpeed < 3200);   // DDR4 < 3200 is slow
    
    if (isSlowRAM) {
      for (const cpu of cpus) {
        const cpuName = cpu.name;
        const isHighEndCPU = cpuName.includes('i9-') || cpuName.includes('i7-') || cpuName.includes('Ryzen 9') || cpuName.includes('Ryzen 7');
        
        if (isHighEndCPU) {
          const recommendedSpeed = ramType === 'DDR5' ? 6000 : 3600;
          const perfLoss = ramType === 'DDR5' ? '10-15%' : '5-10%';
          
          warnings.push({
            ruleId: 'OPT_SLOW_RAM_HIGHEND_CPU',
            severity: 'info',
            message: `💡 RAM chậm với CPU cao cấp: ${ram.name} (${ramSpeed}MHz) + ${cpuName}`,
            details: `CPU ${cpuName} là dòng cao cấp và sẽ hưởng lợi nhiều từ RAM nhanh. RAM ${ramSpeed}MHz là tốc độ cơ bản, chưa tối ưu hiệu suất:\n• CPU hiện đại rất nhạy với tốc độ RAM (đặc biệt AMD Ryzen)\n• Latency cao hơn ảnh hưởng đến gaming (0.1% low FPS)\n• Hiệu suất CPU giảm ${perfLoss} trong gaming/rendering\n• Với CPU cao cấp, nên đầu tư RAM nhanh hơn để cân bằng`,
            recommendation: `Để tối ưu hiệu suất với ${cpuName}:\n• ${ramType}: Chọn ${recommendedSpeed}MHz trở lên\n• AMD Ryzen nhạy RAM hơn Intel, nên ưu tiên tốc độ cao\n• Chú ý CAS Latency (CL): Thấp hơn = tốt hơn (CL30-36 cho DDR5)\n• Overclock RAM trong BIOS nếu mainboard hỗ trợ XMP/EXPO\n• Chênh lệch giá RAM ${ramSpeed}MHz vs ${recommendedSpeed}MHz chỉ ~500k-1tr nhưng hiệu suất tăng rõ rệt`,
            leftProductId: ram.id,
            leftProductName: ram.name,
            rightProductId: cpu.id,
            rightProductName: cpu.name,
            affectedComponents: ['ram', 'cpu']
          });
        }
      }
    }
  }
  
  // WARNING 6: Budget air cooler with high TDP CPU
  for (const cpu of cpus) {
    const cpuTDP = getAttr(cpu, 'CPU_TDP_WATT') as number;
    const cpuName = cpu.name;
    
    if (cpuTDP >= 125) { // High TDP CPUs
      for (const cooler of coolers) {
        const coolerType = getAttr(cooler, 'COOLER_TYPE');
        const coolerTDP = getAttr(cooler, 'COOLER_TDP_WATT') as number;
        const coolerPrice = cooler.price || 0;
        
        const isBudgetAirCooler = 
          coolerType?.toString().includes('Air') && 
          (coolerTDP < 180 || coolerPrice < 1500000);
        
        if (isBudgetAirCooler) {
          const margin = coolerTDP - cpuTDP;
          
          if (margin < 50) { // Less than 50W headroom
            warnings.push({
              ruleId: 'OPT_BUDGET_COOLER_HIGH_TDP',
              severity: 'warning',
              message: `⚠️ Tản nhiệt phổ thông với CPU TDP cao: ${cooler.name} (${coolerTDP}W) cho ${cpuName} (${cpuTDP}W)`,
              details: `CPU ${cpuName} có TDP ${cpuTDP}W và có thể tiêu thụ lên đến ${Math.round(cpuTDP * 1.5)}W khi chạy boost (PL2). Tản nhiệt ${cooler.name} chỉ có rating ${coolerTDP}W:\n• Headroom chỉ ${margin}W, quá thấp cho CPU boost\n• Nhiệt độ CPU sẽ cao (80-95°C) khi load\n• CPU throttle (giảm xung) để giữ nhiệt độ an toàn\n• Quạt tản nhiệt chạy 100% tốc độ → rất ồn (50+ dB)\n• Tuổi thọ CPU có thể giảm do nhiệt độ cao liên tục`,
              recommendation: `Với CPU ${cpuTDP}W TDP, khuyến nghị:\n• Tản khí cao cấp: ${coolerTDP + 50}W+ rating (Noctua NH-D15, be quiet! Dark Rock Pro 4)\n• AIO 240mm/280mm cho CPU i7/Ryzen 7\n• AIO 360mm cho CPU i9/Ryzen 9\n• Nếu giữ tản nhiệt này: Giới hạn PL2 trong BIOS để giảm nhiệt (nhưng mất hiệu suất)\n• Budget tốt: ${Math.round((coolerTDP + 70) / 10) * 10}W+ tower cooler (~2-3 triệu)`,
              leftProductId: cooler.id,
              leftProductName: cooler.name,
              rightProductId: cpu.id,
              rightProductName: cpu.name,
              affectedComponents: ['cooler', 'cpu']
            });
          }
        }
      }
    }
  }

  // WARNING 7: Storage slots check (M.2 and SATA availability)
  if (mainboards.length > 0) {
    const mb = mainboards[0];
    const m2Slots = getAttr(mb, 'MB_M2_SLOTS') as number || 0;
    const sataPortsTotal = getAttr(mb, 'MB_SATA_PORTS') as number || 0;
    
    const storages = products.filter(p => p.category?.slug === 'storage');
    
    if (storages.length > 0) {
      let m2Count = 0;
      let sataCount = 0;
      const m2Drives: string[] = [];
      const sataDrives: string[] = [];
      
      // Count storage by interface
      for (const storage of storages) {
        const interface_ = getAttr(storage, 'STORAGE_INTERFACE')?.toString() || '';
        const type = getAttr(storage, 'STORAGE_TYPE')?.toString() || '';
        const formFactor = getAttr(storage, 'STORAGE_FORM_FACTOR')?.toString() || '';
        
        // Check if M.2 NVMe
        if (interface_.includes('NVMe') || interface_.includes('M.2') || 
            type.includes('NVMe') || formFactor.includes('M.2')) {
          m2Count++;
          m2Drives.push(storage.name);
        }
        // Check if SATA
        else if (interface_.includes('SATA') || type.includes('SATA')) {
          sataCount++;
          sataDrives.push(storage.name);
        }
      }
      
      // Check M.2 slots availability
      if (m2Count > m2Slots) {
        warnings.push({
          ruleId: 'ERROR_STORAGE_M2_INSUFFICIENT_SLOTS',
          severity: 'error',
          message: `❌ Không đủ khe M.2: Cần ${m2Count} khe, mainboard ${mb.name} chỉ có ${m2Slots} khe`,
          details: `Bạn đã chọn ${m2Count} ổ M.2/NVMe:\n${m2Drives.map(d => `  • ${d}`).join('\n')}\n\nNhưng mainboard ${mb.name} chỉ có ${m2Slots} khe M.2. Không thể lắp đủ tất cả ổ M.2.`,
          recommendation: `Giải pháp:\n• Giảm số ổ M.2 xuống ${m2Slots} ổ\n• Hoặc chọn mainboard có nhiều khe M.2 hơn (${m2Count}+ khe)\n• Hoặc thay một số ổ M.2 bằng ổ SATA (mainboard còn ${sataPortsTotal - sataCount} cổng SATA)`,
          leftProductId: mb.id,
          leftProductName: mb.name,
          affectedComponents: ['mainboard', 'storage']
        });
      }
      
      // Check SATA ports availability
      if (sataCount > sataPortsTotal) {
        warnings.push({
          ruleId: 'ERROR_STORAGE_SATA_INSUFFICIENT_PORTS',
          severity: 'error',
          message: `❌ Không đủ cổng SATA: Cần ${sataCount} cổng, mainboard ${mb.name} chỉ có ${sataPortsTotal} cổng`,
          details: `Bạn đã chọn ${sataCount} ổ SATA:\n${sataDrives.map(d => `  • ${d}`).join('\n')}\n\nNhưng mainboard ${mb.name} chỉ có ${sataPortsTotal} cổng SATA. Không thể kết nối đủ tất cả ổ SATA.`,
          recommendation: `Giải pháp:\n• Giảm số ổ SATA xuống ${sataPortsTotal} ổ\n• Hoặc chọn mainboard có nhiều cổng SATA hơn (${sataCount}+ cổng)\n• Hoặc nâng cấp lên ổ M.2 NVMe (nhanh hơn và mainboard còn ${m2Slots - m2Count} khe M.2)`,
          leftProductId: mb.id,
          leftProductName: mb.name,
          affectedComponents: ['mainboard', 'storage']
        });
      }
      
      // WARNING: Using M.2 slots may disable some SATA ports on some mainboards
      if (m2Count > 0 && sataCount > 0) {
        warnings.push({
          ruleId: 'INFO_STORAGE_M2_MAY_DISABLE_SATA',
          severity: 'info',
          message: `💡 Lưu ý: Một số khe M.2 có thể chia sẻ băng thông với cổng SATA`,
          details: `Bạn đang dùng cả ổ M.2 (${m2Count} ổ) và ổ SATA (${sataCount} ổ).\n\n⚠️ QUAN TRỌNG:\nTrên nhiều mainboard, khi lắp ổ M.2 vào một số khe (thường là khe thứ 2), các cổng SATA nhất định sẽ bị vô hiệu hóa do chia sẻ PCIe lanes.\n\nVí dụ:\n• Gigabyte: Khe M2_2 chia sẻ băng thông với SATA ports 4-5\n• ASUS: Khe M2_2 vô hiệu hóa SATA ports 5-6\n• MSI: Khe M2_3 chia sẻ với SATA ports 2-3`,
          recommendation: `Khuyến nghị:\n• Kiểm tra manual của mainboard ${mb.name} để biết khe M.2 nào chia sẻ với cổng SATA nào\n• Ưu tiên lắp ổ M.2 vào khe M2_1 (thường không chia sẻ)\n• Nếu cần nhiều ổ: Cân nhắc dùng toàn M.2 hoặc toàn SATA để tránh conflict\n• Hoặc chọn mainboard cao cấp hơn với nhiều PCIe lanes (chipset Z790/X670)`,
          leftProductId: mb.id,
          leftProductName: mb.name,
          affectedComponents: ['mainboard', 'storage']
        });
      }
    }
  }
  
  return warnings;
}
