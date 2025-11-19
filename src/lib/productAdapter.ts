import type { Product as UiProduct } from "@/types/product";
import { ATTRIBUTE_TEMPLATES } from "./attributeTemplates";

// Stable hash to convert a cuid string into a smaller numeric id for existing UI components.
export function hashToNumber(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Map a Prisma Product (with optional _count) to the UI Product shape.
// Accepts a minimal object to stay flexible with select/include.
export function toUiProduct(p: any): UiProduct {
  // Defensive defaults để adapter hoạt động với select tối thiểu
  const img = p.imageUrl || "/images/products/product-1-sm-1.png";
  const price = typeof p.priceCents === "number" ? p.priceCents / 100 : 0;
  return {
    title: p.name || "Unnamed Product",
    reviews: p._count?.reviews || 0,
    price,
    discountedPrice: price, // Nếu sau này có discountPriceCents có thể thay thế
    id: hashToNumber(p.id || "missing"),
    imgs: { thumbnails: [img], previews: [img] },
    // @ts-ignore blur placeholder
    blurDataURL: p.imageBlurData || undefined,
    // @ts-ignore bản gốc id dùng cho order
    productId: p.id,
    // @ts-ignore slug cho route động
    productSlug: p.slug,
    // @ts-ignore spec summary (optional on listings)
    specSummary: buildSpecSummary(p)
  } as any;
}

// Build short spec summary for listings (category-dependent)
function buildSpecSummary(p: any): string | undefined {
  if (!p.category?.slug || !p.attributes) return undefined;
  const slug = p.category.slug as string;
  const attrMap: Record<string, any> = {};
  for (const a of p.attributes) {
    const key = a.attributeType?.key;
    if (!key) continue;
    attrMap[key] = a.stringValue ?? a.numberValue;
  }
  try {
    switch (slug) {
      case 'cpu': {
        const cores = attrMap['CPU_CORES'];
        const threads = attrMap['CPU_THREADS'];
        const base = attrMap['CPU_BASE_CLOCK_GHZ'];
        const boost = attrMap['CPU_BOOST_CLOCK_GHZ'];
        return [cores && threads ? `${cores}C/${threads}T` : null, base && boost ? `${base}-${boost}GHz` : null].filter(Boolean).join(' · ') || undefined;
      }
      case 'gpu': {
        const vram = attrMap['GPU_VRAM_GB'];
        const length = attrMap['GPU_LENGTH_MM'];
        const tdp = attrMap['GPU_TDP_WATT'];
        return [vram ? `${vram}GB VRAM` : null, length ? `${length}mm` : null, tdp ? `${tdp}W` : null].filter(Boolean).join(' · ') || undefined;
      }
      case 'ram': {
        const cap = attrMap['RAM_CAPACITY_GB'];
        const speed = attrMap['RAM_SPEED_MHZ'];
        return [cap ? `${cap}GB` : null, speed ? `${speed}MHz` : null].filter(Boolean).join(' · ') || undefined;
      }
      case 'storage': {
        const type = attrMap['STORAGE_TYPE'];
        const cap = attrMap['STORAGE_CAPACITY_GB'];
        return [cap ? `${cap}GB` : null, type].filter(Boolean).join(' · ') || undefined;
      }
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

// Helper to format full spec table rows
export function formatAttributeValue(key: string, value: any): string {
  if (value == null) return '—';
  if (typeof value === 'number') {
    if (/(CLOCK_GHZ)$/i.test(key)) return value + ' GHz';
    if (/(WATT|TDP)$/i.test(key)) return value + ' W';
    if (/(_MM)$/i.test(key)) return value + ' mm';
    if (/(CAPACITY_GB|VRAM_GB)$/i.test(key)) return value + ' GB';
    if (/(SPEED_MHZ)$/i.test(key)) return value + ' MHz';
    return String(value);
  }
  return String(value);
}

export function buildSpecRows(product: any) {
  const categorySlug: string | undefined = product.category?.slug;
  if (!categorySlug) return [];
  const template = ATTRIBUTE_TEMPLATES[categorySlug];
  if (!template) return [];
  const rows: { label: string; value: string }[] = [];
  for (const field of template) {
    const found = product.attributes?.find((a: any) => a.attributeType?.key === field.key);
    const raw = field.valueType === 'STRING' ? found?.stringValue : found?.numberValue;
    rows.push({ label: field.label, value: formatAttributeValue(field.key, raw) });
  }
  return rows.filter(r => r.value && r.value !== '—');
}
