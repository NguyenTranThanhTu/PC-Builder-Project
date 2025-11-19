export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  // Optional: real DB id for checkout & server API mapping
  productId?: string;
  // Optional: slug để điều hướng trang chi tiết động /shop/[slug]
  productSlug?: string;
  // Optional: tóm tắt thông số chính để hiển thị ở listing (ví dụ 8C/16T · 4.2-5.6GHz)
  specSummary?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
