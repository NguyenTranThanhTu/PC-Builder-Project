import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { prisma } from "@/lib/prisma";
import { toUiProduct } from "@/lib/productAdapter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Page for NextCommerce Template",
};

// Adapter dùng chung từ lib/productAdapter

export const revalidate = 30; // brief cache for faster pagination

export default async function ShopWithoutSidebarPage({ searchParams }: any) {
  const sp = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams || {};
  const pageSize = 16; // 4 columns * 4 rows
  const page = Math.max(1, parseInt((sp?.page as string) || "1", 10));
  const categorySlug = sp?.category as string | undefined;
  const view = (sp?.view as string) === "list" ? "list" : "grid";
  const where = categorySlug ? { category: { slug: categorySlug } } : {};
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        priceCents: true,
        imageUrl: true,
        imageBlurData: true,
        _count: { select: { reviews: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const uiProducts = products.map(toUiProduct);
  const pageCount = Math.ceil(total / pageSize);
  return (
    <main>
      <ShopWithoutSidebar
        products={uiProducts}
        pagination={{ page, pageSize, total, pageCount, category: categorySlug }}
        view={view}
      />
    </main>
  );
}
