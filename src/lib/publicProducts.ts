import { prisma } from "@/lib/prisma";
import { toUiProduct } from "@/lib/productAdapter";

// Fetch latest published products (server-side) mapped to UI shape.
export async function fetchLatestProducts(limit: number = 8) {
  const items = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: { select: { slug: true, name: true } },
      attributes: { include: { attributeType: true } },
      _count: { select: { reviews: true } },
    },
  });
  return items.map(toUiProduct);
}
