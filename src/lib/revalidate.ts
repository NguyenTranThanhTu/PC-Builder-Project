"use server";
import { revalidatePath } from "next/cache";

// Centralized ISR revalidation for product-related pages (Server Actions must be async)
export async function revalidateProductListing() {
  revalidatePath("/shop-with-sidebar");
  revalidatePath("/shop-without-sidebar");
  revalidatePath("/");
}

export async function revalidateProductDetail(slug: string) {
  if (!slug) return;
  revalidatePath(`/shop-details/${slug}`);
}

export async function revalidateAfterProductChange(slug?: string) {
  await revalidateProductListing();
  if (slug) await revalidateProductDetail(slug);
}
