"use client";
import ProductSpecsTable from "@/components/ShopDetails/ProductSpecsTable";
import AddToCartButton from "@/components/ShopDetails/AddToCartButton";
import type { Product } from "@/types/product";

export default function ProductDetailClient({ product }: { product: Product }) {
  return <AddToCartButton product={product} />;
}
