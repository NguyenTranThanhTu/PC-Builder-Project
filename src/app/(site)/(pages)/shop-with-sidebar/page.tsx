import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { prisma } from "@/lib/prisma";
import { toUiProduct } from "@/lib/productAdapter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Page for NextCommerce Template",
};

// Adapter dùng chung được import từ lib/productAdapter

export const revalidate = 30; // cache listings briefly for faster nav

export default async function ShopWithSidebarPage({ searchParams }: any) {
  const pageSize = 12;
  const sp = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams || {};
  const page = Math.max(1, parseInt((sp?.page as string) || "1", 10));
  const categorySlug = sp?.category as string | undefined;
  const view = (sp?.view as string) === "list" ? "list" : "grid";

  const where: any = { status: 'PUBLISHED', archivedAt: null };
  if (categorySlug) where.category = { slug: categorySlug };

  // Price range filter: priceMin/priceMax are in currency; convert to cents
  const priceMin = sp?.priceMin ? Number(sp.priceMin) : undefined;
  const priceMax = sp?.priceMax ? Number(sp.priceMax) : undefined;
  if (!isNaN(priceMin as number) || !isNaN(priceMax as number)) {
    where.priceCents = {};
    if (!isNaN(priceMin as number)) where.priceCents.gte = Math.floor((priceMin as number) * 100);
    if (!isNaN(priceMax as number)) where.priceCents.lte = Math.floor((priceMax as number) * 100);
  }

  // Generic attribute filters via query params:
  // - Number range: attr_<ATTRKEY>_min, attr_<ATTRKEY>_max
  // - String equals: attr_<ATTRKEY>=value
  const andFilters: any[] = [];
  if (sp && typeof sp === 'object') {
    for (const [k, v] of Object.entries(sp)) {
      if (!k.startsWith('attr_')) continue;
      // patterns: attr_KEY_min, attr_KEY_max, attr_KEY
      const rest = k.substring(5); // remove 'attr_'
      let attrKey = rest;
      let bound: 'min' | 'max' | null = null;
      if (rest.endsWith('_min')) { attrKey = rest.slice(0, -4); bound = 'min'; }
      else if (rest.endsWith('_max')) { attrKey = rest.slice(0, -4); bound = 'max'; }
      const value = Array.isArray(v) ? v[0] : (v as string | undefined);
      if (!value && bound === null) continue;

      // Accumulate per attribute key
      (andFilters as any)._acc = (andFilters as any)._acc || {};
      const acc: Record<string, any> = (andFilters as any)._acc;
      acc[attrKey] = acc[attrKey] || { number: {}, string: undefined as undefined | string };
      if (bound === 'min') {
        const num = Number(value);
        if (!isNaN(num)) acc[attrKey].number.gte = num;
      } else if (bound === 'max') {
        const num = Number(value);
        if (!isNaN(num)) acc[attrKey].number.lte = num;
      } else {
        // string equals
        acc[attrKey].string = String(value ?? '').trim();
      }
    }
    if ((andFilters as any)._acc) {
      const acc: Record<string, { number: any; string?: string }> = (andFilters as any)._acc;
      for (const [attrKey, spec] of Object.entries(acc)) {
        const cond: any = { attributeType: { key: attrKey } };
        if (spec.string && spec.string.length > 0) cond.stringValue = spec.string;
        if (spec.number && (spec.number.gte !== undefined || spec.number.lte !== undefined)) {
          cond.numberValue = {};
          if (spec.number.gte !== undefined) cond.numberValue.gte = spec.number.gte;
          if (spec.number.lte !== undefined) cond.numberValue.lte = spec.number.lte;
        }
        andFilters.push({ attributes: { some: cond } });
      }
      delete (andFilters as any)._acc;
    }
  }
  if (andFilters.length) where.AND = andFilters;

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { slug: true } },
        attributes: { include: { attributeType: { select: { key: true, valueType: true } } } },
        _count: { select: { reviews: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.findMany({
      where: { products: { some: { status: 'PUBLISHED', archivedAt: null } } },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    })
  ]);

  const uiProducts = products.map(toUiProduct);
  const pageCount = Math.ceil(total / pageSize);

  const uiCategories = categories.map(c => ({ name: c.name, slug: c.slug, productCount: c._count.products }));

  return (
    <main>
      <ShopWithSidebar
        products={uiProducts}
        categories={uiCategories}
        pagination={{ page, pageSize, total, pageCount, category: categorySlug }}
        view={view}
      />
    </main>
  );
}
