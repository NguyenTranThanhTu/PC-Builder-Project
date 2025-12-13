import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toUiProduct, buildSpecRows } from "@/lib/productAdapter";
import ShopDetailsClean from "@/components/ShopDetails/ShopDetailsClean";
import HydrateProduct from "@/components/ShopDetails/HydrateProduct";
import UnifiedProductDetail from "@/components/ShopDetails/UnifiedProductDetail";
import RelatedProducts from "@/components/ShopDetails/RelatedProducts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { name: true, description: true },
    });
    if (!product) return { title: "Product Not Found" };
    return {
      title: `${product.name} | Product Details`,
      description: product.description || "Product details",
    };
  } catch {
    return { title: "Product Details" };
  }
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // Fetch full product data with specs and reviews
  const product = await prisma.product.findFirst({
    where: { 
      slug,
      status: "PUBLISHED"
    },
    include: {
      category: { select: { slug: true, name: true } },
      attributes: { 
        include: { 
          attributeType: { select: { key: true, label: true, valueType: true } } 
        } 
      },
      reviews: {
        where: { status: "APPROVED" }, // Chỉ hiển thị đánh giá đã duyệt
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              vipTier: true,
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) return notFound();

  // Build spec rows
  const specRows = buildSpecRows(product);

  // Calculate review stats
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  product.reviews.forEach(r => {
    distribution[r.rating as keyof typeof distribution]++;
  });

  const reviewStats = {
    averageRating,
    totalReviews,
    distribution,
  };

  // Format reviews for component
  const formattedReviews = product.reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    userId: r.userId,
    user: {
      name: r.user.name || "Anonymous",
      image: r.user.image,
      vipTier: r.user.vipTier,
    },
    verifiedPurchase: r.verifiedPurchase,
    helpfulCount: r.helpfulCount,
    images: r.images || [],
    adminReply: r.adminReply || null,
    adminReplyAt: r.adminReplyAt?.toISOString() || null,
  }));

  // Fetch related products
  const mainAttrKeys = product.attributes.map(a => a.attributeType?.key).filter(Boolean);
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'PUBLISHED',
      NOT: { id: product.id },
      ...(mainAttrKeys.length > 0 && {
        attributes: {
          some: {
            attributeType: {
              key: { in: mainAttrKeys }
            }
          }
        }
      }),
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      imageUrl: true,
    },
  });

  const relatedProducts = related.map((p) => ({
    id: p.id,
    title: p.name,
    productSlug: p.slug,
    price: p.priceCents / 100,
    imageUrl: p.imageUrl || '',
  }));

  const uiProduct = toUiProduct(product);

  // Add reviewCount for ShopDetailsClean component
  const productWithCount = {
    ...product,
    reviewCount: product._count?.reviews || 0,
  };

  return (
    <main>
      <HydrateProduct item={uiProduct as any} />
      <ShopDetailsClean product={productWithCount} />
      
      {/* Unified tabs: Description, Specs, Reviews */}
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pb-20">
        <UnifiedProductDetail
          product={product}
          specRows={specRows}
          reviews={formattedReviews}
          reviewStats={reviewStats}
          currentUserId={session?.user?.id}
        />
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-dark mb-6">Sản phẩm liên quan</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </main>
  );
}

export const revalidate = 300; // Cache chi tiết sản phẩm 5 phút để tăng tốc truy cập lặp

// Pre-build trước một số trang chi tiết phổ biến để tăng tốc lần truy cập đầu
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
