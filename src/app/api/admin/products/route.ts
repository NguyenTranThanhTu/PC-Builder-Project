import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { productCreateSchema } from "@/lib/validators/product";
import { validateAttributesAgainstTypes } from "@/lib/validators/product";
import { expectedValueTypeByKey } from "@/lib/attributeTemplates";
import { Prisma, ProductStatus } from "@prisma/client";
import { revalidateAfterProductChange } from "@/lib/revalidate";

// GET /api/admin/products
// Query params: page, pageSize, q (search), category (slug), featured=true|false, status, sort=createdAt|price, order=asc|desc
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const q = searchParams.get("q")?.trim() || "";
  const categorySlug = searchParams.get("category") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const featuredParam = searchParams.get("featured");
  const statusParam = searchParams.get("status") || undefined; // DRAFT|PUBLISHED|ARCHIVED|OUT_OF_STOCK|DISCONTINUED
  const sortField = searchParams.get("sort") === "price" ? "priceCents" : "createdAt";
  const sortOrder = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where: Prisma.ProductWhereInput = {};
  if (featuredParam === "true") where.featured = true;
  if (featuredParam === "false") where.featured = false;
  if (categoryId) {
    where.categoryId = categoryId;
  } else if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (brand) {
    where.brand = brand;
  }
  if (statusParam) {
    where.status = statusParam as ProductStatus;
  } else {
    where.status = { not: "ARCHIVED" as ProductStatus };
  }
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
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        slug: true,
        name: true,
        priceCents: true,
        stock: true,
        status: true,
        featured: true,
        imageUrl: true,
        imageBlurData: true,
        brand: true,
        manufacturer: true,
        warranty: true,
        category: { select: { id: true, name: true, slug: true } },
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const pageCount = Math.ceil(total / pageSize) || 1;
  return NextResponse.json({
    items: products,
    pagination: { page, pageSize, total, pageCount },
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  let json: any;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Chấp nhận price hoặc priceCents
  if (typeof json.price === "number" && json.priceCents == null) {
    json.priceCents = Math.round(json.price * 100);
  }

  // Đặt mặc định status là 'PUBLISHED' nếu không truyền lên
  if (!json.status) {
    json.status = "PUBLISHED";
  }

  const parsed = productCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
  }

  // Unique slug generation
  let baseSlug = slugify(data.slug || data.name);
  let finalSlug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${i++}`;
  }

  const expectedMap = expectedValueTypeByKey();
  try {
    validateAttributesAgainstTypes(data.attributes, expectedMap);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: finalSlug,
          description: data.description ?? null,
          priceCents: data.priceCents,
          stock: data.stock,
          imageUrl: data.imageUrl ?? null,
          imageBlurData: data.imageBlurData ?? null,
          categoryId: data.categoryId,
          featured: data.featured ?? false,
          status: (data.status as ProductStatus) ?? "PUBLISHED",
          archivedAt: null,
          
          // New fields
          brand: data.brand ?? null,
          manufacturer: data.manufacturer ?? null,
          modelNumber: data.modelNumber ?? null,
          warranty: data.warranty ?? null,
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
        },
      });

      if (data.attributes.length) {
        for (const a of data.attributes) {
          const attrType = await tx.attributeType.findUnique({ where: { key: a.key } });
          if (!attrType) continue;
          await tx.productAttribute.create({
            data: {
              productId: product.id,
              attributeTypeId: attrType.id,
              stringValue: a.stringValue ?? null,
              numberValue: a.numberValue ?? null,
            },
          });
        }
      }

      const withAttrs = await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          attributes: { include: { attributeType: true } },
        },
      });
      // Revalidate listing & detail paths
      revalidateAfterProductChange(withAttrs!.slug);
      return withAttrs;
    });
    return NextResponse.json({ product: result }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create" }, { status: 500 });
  }
}
