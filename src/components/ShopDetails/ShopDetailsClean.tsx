"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { formatVnd } from "@/lib/formatVnd";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ShopDetailsCleanProps {
  product: any;
}

export default function ShopDetailsClean({ product }: ShopDetailsCleanProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();

  // Product images - use imageUrl from database
  const images = [product.imageUrl].filter(Boolean);

  // Check stock status
  const stockQuantity = product.stock ?? 0;
  const isOutOfStock = stockQuantity <= 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    const priceInVnd = originalPrice;
    const discountPriceInVnd = discountedPrice;
    
    dispatch(
      addItemToCart({
        id: product.id,
        productId: product.id,
        title: product.name,
        price: priceInVnd,
        discountedPrice: discountPriceInVnd,
        quantity,
        imgs: {
          thumbnails: [product.imageUrl || "/images/products/product-01.jpg"],
          previews: [product.imageUrl || "/images/products/product-01.jpg"],
        },
      })
    );
  };

  const handlePurchaseNow = async () => {
    if (isOutOfStock) return;
    
    if (!session) {
      router.push("/auth/signin?callbackUrl=/checkout");
      return;
    }

    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    router.push("/checkout");
  };

  if (!product || !product.id) {
    return (
      <div className="py-20 text-center">
        <p className="text-dark-5">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const originalPrice = product.priceCents / 100;
  const discountedPrice = product.discountedPriceCents ? product.discountedPriceCents / 100 : originalPrice;
  const discount = product.discountedPriceCents
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  return (
    <section className="overflow-hidden pt-50 pb-12 bg-gray-2">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Left: Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-1 rounded-xl overflow-hidden group">
                <Image
                  src={images[selectedImage] || "/images/products/product-01.jpg"}
                  alt={product.name}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{discount}%
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red text-white px-6 py-3 rounded-lg text-lg font-bold">
                      HẾT HÀNG
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square bg-gray-1 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? "border-blue scale-105"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-dark mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.averageRating || 0)
                            ? "fill-yellow"
                            : "fill-gray-300"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-dark-5 ml-2">
                      ({product.reviewCount || 0} đánh giá)
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <span className={`text-sm font-medium ${isOutOfStock ? "text-red" : "text-green"}`}>
                    {isOutOfStock ? "Hết hàng" : `Còn ${stockQuantity} sản phẩm`}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-blue-light-6 p-6 rounded-xl">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-blue">
                    {formatVnd(discountedPrice)}
                  </span>
                  {discount > 0 && (
                    <span className="text-xl text-dark-4 line-through">
                      {formatVnd(originalPrice)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-sm text-dark-5 mt-2">
                    Tiết kiệm {formatVnd(originalPrice - discountedPrice)}
                  </p>
                )}
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm font-semibold text-dark mb-3">
                  Số lượng
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-3 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-4 py-3 bg-gray-1 hover:bg-gray-2 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1 || isOutOfStock}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stockQuantity, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center py-3 border-x-2 border-gray-3 font-semibold disabled:opacity-50"
                      min="1"
                      max={stockQuantity}
                      disabled={isOutOfStock}
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-4 py-3 bg-gray-1 hover:bg-gray-2 transition-colors disabled:opacity-50"
                      disabled={quantity >= stockQuantity || isOutOfStock}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {!isOutOfStock && (
                    <span className="text-sm text-dark-5">
                      Tổng: <span className="font-bold text-dark">{formatVnd(discountedPrice * quantity)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePurchaseNow}
                  disabled={isOutOfStock}
                  className="w-full bg-blue text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {isOutOfStock ? "Hết hàng" : "Mua ngay"}
                  </span>
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full bg-white text-blue py-4 rounded-lg font-semibold border-2 border-blue hover:bg-blue-light-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  </span>
                </button>
              </div>

              {/* Product Features */}
              <div className="bg-gray-1 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-dark">Miễn phí giao hàng cho đơn từ 500.000đ</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-dark">Bảo hành chính hãng 12 tháng</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-dark">Đổi trả trong 7 ngày nếu có lỗi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
