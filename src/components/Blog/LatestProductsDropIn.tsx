"use client";
import React, { useEffect, useState } from "react";
import LatestProducts from "./LatestProducts";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl?: string | null;
};

// Adapt live /api/products items to the shape expected by LatestProducts (template visuals preserved)
export default function LatestProductsDropIn({ limit = 3 }: { limit?: number }) {
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`/api/products?pageSize=${limit}&sort=createdAt&order=desc`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const mapped = (data.items as ApiProduct[]).map((p) => ({
          imgs: { thumbnails: [p.imageUrl || "/images/products/product-1-sm-1.png"] },
          productSlug: p.slug,
          title: p.name,
          price: Math.round((p.priceCents || 0) / 100),
        }));
        setItems(mapped);
      } catch (e: any) {
        setError(e.message || "Error");
        setItems([]);
      }
    };
    run();
  }, [limit]);

  if (!items) {
    // Keep layout stable but minimal while loading
    return (
      <div className="shadow-1 bg-white rounded-xl mt-7.5">
        <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
          <h2 className="font-medium text-lg text-dark">Latest Products</h2>
        </div>
        <div className="p-4 sm:p-6 text-xs text-gray-5">Đang tải...</div>
      </div>
    );
  }

  // Reuse original presentation for exact look
  return <LatestProducts products={items} />;
}
