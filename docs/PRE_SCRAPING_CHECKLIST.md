# Pre-Scraping Checklist ✅

## Database Schema
- [x] Brand field added for filtering
- [x] Manufacturer field for product variants
- [x] Model number for unique identification
- [x] Source URL for price re-scraping
- [x] Warranty field for customer info
- [x] SEO fields (metaTitle, metaDescription)
- [x] Product metrics (viewCount, purchaseCount)
- [x] OUT_OF_STOCK, DISCONTINUED statuses
- [x] ProductImage model for multiple images
- [x] All indexes created (12 total)

## Seed Data
- [x] 71 demo products with new fields
- [x] Brand/manufacturer auto-generated
- [x] Warranty randomly assigned
- [x] SEO fields auto-generated
- [x] All categories have products

## Before First Scrape

### 1. Admin Panel (Priority: HIGH)
- [ ] Add brand field to product form (text input or select)
- [ ] Add manufacturer field (text input)
- [ ] Add model number field (optional)
- [ ] Add source URL field (read-only after import)
- [ ] Add warranty dropdown (12/24/36 tháng)
- [ ] Add SEO meta title (max 60 chars)
- [ ] Add SEO meta description (max 160 chars)
- [ ] Add image gallery uploader (multiple files)
- [ ] Add image order/reorder (drag-drop)
- [ ] Add primary image selector

**Time estimate:** 30-45 minutes

---

### 2. Scraper Script (Priority: HIGH)
- [ ] Install dependencies: `cheerio`, `axios`, `sharp`
- [ ] Create `scripts/scrape-tiki.js` template
- [ ] Implement URL fetching with retry
- [ ] Parse HTML for product data
- [ ] Extract brand from title or specs
- [ ] Extract manufacturer from seller
- [ ] Download images locally to `/public/uploads/`
- [ ] Generate image blur hashes
- [ ] Map attributes to AttributeType keys
- [ ] Handle errors gracefully
- [ ] Add rate limiting (1 req/second)

**Key functions:**
```javascript
async function scrapeTikiProduct(url) {
  // Fetch HTML
  // Parse product data
  // Download images
  // Extract attributes
  // Return structured data
}

async function saveProduct(data) {
  // Create Product
  // Create ProductAttributes
  // Create ProductImages
  // Set primary image
}
```

**Time estimate:** 2-3 hours

---

### 3. Data Import Script (Priority: MEDIUM)
- [ ] Create `scripts/import-products.js`
- [ ] Read product data from JSON/CSV
- [ ] Validate required fields
- [ ] Check for duplicates (by slug or modelNumber)
- [ ] Batch import (10 products at a time)
- [ ] Log success/failures
- [ ] Generate import summary report

**Time estimate:** 1 hour

---

### 4. API Updates (Priority: MEDIUM)
- [ ] `GET /api/products/[slug]` - Increment viewCount
- [ ] `POST /api/orders` - Increment purchaseCount
- [ ] `PUT /api/admin/products/[id]` - Auto OUT_OF_STOCK when stock = 0
- [ ] `GET /api/products?brand=Intel` - Filter by brand
- [ ] `GET /api/products?sort=popular` - Sort by viewCount

**Time estimate:** 30 minutes

---

### 5. Frontend Updates (Priority: LOW)
- [ ] Product listing: Brand filter dropdown
- [ ] Product listing: Manufacturer filter
- [ ] Product listing: Sort by popularity
- [ ] Product detail: Image gallery (swiper/carousel)
- [ ] Product detail: Warranty badge
- [ ] Product detail: Brand logo
- [ ] Product detail: Out of stock badge
- [ ] SEO: Use metaTitle in <title>
- [ ] SEO: Use metaDescription in <meta>

**Time estimate:** 1-2 hours

---

## Scraping Phase Plan

### Phase 1: Test Scrape (1-2 days)
**Goal:** Verify scraper works correctly

- [ ] Scrape 2-3 products per category (16-24 total)
- [ ] Test CPU (Intel & AMD)
- [ ] Test GPU (NVIDIA & AMD)
- [ ] Test Mainboard (different sockets)
- [ ] Test RAM (DDR4 & DDR5)
- [ ] Test PSU (different wattages)
- [ ] Test Case (different form factors)
- [ ] Test Storage (SSD, NVMe, HDD)
- [ ] Test Cooler (Air & AIO)

**Validation:**
- [ ] All products imported successfully
- [ ] Images downloaded and blur hashes generated
- [ ] Attributes mapped correctly (CPU_SOCKET, MB_SOCKET match)
- [ ] Brand/manufacturer extracted properly
- [ ] Warranty normalized (all in "X tháng" format)
- [ ] SEO fields populated
- [ ] Compatibility checks pass

---

### Phase 2: Category Scrape (1 week)
**Goal:** Scrape 50-100 products per category

#### CPU (Target: 50-70 products)
- [ ] Intel: i3, i5, i7, i9 (LGA1700, LGA1200)
- [ ] AMD: Ryzen 3, 5, 7, 9 (AM5, AM4)
- [ ] Range: Budget (2tr) to High-end (15tr)

#### Mainboard (Target: 60-80 products)
- [ ] Intel: Z790, B760, H610 (LGA1700)
- [ ] AMD: X670E, B650, A620 (AM5)
- [ ] AMD: B550, A520 (AM4)
- [ ] Form factors: ATX, Micro-ATX, Mini-ITX

#### GPU (Target: 50-70 products)
- [ ] NVIDIA: RTX 4060, 4060 Ti, 4070, 4070 Ti, 4080, 4090
- [ ] AMD: RX 7600, 7700 XT, 7800 XT, 7900 XTX
- [ ] Manufacturers: ASUS, MSI, GIGABYTE, EVGA, XFX

#### RAM (Target: 40-50 products)
- [ ] DDR5: 16GB, 32GB, 64GB (5600-8000MHz)
- [ ] DDR4: 8GB, 16GB, 32GB (3000-4000MHz)
- [ ] Brands: Corsair, G.Skill, Kingston, TeamGroup

#### PSU (Target: 40-50 products)
- [ ] Wattages: 550W, 650W, 750W, 850W, 1000W+
- [ ] Certs: 80+ Bronze, Gold, Platinum, Titanium
- [ ] Modular: Non, Semi, Fully modular

#### Case (Target: 40-50 products)
- [ ] Form factors: ATX, Micro-ATX, Mini-ITX
- [ ] Brands: LianLi, NZXT, Corsair, Fractal Design
- [ ] Features: Tempered glass, RGB, mesh front

#### Storage (Target: 50-70 products)
- [ ] NVMe: 256GB, 512GB, 1TB, 2TB (Gen3, Gen4)
- [ ] SATA SSD: 256GB, 512GB, 1TB
- [ ] HDD: 1TB, 2TB, 4TB (7200 RPM)

#### Cooler (Target: 30-40 products)
- [ ] Air: Budget, Mid-range, High-end
- [ ] AIO: 240mm, 280mm, 360mm, 420mm
- [ ] Brands: Noctua, Deepcool, NZXT, Corsair

**Total target:** 400-500 products

---

### Phase 3: Validation & Cleanup (2-3 days)
- [ ] Check all products have brand
- [ ] Check all products have manufacturer
- [ ] Check all products have warranty
- [ ] Check all products have at least 1 image
- [ ] Check attribute format consistency
- [ ] Run compatibility tests (100+ combinations)
- [ ] Fix any broken image URLs
- [ ] Normalize warranty formats
- [ ] Add missing SEO fields
- [ ] Remove duplicates

---

### Phase 4: Optional Expansion (1-2 weeks)
- [ ] Scrape more products (up to 700 total)
- [ ] Add more brands/manufacturers
- [ ] Scrape product reviews (if available)
- [ ] Scrape bundle deals
- [ ] Add related products
- [ ] Add frequently bought together

---

## Critical Data Quality Rules

### Brand Extraction
```javascript
// CPU
"Intel Core i7-13700K" → brand: "Intel"
"AMD Ryzen 7 7700X" → brand: "AMD"

// GPU
"ASUS ROG Strix RTX 4070" → brand: "NVIDIA", manufacturer: "ASUS ROG"
"MSI Radeon RX 7800 XT" → brand: "AMD", manufacturer: "MSI"

// Mainboard
"ASUS TUF Z790" → brand: "ASUS", manufacturer: "ASUS TUF"
"MSI MPG B650" → brand: "MSI", manufacturer: "MSI MPG"
```

### Attribute Format Rules
- **Numbers must be pure numbers** (no units in numberValue)
  - ✅ `CPU_TDP_WATT: 125` (numberValue: 125)
  - ❌ `CPU_TDP_WATT: "125W"` (should be number, not string)
  
- **Strings must be exact match** (case-sensitive)
  - ✅ `CPU_SOCKET: "LGA1700"` matches `MB_SOCKET: "LGA1700"`
  - ❌ `CPU_SOCKET: "lga1700"` != `MB_SOCKET: "LGA1700"`
  
- **No units in string values** (unless specified in template)
  - ✅ `GPU_POWER_CONNECTOR: "8-pin"`
  - ❌ `GPU_LENGTH_MM: "330mm"` (should be numberValue: 330)

### Image Requirements
- **Format:** JPG or PNG
- **Size:** Max 2MB per image
- **Dimensions:** Min 800x800, recommended 1200x1200
- **Count:** 1-8 images per product
- **Naming:** `{slug}-{index}.jpg` (e.g., `intel-i7-13700k-0.jpg`)
- **Storage:** `/public/uploads/products/`

### Price Format
- **Always in cents** (multiply VNĐ by 100)
  - 10,990,000 VNĐ → `priceCents: 1099000000`
  - 500,000 VNĐ → `priceCents: 50000000`

### Warranty Format
- **Always in months** ("X tháng")
  - "2 năm" → "24 tháng"
  - "1 year" → "12 tháng"
  - "36 months" → "36 tháng"

---

## Risk Mitigation

### Data Loss Prevention
- [ ] Backup database before each import
- [ ] Save scraped data to JSON files (versioned)
- [ ] Log all import operations
- [ ] Keep original source URLs for re-scraping

### Error Handling
- [ ] Scraper continues on single product failure
- [ ] Log failed URLs for retry
- [ ] Validate data before database insert
- [ ] Rollback on critical errors

### Rate Limiting
- [ ] 1 request per second to avoid IP ban
- [ ] Use proxies/VPN if needed
- [ ] Respect robots.txt
- [ ] Add random delays (500-1500ms)

---

## Success Criteria

### Data Quality
- ✅ 95%+ products have brand
- ✅ 90%+ products have manufacturer
- ✅ 100% products have warranty
- ✅ 100% products have at least 1 image
- ✅ 95%+ products have correct attributes
- ✅ 100% products have unique slug
- ✅ 0 compatibility rule violations

### System Performance
- ✅ Product listing loads < 1 second
- ✅ Product detail loads < 500ms
- ✅ Filter by brand < 200ms
- ✅ Search by keyword < 300ms
- ✅ No database index warnings

### User Experience
- ✅ All images load with blur placeholders
- ✅ Brand filter works (Intel/AMD/ASUS...)
- ✅ Warranty displayed on product cards
- ✅ Out of stock badge shows correctly
- ✅ SEO meta tags correct on all pages

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Schema migration | ✅ Complete | Done |
| Seed script update | ✅ Complete | Done |
| Admin panel updates | 30-45 min | Todo |
| Scraper development | 2-3 hours | Todo |
| Test scrape (20 products) | 1-2 days | Todo |
| Category scrape (400-500) | 1 week | Todo |
| Validation & cleanup | 2-3 days | Todo |
| Frontend updates | 1-2 hours | Todo |

**Total time:** ~2 weeks from now to production-ready

---

## Next Immediate Actions

1. **Update admin panel** (30-45 min)
   - Add brand, manufacturer, warranty fields
   - Test creating product manually

2. **Build scraper prototype** (2-3 hours)
   - Scrape 1 product from Tiki
   - Download images
   - Save to database
   - Verify data correctness

3. **Test import** (30 min)
   - Import 10 products
   - Check compatibility
   - Verify frontend display

4. **Plan full scrape** (1 hour)
   - Choose sources (Tiki, Shopee, Gearvn)
   - List specific products to scrape
   - Set up scraping schedule

**Estimated start date:** After completing items 1-3 (1 day)
**Estimated completion:** 2 weeks from start
