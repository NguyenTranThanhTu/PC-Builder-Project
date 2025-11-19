import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductSpecsTable from '@/components/ShopDetails/ProductSpecsTable';
import CompatibilityAssistant from '@/components/ShopDetails/CompatibilityAssistant';
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

  return (
    <main className="max-w-[1000px] mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2">
          <div className="bg-gray-2 rounded-lg p-4 shadow-1 flex items-center justify-center">
            <Image
              src={product.imageUrl || '/images/products/product-1-sm-1.png'}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        </div>
        <div className="md:w-1/2">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">{product.description || 'Chưa có mô tả chi tiết.'}</p>
          <div className="text-xl font-bold mb-6">{price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
          <ProductSpecsTable product={product} />
        </div>
      </div>
      {specRows.length === 0 && (
        <div className="mt-8 text-sm text-gray-500">Không có thông số chi tiết cho sản phẩm này.</div>
      )}
      <CompatibilityAssistant productId={product.id} productName={product.name} />
    </main>
  );
}
