/**
 * API: Product Search
 * Route: GET /api/products/search?q=keyword
 * Tìm kiếm sản phẩm theo tên, category realtime
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const limit = parseInt(searchParams.get("limit") || "8");

    // Nếu query rỗng, return empty
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search products
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        // Filter by category nếu có
        ...(category && category !== "all" ? {
          category: {
            slug: category,
          },
        } : {}),
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        priceCents: true,
        imageUrl: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const results = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.priceCents / 100, // Convert to VND
      image: p.imageUrl || "/images/products/product-placeholder.png",
      category: p.category?.name || "Uncategorized",
      categorySlug: p.category?.slug || "",
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[SEARCH API ERROR]", error);
    return NextResponse.json(
      { error: "Search failed", message: error.message },
      { status: 500 }
    );
  }
}
