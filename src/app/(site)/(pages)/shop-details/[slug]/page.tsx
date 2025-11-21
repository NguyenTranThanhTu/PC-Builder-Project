import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductDetailClient from '@/components/ShopDetails/ProductDetailClient';
import ProductSpecsTable from '@/components/ShopDetails/ProductSpecsTable';
import RelatedProducts from '@/components/ShopDetails/RelatedProducts';
import { formatAttributeValue, buildSpecRows } from '@/lib/productAdapter';
import { Metadata } from 'next';

export const revalidate = 60; // detail page ISR

// Relax typing to satisfy Next 15 dynamic params (may be Promise internally)
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, select: { name: true, description: true } });
  if (!product) return { title: 'Sản phẩm không tồn tại' };
  return { title: product.name, description: product.description || undefined };
}

export default async function ProductDetailPage({ params }: any) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { slug: true, name: true } },
      attributes: { include: { attributeType: { select: { key: true, valueType: true } } } },
      reviews: { select: { rating: true } }
    }
  });
  if (!product || product.status !== 'PUBLISHED' || product.archivedAt) return notFound();

  const price = product.priceCents / 100;
  const specRows = buildSpecRows(product);


  // Lấy các thuộc tính kỹ thuật chính của sản phẩm hiện tại
  const mainAttrKeys = (product.attributes || []).map(a => a.attributeType?.key).filter(Boolean);
  // Lấy các sản phẩm liên quan cùng danh mục, loại trừ chính sản phẩm này, ưu tiên có thuộc tính kỹ thuật trùng
  const related = await prisma.product.findMany({
    where: {
      category: { slug: product.category.slug },
      status: 'PUBLISHED',
      archivedAt: null,
      NOT: { id: product.id },
      attributes: {
        some: {
          attributeType: {
            key: { in: mainAttrKeys.length > 0 ? mainAttrKeys : undefined }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
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
    price: typeof p.priceCents === 'number' ? p.priceCents / 100 : 0,
    imageUrl: p.imageUrl || '',
  }));

  return (
    <main className="max-w-[1000px] mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2">
          <div className="bg-gray-2 rounded-lg p-4 shadow-1 flex items-center justify-center min-h-[320px]">
            <Image
              src={product.imageUrl || '/images/products/product-1-sm-1.png'}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain w-full h-auto max-h-[500px]"
              sizes="(max-width: 768px) 100vw, 500px"
              style={{ maxWidth: '100%', height: 'auto' }}
              priority
            />
          </div>
        </div>
        <div className="md:w-1/2">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">{product.description || 'Chưa có mô tả chi tiết.'}</p>
          <div className="text-xl font-bold mb-6">{price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          <ProductSpecsTable product={product} />
          <ProductDetailClient product={{
            title: product.name,
            id: String(product.id),
            productId: String(product.id),
            productSlug: product.slug,
            price: price,
            discountedPrice: price, // adjust if you have discount logic
            imgs: product.imgs && product.imgs.thumbnails && product.imgs.thumbnails.length > 0
              ? product.imgs
              : { thumbnails: [product.imageUrl || '/images/products/product-1-sm-1.png'], previews: [] },
            stock: product.stock,
            imageUrl: product.imageUrl,
            description: product.description,
          }} />
        </div>
      </div>
      {specRows.length === 0 && (
        <div className="mt-8 text-sm text-gray-500">Không có thông số chi tiết cho sản phẩm này.</div>
      )}
      <RelatedProducts products={relatedProducts} />
    </main>
  );
}
