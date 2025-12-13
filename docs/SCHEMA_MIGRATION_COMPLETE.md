# Schema Enhancement Complete - Ready for Data Scraping

## ✅ Migration Completed: `20251212102319_add_scraping_essential_fields`

### New Fields Added to Product Model

#### 1. **Brand & Manufacturer Tracking**
```typescript
brand: string | null          // "Intel", "AMD", "ASUS", "Corsair"
manufacturer: string | null   // "ASUS ROG", "MSI Gaming", "Intel Boxed"
modelNumber: string | null    // "INTELBOXED-7120", "ASUSROG-4892"
```

**Use Cases:**
- **Filter by brand**: Show all Intel CPUs, AMD GPUs, etc.
- **Group by manufacturer**: ASUS ROG vs ASUS TUF series
- **Unique identification**: Model number for warranty lookup

**Indexes:** `brand`, `manufacturer` for fast filtering

---

#### 2. **Source Tracking for Re-scraping**
```typescript
sourceUrl: string | null      // Original product URL
lastScraped: DateTime | null  // Last time data was updated
```

**Use Cases:**
- **Price updates**: Re-scrape prices automatically
- **Stock monitoring**: Check availability changes
- **Data freshness**: Know when product info was last updated

---

#### 3. **SEO & Marketing**
```typescript
metaTitle: string | null       // SEO title (50-60 chars)
metaDescription: string | null // SEO description (150-160 chars)
warranty: string | null        // "12 tháng", "24 tháng", "36 tháng"
```

**Use Cases:**
- **Search engine optimization**: Better Google rankings
- **Customer confidence**: Warranty info visible on listings
- **Marketing**: Pre-built meta descriptions

---

#### 4. **Product Metrics**
```typescript
viewCount: number      // Default: 0
purchaseCount: number  // Default: 0
```

**Use Cases:**
- **Popular products**: Sort by most viewed/purchased
- **Recommendations**: Suggest trending items
- **Analytics**: Track product performance

**Indexes:** `viewCount`, `purchaseCount` for sorting/ranking

---

#### 5. **Enhanced Product Status**
```typescript
enum ProductStatus {
  DRAFT          // Not published yet
  PUBLISHED      // Visible to customers
  OUT_OF_STOCK   // ✨ NEW: Temporarily unavailable
  DISCONTINUED   // ✨ NEW: No longer sold
  ARCHIVED       // Soft-deleted
}
```

**Use Cases:**
- **Inventory management**: Auto-mark OUT_OF_STOCK when stock = 0
- **Product lifecycle**: Mark DISCONTINUED for old products
- **Customer UX**: Show "Out of Stock" badge instead of hiding product

---

#### 6. **Multiple Images Support**
```typescript
model ProductImage {
  id         String   // Unique ID
  productId  String   // Foreign key to Product
  url        String   // Image URL or path
  blurData   String?  // BlurHash for lazy loading
  altText    String?  // Alt text for SEO
  order      Int      // Display order (0, 1, 2...)
  isPrimary  Boolean  // Main product image
  createdAt  DateTime
}
```

**Use Cases:**
- **Product galleries**: Show 4-8 images per product
- **Image carousel**: Swipe through product images
- **Primary image**: First image shown in listings
- **Better UX**: Multiple angles/views of product

**Indexes:**
- `productId, order` for sorted retrieval
- `productId, isPrimary` for finding main image

---

## 📊 Database Schema Summary

### Current Product Model (Complete)
```prisma
model Product {
  // Basic Info
  id, name, slug, description
  priceCents, stock
  imageUrl, imageBlurData  // Legacy single image
  featured, status, archivedAt
  
  // ✨ NEW: Brand & Manufacturer
  brand, manufacturer, modelNumber
  
  // ✨ NEW: Source Tracking
  sourceUrl, lastScraped
  
  // ✨ NEW: SEO & Marketing
  metaTitle, metaDescription, warranty
  
  // ✨ NEW: Metrics
  viewCount, purchaseCount
  
  // Relations
  categoryId → Category
  attributes → ProductAttribute[]
  images → ProductImage[]  // ✨ NEW
  orderItems → OrderItem[]
  reviews → Review[]
  
  // Timestamps
  createdAt, updatedAt
  
  // Indexes (12 total)
  @@index([categoryId, status, createdAt, priceCents])
  @@index([brand, manufacturer])
  @@index([viewCount, purchaseCount])
}
```

---

## 🎯 Data Scraping Preparation Checklist

### ✅ Schema Ready
- [x] Brand field for filtering
- [x] Manufacturer field for grouping
- [x] Model number for unique identification
- [x] Source URL for re-scraping
- [x] Warranty field for customer info
- [x] SEO fields (metaTitle, metaDescription)
- [x] Metrics (viewCount, purchaseCount)
- [x] OUT_OF_STOCK, DISCONTINUED statuses
- [x] ProductImage model for galleries

### ✅ Seed Scripts Updated
- [x] `seed-demo.cjs` generates brand/manufacturer
- [x] All 71 demo products have new fields
- [x] Warranty randomly assigned (12/24/36 tháng)
- [x] SEO fields auto-generated

### 🔜 Before Scraping (Next Steps)

#### 1. **Admin Panel Updates** (20-30 min)
```typescript
// Add fields to product form:
- Brand (text input or select)
- Manufacturer (text input)
- Model Number (text input, optional)
- Source URL (text input, read-only after scraping)
- Warranty (select: 12/24/36 tháng)
- SEO Meta Title (text input, 60 char limit)
- SEO Meta Description (textarea, 160 char limit)

// Add image gallery component:
- Upload multiple images
- Set primary image
- Reorder images (drag-drop)
- Add alt text per image
```

#### 2. **Scraper Script Template** (2-3 hours)
```javascript
async function scrapeTikiProduct(url) {
  const html = await fetch(url);
  const $ = cheerio.load(html);
  
  return {
    // Basic fields
    name: $('h1.title').text(),
    priceCents: parsePriceVnd($('.price').text()) * 100,
    description: $('.description').html(),
    
    // ✨ NEW: Extract brand/manufacturer
    brand: extractBrand($('.brand').text()),
    manufacturer: $('.seller-name').text(),
    
    // ✨ NEW: Source tracking
    sourceUrl: url,
    lastScraped: new Date(),
    
    // ✨ NEW: SEO
    metaTitle: $('meta[property="og:title"]').attr('content'),
    metaDescription: $('meta[name="description"]').attr('content'),
    warranty: extractWarranty($('.warranty').text()),
    
    // ✨ NEW: Images (multiple)
    images: $('.product-images img').map((i, el) => ({
      url: $(el).attr('src'),
      order: i,
      isPrimary: i === 0
    })).get(),
    
    // Attributes (existing)
    attributes: extractAttributes($)
  };
}
```

#### 3. **API Updates** (30 min)
```typescript
// Track product views
GET /api/products/[slug]
  → Increment viewCount when viewed

// Track purchases
POST /api/orders
  → Increment purchaseCount when ordered

// Update stock status
PUT /api/admin/products/[id]
  → Auto-set OUT_OF_STOCK when stock = 0
```

#### 4. **Frontend Updates** (1-2 hours)
```typescript
// Product listing filters
- Filter by brand (Intel, AMD, ASUS...)
- Filter by manufacturer (ASUS ROG, MSI Gaming...)
- Sort by popularity (viewCount, purchaseCount)

// Product detail page
- Image gallery (ProductImage[])
- Warranty badge (warranty field)
- Brand logo (brand field)
- Out of stock badge (status = OUT_OF_STOCK)

// SEO
- Use metaTitle in <title>
- Use metaDescription in <meta name="description">
```

---

## 📋 Scraping Data Format

### Example Product JSON
```json
{
  "name": "Intel Core i7-13700K",
  "slug": "intel-core-i7-13700k",
  "priceCents": 1099000,
  "stock": 15,
  "status": "PUBLISHED",
  
  "brand": "Intel",
  "manufacturer": "Intel Boxed",
  "modelNumber": "BX8071513700K",
  "sourceUrl": "https://tiki.vn/...",
  "lastScraped": "2024-12-12T10:23:19Z",
  
  "warranty": "36 tháng",
  "metaTitle": "Intel Core i7-13700K - CPU Gaming Hiệu Năng Cao",
  "metaDescription": "CPU Intel Core i7-13700K 16 nhân 24 luồng, tốc độ 5.4GHz, socket LGA1700. Bảo hành 36 tháng chính hãng.",
  
  "categoryId": "cpu-category-id",
  
  "images": [
    {
      "url": "/uploads/intel-i7-13700k-1.jpg",
      "order": 0,
      "isPrimary": true,
      "altText": "Intel Core i7-13700K chính diện"
    },
    {
      "url": "/uploads/intel-i7-13700k-2.jpg",
      "order": 1,
      "isPrimary": false,
      "altText": "Intel Core i7-13700K góc nghiêng"
    }
  ],
  
  "attributes": [
    { "key": "CPU_BRAND", "stringValue": "Intel" },
    { "key": "CPU_SOCKET", "stringValue": "LGA1700" },
    { "key": "CPU_CORES", "numberValue": 16 },
    { "key": "CPU_THREADS", "numberValue": 24 },
    { "key": "CPU_BASE_CLOCK_GHZ", "numberValue": 3.4 },
    { "key": "CPU_BOOST_CLOCK_GHZ", "numberValue": 5.4 },
    { "key": "CPU_TDP_WATT", "numberValue": 125 },
    { "key": "CPU_CACHE_MB", "numberValue": 30 }
  ]
}
```

---

## ⚠️ Critical Scraping Notes

### 1. **Brand vs Manufacturer**
```
CPU Intel:
  brand = "Intel"
  manufacturer = "Intel Boxed" or "Intel Tray"

GPU NVIDIA by ASUS:
  brand = "NVIDIA"
  manufacturer = "ASUS ROG Strix"

Mainboard:
  brand = "ASUS"
  manufacturer = "ASUS ROG Maximus"
```

**Rule:** Brand = Chip maker, Manufacturer = Board maker

---

### 2. **Image Handling**
```javascript
// Download images locally (don't use external URLs)
const imageUrl = await downloadImage(externalUrl, 'uploads/products');

// Create ProductImage records
await prisma.productImage.createMany({
  data: imageUrls.map((url, i) => ({
    productId: product.id,
    url,
    order: i,
    isPrimary: i === 0
  }))
});

// Keep imageUrl for backward compatibility
await prisma.product.update({
  where: { id: product.id },
  data: { imageUrl: imageUrls[0] } // Primary image
});
```

---

### 3. **Warranty Format**
```javascript
// Normalize warranty text
function normalizeWarranty(text) {
  const match = text.match(/(\d+)\s*(tháng|năm)/i);
  if (!match) return null;
  
  const [_, num, unit] = match;
  const months = unit.toLowerCase() === 'năm' 
    ? parseInt(num) * 12 
    : parseInt(num);
    
  return `${months} tháng`;
}

// Examples:
"Bảo hành 2 năm" → "24 tháng"
"36 months warranty" → "36 tháng"
"1 year" → "12 tháng"
```

---

### 4. **Stock Status**
```javascript
// Auto-set OUT_OF_STOCK
const status = stock > 0 
  ? 'PUBLISHED' 
  : 'OUT_OF_STOCK';

// Or keep as PUBLISHED but show "Out of Stock" badge
const status = 'PUBLISHED'; // Always
// Frontend checks: stock === 0 ? 'Out of Stock' : 'In Stock'
```

---

## 🧪 Testing New Fields

### Test Product Creation
```javascript
const product = await prisma.product.create({
  data: {
    name: "Test Product",
    slug: "test-product",
    priceCents: 100000,
    stock: 10,
    categoryId: "category-id",
    
    // ✅ NEW FIELDS
    brand: "Intel",
    manufacturer: "Intel Boxed",
    modelNumber: "BX8071513700K",
    sourceUrl: "https://tiki.vn/...",
    warranty: "36 tháng",
    metaTitle: "Test Product - SEO Title",
    metaDescription: "Test product description for SEO",
    
    // ✅ IMAGES
    images: {
      create: [
        { url: "/img1.jpg", order: 0, isPrimary: true },
        { url: "/img2.jpg", order: 1, isPrimary: false }
      ]
    }
  },
  include: { images: true }
});
```

### Test Filtering by Brand
```javascript
// Find all Intel CPUs
const intelCpus = await prisma.product.findMany({
  where: {
    category: { slug: 'cpu' },
    brand: 'Intel'
  },
  orderBy: { purchaseCount: 'desc' }
});
```

### Test Image Gallery
```javascript
// Get product with images
const product = await prisma.product.findUnique({
  where: { slug: 'intel-core-i7-13700k' },
  include: {
    images: {
      orderBy: { order: 'asc' }
    }
  }
});

// Primary image
const primaryImage = product.images.find(img => img.isPrimary);
```

---

## 🎯 Next Steps Summary

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Schema migration | P0 | ✅ Done | Complete |
| Seed scripts update | P0 | ✅ Done | Complete |
| Admin panel (add fields) | P1 | 30 min | Todo |
| Scraper template | P1 | 2-3 hrs | Todo |
| API updates (metrics) | P2 | 30 min | Todo |
| Frontend (filters, gallery) | P2 | 1-2 hrs | Todo |
| Testing scraper | P1 | 1 hr | Todo |

**Total time before scraping:** ~5-7 hours

---

## ✅ Schema is Production-Ready!

Bây giờ database đã sẵn sàng để cào 400-700 sản phẩm thật. Không cần lo việc phải migrate lại hoặc sửa data sau này!

**Critical fields checklist:**
- ✅ Brand (for filtering)
- ✅ Manufacturer (for grouping)
- ✅ Source URL (for re-scraping)
- ✅ Warranty (customer info)
- ✅ Multiple images (better UX)
- ✅ SEO fields (Google ranking)
- ✅ Metrics (popularity tracking)
- ✅ OUT_OF_STOCK status (inventory)

**Migration file:** `prisma/migrations/20251212102319_add_scraping_essential_fields/migration.sql`
