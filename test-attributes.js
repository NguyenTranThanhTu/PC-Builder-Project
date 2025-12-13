// Test script để kiểm tra attributes trong DB
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Kiểm tra Attributes trong Database...\n');
  
  // 1. Kiểm tra tổng số AttributeTypes
  const attrTypes = await prisma.attributeType.findMany({
    orderBy: { key: 'asc' }
  });
  console.log(`📊 Tổng số AttributeTypes: ${attrTypes.length}`);
  
  // Group by category
  const byCategory = {};
  attrTypes.forEach(at => {
    const cat = at.categorySlug || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(at.key);
  });
  
  console.log('\n📂 AttributeTypes theo category:');
  Object.entries(byCategory).forEach(([cat, keys]) => {
    console.log(`  ${cat}: ${keys.length} attributes`);
    console.log(`    ${keys.join(', ')}`);
  });
  
  // 2. Kiểm tra products có attributes
  const productsWithAttrs = await prisma.product.findMany({
    where: {
      attributes: {
        some: {}
      }
    },
    include: {
      category: { select: { name: true, slug: true } },
      attributes: {
        include: {
          attributeType: { select: { key: true, label: true } }
        }
      }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log(`\n📦 Sản phẩm có attributes: ${productsWithAttrs.length}/5 (mẫu)\n`);
  
  productsWithAttrs.forEach(p => {
    console.log(`\n✅ ${p.name} (${p.category?.name || 'No category'})`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Số attributes: ${p.attributes.length}`);
    p.attributes.forEach(a => {
      const value = a.stringValue || a.numberValue || 'null';
      console.log(`     - ${a.attributeType.label} (${a.attributeType.key}): ${value}`);
    });
  });
  
  // 3. Kiểm tra CPU_CACHE_MB cụ thể
  console.log('\n\n🔎 Tìm kiếm CPU_CACHE_MB trong database...');
  const cpuCacheType = await prisma.attributeType.findUnique({
    where: { key: 'CPU_CACHE_MB' }
  });
  
  if (cpuCacheType) {
    console.log(`✅ AttributeType CPU_CACHE_MB tồn tại: ${cpuCacheType.label}`);
    
    const productsWithCache = await prisma.productAttribute.findMany({
      where: {
        attributeTypeId: cpuCacheType.id,
        numberValue: { not: null }
      },
      include: {
        product: { select: { name: true } }
      }
    });
    
    console.log(`   Số sản phẩm có cache data: ${productsWithCache.length}`);
    productsWithCache.forEach(pa => {
      console.log(`   - ${pa.product.name}: ${pa.numberValue} MB`);
    });
  } else {
    console.log('❌ AttributeType CPU_CACHE_MB KHÔNG tồn tại!');
  }
  
  // 4. Kiểm tra sản phẩm mới nhất
  console.log('\n\n📅 5 sản phẩm mới nhất:');
  const latest = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      category: { select: { name: true } },
      _count: { select: { attributes: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  latest.forEach(p => {
    console.log(`  - ${p.name} (${p.category?.name}) - ${p._count.attributes} attrs - ${p.createdAt.toLocaleString()}`);
  });
}

main()
  .catch(e => {
    console.error('❌ Lỗi:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
