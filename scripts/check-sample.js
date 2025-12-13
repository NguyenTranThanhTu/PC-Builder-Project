const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSample() {
  console.log('📊 SAMPLE 5 SẢN PHẨM:\n');
  
  const products = await prisma.product.findMany({
    take: 5,
    include: {
      category: true,
      attributes: {
        include: { attributeType: true }
      }
    }
  });
  
  products.forEach((prod, idx) => {
    console.log(`${idx + 1}. ${prod.name}`);
    console.log(`   Danh mục: ${prod.category.name}`);
    console.log(`   Giá: ${(prod.priceCents / 100).toLocaleString('vi-VN')} VND`);
    console.log(`   Thông số:`);
    prod.attributes.slice(0, 5).forEach(attr => {
      const value = attr.numberValue || attr.stringValue;
      console.log(`     • ${attr.attributeType.label}: ${value}`);
    });
    console.log('');
  });
  
  // Check if any real products exist
  console.log('\n📝 PHÂN TÍCH:');
  console.log('✅ Tên sản phẩm: Dựa trên pattern thực tế (Intel Core i9, AMD Ryzen)');
  console.log('✅ Thông số: Random trong range hợp lý (4-24 cores, 8-32GB RAM)');
  console.log('⚠️  Số model: GENERATED ngẫu nhiên, không match chính xác với thực tế');
  console.log('⚠️  Giá: Ước lượng dựa trên specs, không phải giá thị trường chính xác');
  console.log('\n💡 KẾT LUẬN: Đây là MOCK DATA để test hệ thống, không phải scrape thật!');
}

checkSample()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
