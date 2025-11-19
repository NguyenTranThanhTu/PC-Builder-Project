import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidateProductListing } from "@/lib/revalidate";

// GET single category
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
}

// PATCH update name (and optional explicit slug) with uniqueness + revalidate listings
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { name, slug } = body || {};
  if (!name && !slug) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Determine final slug if name or slug provided
  let finalSlug = existing.slug;
  if (name || slug) {
    let baseSlug = slug ? slugify(slug) : slugify(name || existing.name);
    finalSlug = baseSlug;
    let i = 1;
    while (await prisma.category.findFirst({ where: { slug: finalSlug, NOT: { id } } })) {
      finalSlug = `${baseSlug}-${i++}`;
    }
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { name: name || existing.name, slug: finalSlug },
    });
    // Revalidate product listings that may filter by category slug
    await revalidateProductListing();
    return NextResponse.json({ category: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update" }, { status: 500 });
  }
}

// DELETE category only if no products reference it
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json({ error: "Category has products; cannot delete" }, { status: 409 });
  }

  try {
    await prisma.category.delete({ where: { id } });
    await revalidateProductListing();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to delete" }, { status: 500 });
  }
}
