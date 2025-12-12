"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateproductDetails } from "@/redux/features/product-details";

export default function RelatedProducts({ products }: { products: any[] }) {
  const router = useRouter();
  const dispatch = useDispatch();

  if (!products || products.length === 0) return null;

  const handleProductClick = (product: any) => {
    // Update Redux state for the new product
    dispatch(updateproductDetails({
      id: product.id,
      title: product.title,
      price: product.price,
      productImg: product.imageUrl,
      images: [product.imageUrl],
      rating: 5,
      reviews: 0,
    }));
    
    // Navigate to product detail page
    router.push(`/shop/${product.productSlug}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            onClick={() => handleProductClick(item)}
            className="group cursor-pointer bg-gray-1 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-blue"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-white p-3">
              <Image
                src={item.imageUrl || "/images/products/product-01.jpg"}
                alt={item.title}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Product Info */}
            <div className="p-3 space-y-2">
              <h3 className="text-sm font-medium text-dark line-clamp-2 group-hover:text-blue transition-colors min-h-[40px]">
                {item.title}
              </h3>
              
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-blue">
                  {item.price.toLocaleString("vi-VN")}đ
                </span>
              </div>

              {/* View Details Link - Hidden until hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/shop/${item.productSlug}`}
                  className="block w-full text-center bg-blue text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-dark transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
