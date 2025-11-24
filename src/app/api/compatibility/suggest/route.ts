import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ATTRIBUTE_TEMPLATES } from "@/lib/attributeTemplates";
import { evaluateCompatibility } from "@/lib/compatibility";

const BodySchema = z.object({
  productIds: z.array(z.string().min(1)).default([]),
  maxPerCategory: z.number().int().min(1).max(50).optional().default(10),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid body", details: parse.error.flatten() }, { status: 400 });
    }

    const { productIds, maxPerCategory } = parse.data;

    const selectedProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });

    const selectedCategoryIds = new Set(selectedProducts.map((p) => p.categoryId));
    const targetCategorySlugs = Object.keys(ATTRIBUTE_TEMPLATES);

    // Map slug -> Category record
    const categories = await prisma.category.findMany({
      where: { slug: { in: targetCategorySlugs } },
      select: { id: true, slug: true },
    });
    const bySlug = new Map<string, { id: string; slug: string }>(categories.map((c) => [c.slug, c] as const));

    const suggestions: Record<string, any[]> = {};

    for (const slug of targetCategorySlugs) {
      const cat = bySlug.get(slug);
      if (!cat) continue;
      if (selectedCategoryIds.has(cat.id)) continue; // already selected

      // Fetch a pool of candidates first
      const pool = await prisma.product.findMany({
        where: { categoryId: cat.id, status: "PUBLISHED", stock: { gt: 0 } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: Math.max(15, maxPerCategory * 3),
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          imageUrl: true,
          imageBlurData: true,
          category: { select: { slug: true } },
        },
      });

      let passing: any[] = [];
      if (!productIds || productIds.length === 0) {
        // Nếu chưa chọn gì, trả về luôn danh sách sản phẩm
        passing = pool.slice(0, maxPerCategory);
      } else {
        for (const candidate of pool) {
          const testIds = [...productIds, candidate.id];
          // eslint-disable-next-line no-await-in-loop
          const res = await evaluateCompatibility(testIds);
          if (res.ok) {
            passing.push(candidate);
            if (passing.length >= maxPerCategory) break;
          }
        }
      }

      suggestions[slug] = passing.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceCents: p.priceCents,
        imageUrl: p.imageUrl,
        imageBlurData: p.imageBlurData,
      }));
    }

    return NextResponse.json({ suggestions });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
