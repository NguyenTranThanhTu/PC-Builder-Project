"use server";
import { revalidatePath } from "next/cache";

// Centralized ISR revalidation for product-related pages (Server Actions must be async)
export async function revalidateProductListing() {
  revalidatePath("/", "page"); // Homepage
  revalidatePath("/shop-with-sidebar", "page");
  revalidatePath("/shop-without-sidebar", "page");
  revalidatePath("/shop", "layout"); // All shop pages
}

export async function revalidateProductDetail(slug: string) {
  if (!slug) return;
  revalidatePath(`/shop/${slug}`);
}

export async function revalidateAfterProductChange(slug?: string) {
  // Revalidate all product listing pages
  await revalidateProductListing();
  
  // Revalidate specific product detail page
  if (slug) await revalidateProductDetail(slug);
}
