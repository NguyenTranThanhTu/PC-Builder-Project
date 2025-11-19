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

  const [total, items] = await Promise.all([
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
        category: { select: { slug: true, name: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return NextResponse.json({ items, pagination: { page, pageSize, total, pageCount } });
}
