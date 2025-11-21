"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useState } from "react";
import type { Product } from "@/types/product";

export default function AddToCartButton({ product }: { product: Product }) {
  const dispatch = useDispatch<AppDispatch>();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    dispatch(
      addItemToCart({
        ...product,
        id: product.productId || String(product.id),
        title: product.title || "",
        price: product.price,
        discountedPrice: product.discountedPrice ?? product.price,
        quantity: 1,
        imgs: product.imgs || undefined,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="w-full flex flex-col items-center mt-8" style={{ position: 'relative', zIndex: 10 }}>
      <button
        onClick={handleAdd}
        className={`add-to-cart-btn w-full max-w-xs px-6 py-3 rounded-lg font-semibold text-base transition-colors shadow-lg ${product.stock === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{
          zIndex: 20,
          backgroundColor: '#22AD5C',
          color: '#fff',
          border: '2px solid #1A8245',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 2px 16px 0 rgba(13, 10, 44, 0.12)',
        }}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? "Hết hàng" : added ? "Đã thêm!" : "Add to Cart"}
      </button>
      {product.stock !== undefined && (
        <span className="text-xs text-gray-500 mt-2">Còn lại: {product.stock}</span>
      )}
    </div>
  );
}
