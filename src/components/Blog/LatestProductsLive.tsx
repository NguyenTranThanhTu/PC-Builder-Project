"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
};

export default function LatestProductsLive({ limit = 5 }: { limit?: number }) {
  const [items, setItems] = useState<ProductLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?pageSize=${limit}&sort=createdAt&order=desc`, { cache: "no-store" });
        if (!res.ok) throw new Error("Không tải được sản phẩm");
        const data = await res.json();
        const list: ProductLite[] = (data.items || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price ?? 0),
          image: p.images?.[0]?.url || p.image || null,
        }));
        setItems(list);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [limit]);

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Latest Products</h2>
      </div>
      <div className="p-4 sm:p-6">
        {loading && <p className="text-xs text-gray-500">Đang tải...</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-xs">Không có sản phẩm.</p>}
        <ul className="flex flex-col gap-4">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {p.image ? (
                  <Image src={p.image} alt={p.name} width={48} height={48} className="object-cover w-12 h-12" />
                ) : (
                  <span className="text-[10px] text-gray-500">IMG</span>
                )}
              </div>
              <div className="min-w-0">
                <a href={`/shop/${p.slug}`} className="block text-xs font-medium line-clamp-2 hover:text-blue-600">
                  {p.name}
                </a>
                <div className="text-[11px] text-primary font-semibold">{p.price.toLocaleString()} ₫</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}