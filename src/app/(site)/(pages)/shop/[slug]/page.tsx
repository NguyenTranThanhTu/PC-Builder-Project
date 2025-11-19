import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toUiProduct } from "@/lib/productAdapter";
import ShopDetails from "@/components/ShopDetails";
import HydrateProduct from "@/components/ShopDetails/HydrateProduct";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
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

  // Chỉ lấy các trường tối thiểu cho UI để giảm payload
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      imageBlurData: true,
      _count: { select: { reviews: true } },
    },
  });

  if (!product) return notFound();

  const uiProduct = toUiProduct(product);

  return (
    <main>
      <HydrateProduct item={uiProduct as any} />
      <ShopDetails />
    </main>
  );
}

export const revalidate = 300; // Cache chi tiết sản phẩm 5 phút để tăng tốc truy cập lặp

// Pre-build trước một số trang chi tiết phổ biến để tăng tốc lần truy cập đầu
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
