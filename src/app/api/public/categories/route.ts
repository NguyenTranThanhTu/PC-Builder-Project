import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public categories endpoint: returns published product counts per category.
// Lightweight payload for storefront navigation/carousels.
export async function GET() {
  try {
    const [categories, productCounts] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.groupBy({
        by: ["categoryId"],
        where: { status: "PUBLISHED" },
        _count: { categoryId: true },
      }),
    ]);

    const countsMap: Record<string, number> = {};
    for (const c of productCounts) countsMap[c.categoryId] = c._count.categoryId;

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: countsMap[c.id] || 0,
      })),
    });
  } catch (err: any) {
    console.error("/api/public/categories error", err);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}
