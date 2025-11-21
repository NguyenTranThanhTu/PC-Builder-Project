import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const q = (searchParams.get("q") || "").trim();
  const categorySlug = searchParams.get("category") || undefined;
  const sortField = searchParams.get("sort") === "price" ? "priceCents" : "createdAt";
  const sortOrder = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where: any = { status: "PUBLISHED" };
  if (categorySlug) where.category = { slug: categorySlug };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { [sortField]: sortOrder as any },
      select: {
        id: true,
        name: true,
        slug: true,
        priceCents: true,
        imageUrl: true,
        imageBlurData: true,
        description: true,
        stock: true,
        category: { select: { slug: true, name: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Map DB products to UI Product shape, ensuring description, stock, imageUrl are present
  const items = products.map((p) => ({
    title: p.name || "Unnamed Product",
    reviews: 0,
    price: typeof p.priceCents === "number" ? p.priceCents / 100 : 0,
    discountedPrice: typeof p.priceCents === "number" ? p.priceCents / 100 : 0,
    id: p.id,
    imgs: { thumbnails: [p.imageUrl || ""], previews: [p.imageUrl || ""] },
    blurDataURL: p.imageBlurData || undefined,
    productId: p.id,
    productSlug: p.slug,
    specSummary: undefined,
    description: p.description || "",
    stock: typeof p.stock === "number" ? p.stock : 0,
    imageUrl: p.imageUrl || "",
    category: p.category,
  }));

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return NextResponse.json({ items, pagination: { page, pageSize, total, pageCount } });
}
