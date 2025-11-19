import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ATTRIBUTE_TEMPLATES } from "@/lib/attributeTemplates";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  // Deduplicate categories by name for admin dropdowns.
  // Prefer canonical slugs defined in ATTRIBUTE_TEMPLATES (e.g., keep `gpu`).
  const allowedSlugs = new Set(Object.keys(ATTRIBUTE_TEMPLATES));
  const byName = new Map<string, typeof categories>();
  for (const c of categories) {
    const key = c.name.trim().toLowerCase();
    const arr = byName.get(key) ?? [];
    arr.push(c as any);
    byName.set(key, arr);
  }

  const deduped = Array.from(byName.values()).map(group => {
    if (group.length === 1) return group[0];
    // Special-case: if any slug === 'gpu', prefer it for the GPU category name group
    const gpu = group.find(c => c.slug === "gpu");
    if (gpu) return gpu;
    // Otherwise prefer a category whose slug is recognized by ATTRIBUTE_TEMPLATES
    const preferred = group.find(c => allowedSlugs.has(c.slug));
    return preferred ?? group[0];
  });

  return NextResponse.json({ categories: deduped });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const { name } = body || {};
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  let baseSlug = slugify(name);
  let finalSlug = baseSlug;
  let i = 1;
  while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${i++}`;
  }

  const cat = await prisma.category.create({ data: { name, slug: finalSlug } });
  return NextResponse.json({ category: cat }, { status: 201 });
}
