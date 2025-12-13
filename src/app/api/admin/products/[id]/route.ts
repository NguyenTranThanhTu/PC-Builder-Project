import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { productUpdateSchema, attributeSchema } from "@/lib/validators/product";
import { validateAttributesAgainstTypes } from "@/lib/validators/product";
import { expectedValueTypeByKey } from "@/lib/attributeTemplates";
import { revalidateAfterProductChange } from "@/lib/revalidate";
import { Prisma, ProductStatus } from "@prisma/client";

// GET /api/admin/products/[id]
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      attributes: { include: { attributeType: true } },
      reviews: false,
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Đếm số orderItem liên quan
  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  return NextResponse.json({ product: { ...product, orderItemCount } });
}

// PATCH /api/admin/products/[id]
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  let json: any;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept price float fallback
  if (typeof json.price === "number" && json.priceCents == null) {
    json.priceCents = Math.round(json.price * 100);
  }

  json.id = id; // ensure id present for schema
  const parsed = productUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const expectedMap = expectedValueTypeByKey();
  let attrPayload = Array.isArray(json.attributes) ? json.attributes : undefined;
  if (attrPayload) {
    try {
      validateAttributesAgainstTypes(attrPayload, expectedMap);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.ProductUpdateInput = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description ?? null;
      if (data.priceCents !== undefined) updateData.priceCents = data.priceCents;
      if (data.stock !== undefined) updateData.stock = data.stock;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ?? null;
      if (data.imageBlurData !== undefined) updateData.imageBlurData = data.imageBlurData ?? null;
      // Sửa: chỉ truyền categoryId, không truyền category: { connect: ... } khi updateMany/update
      if (data.categoryId) updateData.categoryId = data.categoryId;
      if (data.featured !== undefined) updateData.featured = data.featured;
      if (data.status !== undefined) {
        updateData.status = data.status as ProductStatus;
        updateData.archivedAt = data.status === "ARCHIVED" ? new Date() : null;
      }
      // New fields from schema
      if (data.brand !== undefined) updateData.brand = data.brand ?? null;
      if (data.manufacturer !== undefined) updateData.manufacturer = data.manufacturer ?? null;
      if (data.modelNumber !== undefined) updateData.modelNumber = data.modelNumber ?? null;
      if (data.warranty !== undefined) updateData.warranty = data.warranty ?? null;
      if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle ?? null;
      if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription ?? null;

      if (data.name) {
        let baseSlug = slugify(data.slug || data.name);
        let finalSlug = baseSlug;
        let i = 1;
        while (await tx.product.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
          finalSlug = `${baseSlug}-${i++}`;
        }
        updateData.slug = finalSlug;
      } else if (data.slug) {
        // manual slug change
        let baseSlug = slugify(data.slug);
        let finalSlug = baseSlug;
        let i = 1;
        while (await tx.product.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
          finalSlug = `${baseSlug}-${i++}`;
        }
        updateData.slug = finalSlug;
      }
      // Optimistic concurrency: if client provides updatedAt, ensure match
      let product;
      if (data.updatedAt) {
        const expected = new Date(data.updatedAt);
        const res = await tx.product.updateMany({ where: { id, updatedAt: expected }, data: updateData });
        if (res.count === 0) {
          const current = await tx.product.findUnique({ where: { id } });
          throw Object.assign(new Error("Conflict"), { status: 409, currentUpdatedAt: current?.updatedAt });
        }
        product = await tx.product.findUnique({ where: { id } });
      } else {
        product = await tx.product.update({ where: { id }, data: updateData });
      }

      if (attrPayload) {
        // Replace attributes: simpler strategy
        await tx.productAttribute.deleteMany({ where: { productId: id } });
        for (const a of attrPayload) {
          const attrType = await tx.attributeType.findUnique({ where: { key: a.key } });
          if (!attrType) continue; // skip unknown
          await tx.productAttribute.create({
            data: {
              productId: id,
              attributeTypeId: attrType.id,
              stringValue: a.stringValue ?? null,
              numberValue: a.numberValue ?? null,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { category: true, attributes: { include: { attributeType: true } } },
      });
    });
    if (updated) revalidateAfterProductChange(updated.slug);
    return NextResponse.json({ product: updated });
  } catch (e: any) {
    if (e?.status === 409) {
      return NextResponse.json({ error: "Update conflict", currentUpdatedAt: e.currentUpdatedAt }, { status: 409 });
    }
    return NextResponse.json({ error: e?.message || "Failed to update" }, { status: 500 });
  }
}

// Alias PUT → PATCH for compatibility
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PATCH(req, context);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (product.status === "ARCHIVED") {
      return NextResponse.json({ ok: true, alreadyArchived: true });
    }
    // Kiểm tra nếu có orderItems -> chỉ cho phép archive, không hard delete
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { status: "ARCHIVED" as ProductStatus, archivedAt: new Date() },
      });
      // Revalidate to remove from storefront
      await revalidateAfterProductChange(product.categoryId);
      return NextResponse.json({ ok: true, archived: true });
    }
    // Nếu không có order liên quan, cho phép xóa cứng
    await prisma.productAttribute.deleteMany({ where: { productId: id } });
    // Xóa các liên kết khác nếu cần (ví dụ: ảnh, v.v.)
    await prisma.product.delete({ where: { id } });
    // Revalidate to remove from storefront
    await revalidateAfterProductChange(product.categoryId);
    return NextResponse.json({ ok: true, deleted: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete" }, { status: 500 });
  }
}
