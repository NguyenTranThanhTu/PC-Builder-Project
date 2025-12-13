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
  
  // GPU/CPU ↔ PSU: Power insufficient
  else if ((leftKey === "GPU_TDP_WATT" || leftKey === "CPU_TDP_WATT") && rightKey === "PSU_WATTAGE" && operator === "LTE") {
    const componentType = leftKey === "GPU_TDP_WATT" ? "GPU" : "CPU";
    const usage = (Number(leftVal) / Number(rightVal)) * 100;
    
    if (usage > 80) {
      severity = "error";
      message = `❌ Nguồn không đủ công suất: ${componentType} ${lp.name} (${leftVal}W) quá cao cho PSU ${rp.name} (${rightVal}W)`;
      details = `${componentType} chiếm ${usage.toFixed(1)}% công suất PSU. Chưa tính CPU/GPU khác, mainboard, RAM, ổ cứng, và các thiết bị khác. PSU sẽ quá tải, có thể tắt máy hoặc hỏng.`;
      recommendation = `Khuyến nghị PSU có công suất ít nhất ${Math.ceil((Number(leftVal) * 2.5) / 100) * 100}W để đảm bảo hệ thống ổn định. Quy tắc: tổng TDP không nên vượt quá 80% công suất PSU.`;
    } else if (usage > 60) {
      severity = "warning";
      message = `⚠️ Nguồn hơi thấp: ${componentType} ${lp.name} (${leftVal}W) chiếm ${usage.toFixed(1)}% công suất PSU ${rp.name} (${rightVal}W)`;
      details = `Công suất còn lại có thể không đủ cho toàn hệ thống. PSU hoạt động hiệu quả nhất ở 50-80% tải.`;
      recommendation = `Nên chọn PSU ${Math.ceil((Number(leftVal) * 2) / 100) * 100}W trở lên để có headroom thoải mái cho nâng cấp sau này.`;
    } else {
      severity = "info";
      message = `✅ Công suất PSU đủ: ${componentType} ${lp.name} (${leftVal}W) chiếm ${usage.toFixed(1)}% PSU ${rp.name} (${rightVal}W)`;
      details = `Công suất dư thừa tốt cho hệ thống. PSU hoạt động trong vùng hiệu quả.`;
    }
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
        
        // Budget chipsets: B760, B650, H610, A620
        const isBudgetChipset = 
          chipset?.toString() === 'B760' || 
          chipset?.toString() === 'B650' || 
          chipset?.toString() === 'H610' || 
          chipset?.toString() === 'A620' ||
          vrmQuality === 'Basic' ||
          mbPrice < 5000000; // Under 5M VND is budget
        
        if (isBudgetChipset) {
          const cpuTier = cpuName.includes('i9-') ? 'i9' : 'Ryzen 9';
          warnings.push({
            ruleId: 'OPT_HIGHEND_CPU_BUDGET_MB',
            severity: 'warning',
            message: `⚠️ CPU cao cấp với mainboard phổ thông: ${cpu.name} + ${mb.name}`,
            details: `CPU ${cpuTier} là dòng cao cấp nhất với TDP và power draw rất cao, đặc biệt khi chạy boost. Mainboard ${chipset} là chipset phổ thông với VRM (nguồn CPU) không được thiết kế cho CPU cao cấp. Kết quả:\n• VRM quá nóng, có thể throttle CPU\n• CPU không duy trì được boost clocks tối đa\n• Tuổi thọ VRM giảm do chạy quá tải liên tục\n• Tiếng ồn quạt tăng do VRM nóng`,
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
  
  return warnings;
}
