"use client";

import Link from "next/link";
import Image from "next/image";

export default function RelatedProducts({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;
  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold mb-4 text-green">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <Image
              src={item.imageUrl || "/images/products/product-1-sm-1.png"}
              alt={item.title}
              width={160}
              height={160}
              className="object-contain mb-2"
            />
            <div className="font-medium text-center mb-1 line-clamp-2">{item.title}</div>
            <div className="text-green font-semibold mb-2">{item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
            <div className="flex flex-col w-full gap-2 mt-auto">
              <Link
                href={`/shop-details/${item.productSlug}`}
                className="inline-block px-4 py-2 bg-green text-white rounded hover:bg-green-dark text-sm text-center"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
