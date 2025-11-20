import { prisma } from "@/lib/prisma";

type Op = "EQ" | "NEQ" | "LT" | "LTE" | "GT" | "GTE";

export type CompatibilityIssue = {
  ruleId: string;
  message: string;
  leftProductId?: string;
  rightProductId?: string;
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

  return checkCompatibilityRules({ products, rules });
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
        issues.push({
          ruleId: rule.id,
          message: `Tổng ${leftLabel} (${leftSum}) không được lớn hơn ${rightLabel} (${rightMax})`,
        });
      }
      continue;
    }
    // Default: pairwise logic như cũ
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
        const pass = compareValues(lhs, rhs, rule.operator);
        if (!pass) {
          let detailMsg = '';
          const leftLabel = rule.leftAttrType.label;
          const rightLabel = rule.rightAttrType?.label;
          const leftVal = lhs ?? 'N/A';
          const rightVal = rhs ?? 'N/A';
          switch (rule.operator) {
            case "LTE":
              detailMsg = `${leftLabel} (${leftVal}) không được lớn hơn ${rightLabel} (${rightVal})`;
              break;
            case "LT":
              detailMsg = `${leftLabel} (${leftVal}) phải nhỏ hơn ${rightLabel} (${rightVal})`;
              break;
            case "GTE":
              detailMsg = `${leftLabel} (${leftVal}) không được nhỏ hơn ${rightLabel} (${rightVal})`;
              break;
            case "GT":
              detailMsg = `${leftLabel} (${leftVal}) phải lớn hơn ${rightLabel} (${rightVal})`;
              break;
            case "EQ":
              detailMsg = `${leftLabel} (${leftVal}) phải giống ${rightLabel} (${rightVal})`;
              break;
            case "NEQ":
              detailMsg = `${leftLabel} (${leftVal}) phải khác ${rightLabel} (${rightVal})`;
              break;
            default:
              detailMsg = `${leftLabel} (${leftVal}) không hợp lệ với ${rightLabel} (${rightVal})`;
          }
          issues.push({
            ruleId: rule.id,
            message: detailMsg,
            leftProductId: lp.id,
            rightProductId: rp.id,
          });
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
