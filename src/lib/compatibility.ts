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

  const issues: CompatibilityIssue[] = [];
  const suggestions: Suggestion[] = [];

  // Simple pass to flag mismatches
  // For rules that compare attribute-to-attribute within a pair of categories
  for (const rule of rules) {
    // Determine candidates by category scope if provided
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
          issues.push({
            ruleId: rule.id,
            message: `${rule.leftAttrType.label} ${String(rule.operator)} check failed`,
            leftProductId: lp.id,
            rightProductId: rp.id,
          });
          // Suggestion stub: find alternatives in right category that satisfy the rule
          if (rule.rightCategoryId && rule.rightAttributeTypeId) {
            const alternatives = await productsInCategory(rule.rightCategoryId);
            // eslint-disable-next-line no-await-in-loop
            const matching = filterProductsByRule(
              alternatives,
              rule.leftAttributeTypeId,
              lv.attributeType.valueType === "NUMBER" ? lv.numberValue : lv.stringValue,
              rule.rightAttributeTypeId,
              rule.operator,
            );
            suggestions.push({
              categorySlug: rp.category.slug,
              suggestedProductIds: (await matching).map((m) => m.id),
              reason: `Thay thế linh kiện không tương thích với ${lp.name}`,
            });
          }
        }
      }
    }
  }

  return { ok: issues.length === 0, issues, suggestions };
}

function compareValues(a: unknown, b: unknown, op: Op): boolean {
  if (a == null || b == null) return true; // ignore if missing; stricter later
  if (typeof a === "number" && typeof b === "number") {
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
        return true;
    }
  }
  // string compare fallback
  const as = String(a).toLowerCase();
  const bs = String(b).toLowerCase();
  switch (op) {
    case "EQ":
      return as === bs;
    case "NEQ":
      return as !== bs;
    default:
      return true;
  }
}

async function productsInCategory(categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId },
    include: { attributes: { include: { attributeType: true } }, category: true },
  });
}

function filterProductsByRule(
  candidates: Awaited<ReturnType<typeof productsInCategory>>,
  leftAttrTypeId: string,
  leftValue: string | number | null | undefined,
  rightAttrTypeId: string,
  operator: Op,
) {
  // simple in-memory filter for now
  return candidates.filter((p) => {
    const rv = p.attributes.find((a) => a.attributeTypeId === rightAttrTypeId);
    const rhs = rv?.attributeType.valueType === "NUMBER" ? rv?.numberValue : rv?.stringValue;
    return compareValues(leftValue as any, rhs as any, operator);
  });
}
