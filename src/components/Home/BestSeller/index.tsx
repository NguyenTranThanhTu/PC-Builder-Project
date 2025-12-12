import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductItem from "@/components/Common/ProductItem";
import { toUiProduct } from "@/lib/productAdapter";

import { formatVnd } from "@/lib/formatVnd";
function VnCurrency({ cents }: { cents: number }) {
  return <>{formatVnd(cents / 100)}</>;
}

// Adapter moved to src/lib/productAdapter.ts

export default async function BestSeller() {
  // Lấy các sản phẩm được gắn featured để hiển thị như Best Sellers
  const products = await prisma.product.findMany({
    where: { 
      featured: true,
      status: "PUBLISHED"
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { category: true },
  });

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600">Hiện chưa có sản phẩm nổi bật. Hãy bật &quot;Hiển thị trên trang chủ&quot; trong Admin.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {products.map((p) => (
              <ProductItem key={p.id} item={toUiProduct(p)} />
            ))}
          </div>
        )}

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
