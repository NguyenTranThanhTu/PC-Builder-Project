# Testing & Validation Checklist - Sau khi cào data thực

## ⚠️ CÓ ẢNH HƯỞNG - Cần kiểm tra kỹ

Việc cào data thực **CÓ ẢNH HƯỞNG** đến hệ thống hiện tại. Dưới đây là các phần cần kiểm tra:

---

## 1. 🔧 Thuật toán Compatibility (Tích hợp PC)

### Các file liên quan:
- `src/lib/compatibility.ts` - Logic kiểm tra tương thích
- `src/app/api/compatibility/evaluate/route.ts` - API kiểm tra
- `src/app/api/compatibility/suggest/route.ts` - API gợi ý

### ⚠️ Điểm cần lưu ý:

#### 1.1 Attribute Keys phải khớp
Compatibility rules dựa trên **AttributeType.key** (ví dụ: `CPU_SOCKET`, `MB_SOCKET`).

**Rủi ro khi cào data**:
```typescript
// Rule mong đợi: CPU_SOCKET
await prisma.compatibilityRule.create({
  leftAttrType: { key: "CPU_SOCKET" },    // AM5, LGA1700...
  rightAttrType: { key: "MB_SOCKET" },    // AM5, LGA1700...
  operator: "EQ"
});

// Nếu data cào có giá trị:
CPU_SOCKET: "AM5"         ✅ ĐÚNG - Rule hoạt động
CPU_SOCKET: "Socket AM5"  ❌ SAI - Rule KHÔNG hoạt động (khác format)
CPU_SOCKET: "am5"         ❌ SAI - Case-sensitive!
```

**Checklist**:
- [ ] Kiểm tra **format chuẩn** của attribute values (AM5, LGA1700, DDR5, DDR4)
- [ ] **Không có tiền tố** "Socket", "Type", "Chipset" trong value
- [ ] **Case-sensitive** - Phải viết hoa/thường đúng chuẩn
- [ ] Test với 5-10 sản phẩm mỗi category, chạy PC Builder
- [ ] Verify compatibility rules KHÔNG báo lỗi sai

#### 1.2 Number values phải chính xác
```typescript
// Rules kiểm tra theo số:
- RAM_MODULES (2, 4) <= MB_RAM_SLOTS (4)
- GPU_LENGTH_MM (320) <= CASE_GPU_CLEARANCE_MM (380)
- GPU_TDP_WATT (350) + CPU_TDP_WATT (125) <= PSU_WATTAGE (750)
```

**Rủi ro khi cào**:
```typescript
// Đúng
GPU_LENGTH_MM: 320       ✅ (number)
PSU_WATTAGE: 750         ✅ (number)

// SAI
GPU_LENGTH_MM: "320mm"   ❌ (string - phải parse)
PSU_WATTAGE: "750W"      ❌ (string - phải parse)
GPU_LENGTH_MM: 320.5     ⚠️ (decimal - tùy rule)
```

**Checklist**:
- [ ] NUMBER attributes phải là **pure numbers** không có đơn vị
- [ ] Parse bỏ đơn vị (mm, W, GB, MHz...) trước khi lưu
- [ ] Test compatibility với build yêu cầu tính toán phức tạp
- [ ] Kiểm tra PSU wattage recommendation

---

## 2. 🔍 Gợi ý sản phẩm (Suggestions)

### File: `src/app/api/compatibility/suggest/route.ts`

### ⚠️ Logic hoạt động:
```typescript
// Với mỗi category chưa chọn:
1. Lấy pool sản phẩm (15-30 items)
2. Với mỗi candidate:
   - Thêm vào build hiện tại
   - Chạy evaluateCompatibility()
   - Nếu pass → thêm vào suggestions
3. Return top N sản phẩm compatible
```

**Rủi ro**:
- Nếu attributes sai format → **TẤT CẢ đều fail compatibility** → Suggestions trống!
- Nếu stock = 0 → Không xuất hiện trong suggestions

**Checklist**:
- [ ] Test PC Builder với 1-2 component đã chọn
- [ ] Verify suggestions **KHÔNG TRỐNG** cho các category còn lại
- [ ] Check console log có error về compatibility không
- [ ] Test với nhiều combo khác nhau (Intel + AMD, DDR4 + DDR5)

---

## 3. 📊 Hiển thị thông số (Product Specs)

### File: `src/components/ShopDetails/ProductSpecsTable.tsx`
### Logic: `src/lib/productAdapter.ts` - `buildSpecRows()`

### ⚠️ Cách hiển thị:
```typescript
function buildSpecRows(product) {
  const categorySlug = product.category.slug;
  const template = ATTRIBUTE_TEMPLATES[categorySlug]; // CPU, GPU...
  
  return template.map(attr => ({
    label: attr.label,           // "Socket CPU"
    value: product.attributes.find(a => 
      a.attributeType.key === attr.key  // "CPU_SOCKET"
    )?.stringValue || "N/A"
  }));
}
```

**Rủi ro khi cào data**:
```typescript
// Nếu thiếu attribute:
CPU: {
  name: "Intel Core i5-13600K",
  attributes: [
    { key: "CPU_CORES", value: 14 },
    // ❌ THIẾU CPU_SOCKET, CPU_BRAND, CPU_TDP...
  ]
}
// → Bảng specs sẽ hiển thị "N/A" cho tất cả dòng thiếu!
```

**Checklist**:
- [ ] Verify **KHÔNG có "N/A"** quá nhiều trong specs table
- [ ] Tất cả attributes **quan trọng** phải có data:
  - CPU: Socket, Cores, Threads, TDP, Base Clock
  - GPU: Chip, VRAM, TDP, Length
  - RAM: Type (DDR4/DDR5), Capacity, Speed
  - Mainboard: Socket, Chipset, RAM Type, RAM Slots
  - PSU: Wattage, Certification, Modular
  - Case: Form Factor, GPU Clearance, CPU Cooler Clearance
- [ ] Test với 10 sản phẩm random mỗi category

---

## 4. 📝 Mô tả sản phẩm

### Field: `Product.description`

**Rủi ro**:
- Mô tả từ website nguồn có thể chứa:
  - HTML tags `<p>`, `<br>`, `<strong>`
  - Ký tự đặc biệt chưa escape
  - Link affiliate
  - Thông tin không liên quan (shipping, warranty...)

**Checklist**:
- [ ] Strip HTML tags hoặc render safely
- [ ] Remove affiliate links
- [ ] Giới hạn độ dài (không quá 2000 ký tự)
- [ ] Test XSS prevention (nếu có HTML)
- [ ] Preview description trên trang chi tiết sản phẩm

---

## 5. 🖼️ Hình ảnh sản phẩm

### Fields: `imageUrl`, `imageBlurData`

**Rủi ro**:
```typescript
// SAI
imageUrl: "https://external-site.com/image.jpg"  
// → Có thể bị chặn CORS, hoặc link chết

// ĐÚNG
imageUrl: "/uploads/products/cpu-i5-13600k.webp" 
// → Host locally, tối ưu với blur placeholder
```

**Checklist**:
- [ ] Download hình về server (không dùng external URL)
- [ ] Optimize: Resize, compress, convert to WebP
- [ ] Generate blur placeholder với plaiceholder hoặc sharp
- [ ] Verify images load trên:
  - Product listing
  - Product detail
  - Cart
  - PC Builder
  - Search results

---

## 6. 💰 Giá cả (Price)

### Field: `priceCents` (INT - stored as cents)

**Rủi ro khi cào**:
```typescript
// Giá gốc: 5,990,000 VNĐ

// SAI
priceCents: 5990000        ❌ (5 triệu 990k cents = 59k VNĐ)
priceCents: 5990000.00     ❌ (Float không được!)

// ĐÚNG
priceCents: 599000000      ✅ (5,990,000 * 100 = 599 triệu cents)
```

**Checklist**:
- [ ] Parse giá, nhân 100, lưu INT
- [ ] Remove dấu phẩy, chấm, ký tự đặc biệt
- [ ] Verify price display đúng ở mọi nơi
- [ ] Test checkout flow với giá mới
- [ ] Kiểm tra VIP discount calculation

---

## 7. 📦 Kho hàng (Stock)

### Field: `stock` (INT)

**Checklist**:
- [ ] Stock > 0 để sản phẩm xuất hiện trong suggestions
- [ ] Status = "PUBLISHED" để hiển thị trên shop
- [ ] Test "Out of Stock" behavior
- [ ] Verify không thể add to cart khi stock = 0

---

## 8. 🔎 Search & Filter

### Attributes được dùng để filter

**Ảnh hưởng**:
- Search by specs (RAM speed, GPU VRAM, CPU cores...)
- Price range filter
- Brand filter

**Checklist**:
- [ ] Test search với keywords từ attributes
- [ ] Filter by price range
- [ ] Filter by brand (Intel/AMD, NVIDIA/AMD)
- [ ] Sort by price, name, date

---

## 🧪 Testing Plan - Step by Step

### Phase 1: Import 10 sản phẩm test (1 ngày)
```bash
# Import 10 CPUs để test
node prisma/scrapers/import-test-cpus.js

# Checklist:
✅ Attributes đầy đủ (check database)
✅ Price đúng format (x100)
✅ Images load được
✅ Specs table hiển thị đầy đủ
```

### Phase 2: Test PC Builder (1 ngày)
```bash
# Scenario 1: Intel Build
1. Chọn Intel CPU (LGA1700)
2. Verify suggestions chỉ show mainboard LGA1700
3. Chọn mainboard DDR5
4. Verify suggestions chỉ show RAM DDR5
5. Chọn GPU dài 320mm
6. Verify case suggestions >= 320mm clearance

# Scenario 2: AMD Build
1. Chọn AMD CPU (AM5)
2. Verify compatibility
3. Complete build
4. No errors!
```

### Phase 3: Test Compatibility Rules (1 ngày)
```typescript
// Test cases:
1. CPU AM5 + Mainboard LGA1700 → ❌ Báo lỗi
2. 4x RAM 16GB (64GB total) + Mainboard max 32GB → ❌ Báo lỗi
3. GPU 380mm + Case clearance 360mm → ❌ Báo lỗi
4. GPU 350W + CPU 125W + PSU 400W → ❌ Báo lỗi (insufficient power)
5. Valid build → ✅ Pass
```

### Phase 4: Full Import (3-5 ngày)
```bash
# Import tất cả categories
node prisma/scrapers/import-all.js

# QA:
✅ No TypeScript errors
✅ PC Builder works
✅ Suggestions not empty
✅ Specs display properly
✅ Images load
✅ Prices correct
✅ Search works
✅ Checkout flow OK
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Suggestions trống
**Nguyên nhân**: Attributes không khớp format
**Fix**: 
```typescript
// Normalize attributes khi cào:
const socket = rawSocket
  .replace(/^Socket\s+/i, '')  // "Socket AM5" → "AM5"
  .trim()
  .toUpperCase();              // "am5" → "AM5"
```

### Issue 2: Bảng specs toàn "N/A"
**Nguyên nhân**: AttributeType keys không khớp
**Fix**: Map đúng keys từ ATTRIBUTE_TEMPLATES
```typescript
// Check template trước khi import
const template = ATTRIBUTE_TEMPLATES['cpu'];
template.forEach(attr => {
  console.log(`Required: ${attr.key}`); // CPU_SOCKET, CPU_CORES...
});
```

### Issue 3: Compatibility check sai
**Nguyên nhân**: Number values có đơn vị
**Fix**: Parse bỏ đơn vị
```typescript
const tdp = parseInt(rawTDP.replace(/W$/i, '')); // "125W" → 125
```

### Issue 4: Images 404
**Nguyên nhân**: External URLs hoặc chưa download
**Fix**: Download và host local
```typescript
const localPath = await downloadImage(externalUrl);
product.imageUrl = localPath; // "/uploads/cpu-123.webp"
```

---

## ✅ Final Checklist

### Before Full Import:
- [ ] Test với 10 sản phẩm mỗi category
- [ ] Verify PC Builder hoạt động
- [ ] Check compatibility rules
- [ ] Validate specs display
- [ ] Test images
- [ ] Verify prices

### After Full Import:
- [ ] Run full E2E test suite
- [ ] Check error logs
- [ ] Verify database integrity
- [ ] Test production deployment
- [ ] Monitor performance (query speed)

### Critical Alerts:
```bash
# Nếu thấy các dấu hiệu này → DỪNG IMPORT:
🚨 Suggestions luôn trống
🚨 PC Builder báo lỗi compatibility sai
🚨 Specs table toàn "N/A"
🚨 Images không load
🚨 Prices sai (quá cao/thấp)
🚨 TypeScript compile errors
```

---

## 📝 Summary

**CÓ ẢNH HƯỞNG** đến:
1. ✅ Compatibility checking (quan trọng nhất)
2. ✅ Product suggestions
3. ✅ Specs display
4. ✅ Images & descriptions
5. ✅ Price calculations

**KHÔNG ẢNH HƯỞNG** đến:
- Authentication system
- Cart logic (if prices correct)
- Order processing
- VIP tier system
- Review system

**Kết luận**: Cần test kỹ với **pilot data** trước khi full import!
