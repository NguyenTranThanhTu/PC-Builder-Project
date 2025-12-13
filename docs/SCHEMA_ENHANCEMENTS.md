# Schema Enhancement - Chuẩn bị cào data

## ⚠️ CẦN BỔ SUNG - Fields quan trọng thiếu

### 1. 🏷️ Brand & Manufacturer (Thiếu - CẦN THÊM!)

**Vấn đề hiện tại:**
```typescript
// Product model KHÔNG có field brand/manufacturer
model Product {
  id: string
  name: string  // "Intel Core i5-13600K" - phải parse từ name
  // ❌ THIẾU: brand
  // ❌ THIẾU: manufacturer  
}
```

**Tại sao cần:**
1. **Filter by brand**: User muốn lọc "Chỉ CPU Intel" hoặc "Chỉ GPU NVIDIA"
2. **Brand recommendations**: "Người mua X cũng mua Y từ cùng hãng"
3. **Price comparison**: So sánh giá các brand
4. **Scraping efficiency**: Không cần parse từ name mỗi lần

**Đề xuất thêm:**
```prisma
model Product {
  // ... existing fields
  brand         String?  // "Intel", "AMD", "ASUS", "Corsair"
  manufacturer  String?  // "ASUS ROG", "MSI Gaming", "Corsair Vengeance"
  modelNumber   String?  // "ROG-STRIX-RTX4090-O24G-GAMING"
  sku           String?  // SKU từ website nguồn
  sourceUrl     String?  // URL gốc để update giá
}
```

---

### 2. 📦 Product Variants (Tùy chọn - Có thể cần)

**Ví dụ:**
```
GPU: RTX 4090
├── ASUS ROG Strix (25tr)
├── MSI Gaming X Trio (24tr)  
├── Gigabyte Gaming OC (23tr)
└── Zotac Trinity (22tr)
```

Hiện tại: Lưu mỗi variant như **product riêng** → OK!
Không cần ProductVariant model phức tạp.

---

### 3. 🔗 External References (Nên có)

**Để update giá tự động:**
```prisma
model Product {
  sourceUrl     String?  // URL nguồn để re-scrape
  externalId    String?  // ID từ Tiki/Shopee (nếu có)
  lastScraped   DateTime? // Lần cuối cào data
  priceHistory  Json?    // [{ date, price }] để track giá
}
```

---

### 4. 📊 SEO & Marketing (Nên có)

```prisma
model Product {
  metaTitle       String?  // SEO title
  metaDescription String?  // SEO description
  tags            String[] // ["gaming", "high-end", "rgb"]
  warranty        String?  // "24 tháng", "36 tháng"
  condition       String?  // "New", "Refurbished"
}
```

---

### 5. 📸 Multiple Images (CẦN THÊM!)

**Vấn đề hiện tại:**
```prisma
model Product {
  imageUrl      String?  // ❌ CHỈ 1 ẢNH
  imageBlurData String?
}
```

**Tại sao cần nhiều ảnh:**
- Product detail page cần gallery (4-8 ảnh)
- Ảnh từ nhiều góc độ
- Ảnh specs, ảnh trong box...

**Đề xuất:**
```prisma
model ProductImage {
  id            String   @id @default(cuid())
  productId     String
  url           String
  blurData      String?
  altText       String?
  order         Int      @default(0)
  isPrimary     Boolean  @default(false)
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
  @@index([productId, order])
}

model Product {
  // ... existing
  images ProductImage[]
  
  // DEPRECATED (keep for backward compat):
  imageUrl      String?
  imageBlurData String?
}
```

---

### 6. 💾 Stock Management (Nên cải thiện)

**Hiện tại:**
```prisma
model Product {
  stock Int @default(0)  // ✅ Đã có
  status ProductStatus   // DRAFT, PUBLISHED, ARCHIVED
}
```

**Bổ sung thêm:**
```prisma
enum ProductStatus {
  DRAFT
  PUBLISHED
  OUT_OF_STOCK      // ← THÊM
  DISCONTINUED      // ← THÊM  
  ARCHIVED
}

model Product {
  stock           Int       @default(0)
  lowStockThreshold Int?    // Cảnh báo khi stock < threshold
  restockDate     DateTime? // Ngày dự kiến có hàng trở lại
}
```

---

### 7. 🏆 Product Metrics (Nên có)

**Để ranking & recommendations:**
```prisma
model Product {
  viewCount     Int @default(0)       // Số lượt xem
  purchaseCount Int @default(0)       // Số lượt mua
  wishlistCount Int @default(0)       // Số lượt wishlist
  avgRating     Float?                // Trung bình rating
  
  @@index([viewCount])
  @@index([purchaseCount])
  @@index([avgRating])
}
```

---

## 🎯 Ưu tiên bổ sung

### ✅ Tier 1: BẮT BUỘC (Trước khi cào)
```prisma
model Product {
  // 1. Brand info - QUAN TRỌNG
  brand         String?
  manufacturer  String?
  modelNumber   String?
  
  // 2. Source tracking - Update giá sau này
  sourceUrl     String?
  lastScraped   DateTime?
  
  // 3. OUT_OF_STOCK status
  status        ProductStatus  // Add OUT_OF_STOCK, DISCONTINUED
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  OUT_OF_STOCK      // ← ADD
  DISCONTINUED      // ← ADD
  ARCHIVED
}
```

### ⚠️ Tier 2: NÊN CÓ (Có thể thêm sau)
```prisma
model Product {
  // Multiple images
  images ProductImage[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Metrics
  viewCount       Int @default(0)
  purchaseCount   Int @default(0)
  
  // Warranty
  warranty        String?
}

model ProductImage { /* ... */ }
```

### 🔵 Tier 3: TỐT NẾU CÓ (Optional)
```prisma
model Product {
  tags            String[]
  priceHistory    Json?
  externalId      String?
  lowStockThreshold Int?
  restockDate     DateTime?
  condition       String?
}
```

---

## 📝 Migration Script

### File: `prisma/migrations/add-scraping-fields.sql`

```sql
-- Add brand and manufacturer fields
ALTER TABLE "Product" ADD COLUMN "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN "manufacturer" TEXT;
ALTER TABLE "Product" ADD COLUMN "modelNumber" TEXT;

-- Add source tracking
ALTER TABLE "Product" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "Product" ADD COLUMN "lastScraped" TIMESTAMP(3);

-- Add metrics
ALTER TABLE "Product" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "purchaseCount" INTEGER NOT NULL DEFAULT 0;

-- Add SEO fields
ALTER TABLE "Product" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN "warranty" TEXT;

-- Create indexes for filtering
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_manufacturer_idx" ON "Product"("manufacturer");
CREATE INDEX "Product_viewCount_idx" ON "Product"("viewCount");
CREATE INDEX "Product_purchaseCount_idx" ON "Product"("purchaseCount");

-- Update ProductStatus enum (manual in schema.prisma)
-- Add OUT_OF_STOCK and DISCONTINUED to enum
```

---

## 🔧 Updated Schema

### File: `prisma/schema.prisma` (Updated section)

```prisma
enum ProductStatus {
  DRAFT
  PUBLISHED
  OUT_OF_STOCK
  DISCONTINUED
  ARCHIVED
}

model Product {
  id            String             @id @default(uuid())
  name          String
  slug          String             @unique
  description   String?
  priceCents    Int
  stock         Int                @default(0)
  
  // Images (backward compatible)
  imageUrl      String?
  imageBlurData String?
  images        ProductImage[]
  
  // Status
  featured      Boolean            @default(false)
  status        ProductStatus      @default(DRAFT)
  archivedAt    DateTime?
  
  // Brand & Manufacturer - NEW
  brand         String?
  manufacturer  String?
  modelNumber   String?
  
  // Source tracking - NEW
  sourceUrl     String?
  lastScraped   DateTime?
  
  // SEO - NEW
  metaTitle       String?
  metaDescription String?
  warranty        String?
  
  // Metrics - NEW
  viewCount     Int                @default(0)
  purchaseCount Int                @default(0)
  
  // Relations
  categoryId    String
  category      Category           @relation(fields: [categoryId], references: [id])
  attributes    ProductAttribute[]
  orderItems    OrderItem[]
  reviews       Review[]
  
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  // Indexes
  @@index([categoryId])
  @@index([status])
  @@index([createdAt])
  @@index([priceCents])
  @@index([status, categoryId, createdAt])
  @@index([brand])                    // NEW
  @@index([manufacturer])             // NEW
  @@index([viewCount])                // NEW
  @@index([purchaseCount])            // NEW
}

// NEW: Multiple images support
model ProductImage {
  id            String   @id @default(cuid())
  productId     String
  url           String
  blurData      String?
  altText       String?
  order         Int      @default(0)
  isPrimary     Boolean  @default(false)
  
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  
  @@index([productId])
  @@index([productId, order])
  @@index([productId, isPrimary])
}
```

---

## 🚀 Implementation Steps

### Step 1: Update Schema (5 phút)
```bash
# Edit prisma/schema.prisma
# Add new fields as shown above
```

### Step 2: Create Migration (2 phút)
```bash
npx prisma migrate dev --name add_scraping_fields
```

### Step 3: Update Seed Scripts (10 phút)
```typescript
// prisma/seed-demo.cjs
await prisma.product.create({
  data: {
    name: "Intel Core i5-13600K",
    brand: "Intel",              // ← NEW
    manufacturer: "Intel",        // ← NEW
    modelNumber: "BX8071513600K", // ← NEW
    sourceUrl: "https://...",     // ← NEW
    warranty: "36 tháng",         // ← NEW
    // ... rest
  }
});
```

### Step 4: Update Scraper Template (15 phút)
```typescript
// prisma/scrapers/scrape-product.js
async function scrapeProduct(url) {
  const data = await fetchProductPage(url);
  
  return {
    name: data.title,
    brand: extractBrand(data),           // ← NEW
    manufacturer: extractManufacturer(data), // ← NEW
    modelNumber: extractModelNumber(data),   // ← NEW
    sourceUrl: url,                      // ← NEW
    lastScraped: new Date(),             // ← NEW
    warranty: extractWarranty(data),     // ← NEW
    // ...
  };
}
```

### Step 5: Update Admin Panel (20 phút)
```typescript
// Show brand, manufacturer in product form
<Input label="Brand" name="brand" />
<Input label="Manufacturer" name="manufacturer" />
<Input label="Model Number" name="modelNumber" />
<Input label="Warranty" name="warranty" />
```

---

## 📊 Data Structure Examples

### CPU Product:
```json
{
  "name": "Intel Core i5-13600K",
  "brand": "Intel",
  "manufacturer": "Intel",
  "modelNumber": "BX8071513600K",
  "slug": "intel-core-i5-13600k",
  "priceCents": 799000000,
  "stock": 15,
  "status": "PUBLISHED",
  "sourceUrl": "https://tiki.vn/...",
  "lastScraped": "2025-12-12T10:00:00Z",
  "warranty": "36 tháng",
  "metaTitle": "CPU Intel Core i5-13600K - 14 nhân 20 luồng",
  "viewCount": 156,
  "purchaseCount": 23,
  "attributes": [
    { "key": "CPU_BRAND", "stringValue": "Intel" },
    { "key": "CPU_SOCKET", "stringValue": "LGA1700" },
    { "key": "CPU_CORES", "numberValue": 14 }
  ]
}
```

### GPU Product:
```json
{
  "name": "ASUS ROG Strix GeForce RTX 4090 OC",
  "brand": "NVIDIA",
  "manufacturer": "ASUS ROG",
  "modelNumber": "ROG-STRIX-RTX4090-O24G-GAMING",
  "slug": "asus-rog-strix-rtx-4090-oc-24gb",
  "priceCents": 5999000000,
  "stock": 3,
  "status": "PUBLISHED",
  "sourceUrl": "https://gearvn.com/...",
  "warranty": "36 tháng",
  "images": [
    { "url": "/uploads/gpu-1.webp", "isPrimary": true, "order": 0 },
    { "url": "/uploads/gpu-2.webp", "isPrimary": false, "order": 1 },
    { "url": "/uploads/gpu-3.webp", "isPrimary": false, "order": 2 }
  ]
}
```

---

## ✅ Checklist trước khi cào data

### Schema Updates:
- [ ] Add brand, manufacturer, modelNumber fields
- [ ] Add sourceUrl, lastScraped fields
- [ ] Add OUT_OF_STOCK, DISCONTINUED to ProductStatus enum
- [ ] Create ProductImage model (optional but recommended)
- [ ] Add warranty, metaTitle, metaDescription
- [ ] Add viewCount, purchaseCount metrics
- [ ] Run migration: `npx prisma migrate dev`

### Indexes:
- [ ] Index on brand
- [ ] Index on manufacturer
- [ ] Index on viewCount, purchaseCount
- [ ] Index on (productId, order) for images

### Admin Panel:
- [ ] Add brand field to product form
- [ ] Add manufacturer field
- [ ] Add warranty field
- [ ] Add multiple image upload (if using ProductImage)

### Scraper Preparation:
- [ ] Extract brand logic
- [ ] Extract manufacturer logic
- [ ] Extract model number logic
- [ ] Extract warranty info
- [ ] Save sourceUrl for re-scraping
- [ ] Handle multiple images

---

## 🎯 Kết luận

**CẦN BỔ SUNG trước khi cào:**

1. ✅ **Brand & Manufacturer** - Bắt buộc cho filtering
2. ✅ **Source URL** - Cần cho update giá sau này
3. ✅ **OUT_OF_STOCK status** - Quản lý hàng hóa tốt hơn
4. ⚠️ **ProductImage model** - Nên có cho UX tốt hơn
5. ⚠️ **Warranty** - Thông tin quan trọng với khách
6. 🔵 **Metrics** - Tốt nếu có (viewCount, purchaseCount)

**Timeline**: 30-45 phút để hoàn thành migration và update code!
