# 🚀 FEATURE DEVELOPMENT PLAN - PC Builder E-Commerce

## 📋 Tổng quan yêu cầu
Hoàn thiện các tính năng bán hàng chuyên nghiệp cho hệ thống PC Builder với 7 tính năng chính:

1. ✅ **Quản lý khuyến mãi** (Coupon/Promo Code System)
2. ✅ **Hệ thống khách hàng VIP** (Customer Tier System)
3. ✅ **Quản lý kho** (Inventory Management)
4. ✅ **Bình luận & đánh giá** (Review System với Admin Reply)
5. ✅ **Xuất hóa đơn** (Invoice PDF Export)
6. ✅ **Giả lập thanh toán** (VNPay Payment Gateway)
7. ✅ **UI/UX cho khách hàng** (Customer-facing Interface)

---

## 🎯 SPRINT 1: Coupon & Promotion System (Ngày 1-2)

### 📊 Database Schema
```prisma
model Coupon {
  id              String    @id @default(cuid())
  code            String    @unique        // Mã coupon: "SALE50", "NEWUSER"
  description     String?                  // Mô tả
  discountType    DiscountType             // PERCENTAGE | FIXED_AMOUNT
  discountValue   Int                      // 10 (10%) hoặc 50000 (50k VND)
  minOrderValue   Int       @default(0)    // Đơn tối thiểu (cents)
  maxDiscount     Int?                     // Giảm tối đa (cents), null = unlimited
  maxUsage        Int?                     // Số lần dùng tối đa, null = unlimited
  usageCount      Int       @default(0)    // Đã dùng bao nhiêu lần
  startDate       DateTime                 // Bắt đầu
  endDate         DateTime                 // Hết hạn
  isActive        Boolean   @default(true) // Admin có thể tắt
  forVIPOnly      Boolean   @default(false)// Chỉ VIP mới dùng được
  minVIPTier      Int?                     // VIP tier tối thiểu (1,2,3)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  orders          OrderCoupon[]

  @@index([code])
  @@index([isActive])
  @@index([startDate, endDate])
}

enum DiscountType {
  PERCENTAGE      // Giảm theo %
  FIXED_AMOUNT    // Giảm số tiền cố định
}

model OrderCoupon {
  id              String   @id @default(cuid())
  orderId         String
  couponId        String
  discountAmount  Int                     // Số tiền đã giảm (cents)
  order           Order    @relation(fields: [orderId], references: [id])
  coupon          Coupon   @relation(fields: [couponId], references: [id])
  createdAt       DateTime @default(now())

  @@index([orderId])
  @@index([couponId])
}

// Update Order model
model Order {
  // ...existing fields
  couponCode      String?                 // Mã coupon đã dùng
  couponDiscount  Int       @default(0)   // Số tiền giảm từ coupon
  vipDiscount     Int       @default(0)   // Số tiền giảm từ VIP
  subtotalCents   Int                     // Tổng trước giảm
  totalCents      Int                     // Tổng sau giảm
  orderCoupons    OrderCoupon[]
  // ...
}
```

### 🔧 Backend API Endpoints

**Admin APIs:**
- `POST /api/admin/coupons` - Tạo coupon mới
- `GET /api/admin/coupons` - Danh sách coupons (filter, search, pagination)
- `PUT /api/admin/coupons/[id]` - Cập nhật coupon
- `DELETE /api/admin/coupons/[id]` - Xóa coupon
- `POST /api/admin/coupons/[id]/toggle` - Bật/tắt coupon

**Customer APIs:**
- `POST /api/coupons/validate` - Kiểm tra coupon có hợp lệ không
  - Input: `{ code, cartTotal, userId }`
  - Output: `{ valid, discount, message }`
- `GET /api/coupons/available` - Danh sách coupon khả dụng cho user

### 🎨 UI Components

**Admin:**
- `/admin/coupons` - Trang quản lý coupon
  - Table: Code, Type, Value, Usage, Dates, Status
  - Filter: Active/Expired, VIP Only
  - Create/Edit Modal với form validation

**Customer:**
- `Checkout` page - Input nhập mã coupon
  - Real-time validation
  - Hiển thị discount applied
  - Error messages rõ ràng
- `Available Coupons Modal` - Popup hiển thị coupon khả dụng (như Shopee)

### ✅ Acceptance Criteria
- [x] Admin tạo/sửa/xóa coupon
- [x] Coupon có expiry date, usage limit
- [x] Customer nhập mã và thấy giảm giá realtime
- [x] Không dùng được coupon hết hạn/hết lượt
- [x] Log usage history

---

## 🎯 SPRINT 2: VIP Customer Tier System (Ngày 2-3)

### 📊 Database Schema
```prisma
model User {
  // ...existing fields
  vipTier         Int       @default(0)    // 0=Normal, 1=VIP1, 2=VIP2, 3=VIP3
  totalSpent      Int       @default(0)    // Tổng tiền đã mua (cents)
  lastTierUpdate  DateTime? @default(now())
  // ...
}

model VIPTierConfig {
  id              String   @id @default(cuid())
  tier            Int      @unique         // 1, 2, 3
  name            String                   // "VIP Đồng", "VIP Bạc", "VIP Vàng"
  minSpend        Int                      // Mua tối thiểu để lên tier (cents)
  discountPercent Int                      // Discount % (3, 4, 5)
  benefits        String[]                 // Quyền lợi khác: ["Freeship", "Priority Support"]
  badgeColor      String                   // Màu badge: "#CD7F32", "#C0C0C0", "#FFD700"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 🔧 Backend Logic

**Auto-upgrade VIP tier:**
```typescript
// Trigger sau khi order COMPLETED
async function updateUserVIPTier(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const totalSpent = await prisma.order.aggregate({
    where: { userId, status: 'COMPLETED' },
    _sum: { totalCents: true }
  });
  
  const tiers = await prisma.vIPTierConfig.findMany({ orderBy: { minSpend: 'desc' } });
  const newTier = tiers.find(t => totalSpent._sum.totalCents >= t.minSpend)?.tier || 0;
  
  if (newTier !== user.vipTier) {
    await prisma.user.update({
      where: { id: userId },
      data: { vipTier: newTier, totalSpent: totalSpent._sum.totalCents }
    });
    // Send notification
  }
}
```

**Calculate VIP discount at checkout:**
```typescript
function calculateVIPDiscount(userId: string, subtotal: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tierConfig = await prisma.vIPTierConfig.findUnique({ 
    where: { tier: user.vipTier } 
  });
  
  if (!tierConfig) return 0;
  return Math.floor(subtotal * tierConfig.discountPercent / 100);
}
```

### 🔧 Backend API Endpoints

**Admin APIs:**
- `GET /api/admin/vip-config` - Lấy config VIP tiers
- `PUT /api/admin/vip-config` - Cập nhật config (min spend, discount %)

**Customer APIs:**
- `GET /api/user/vip-status` - Thông tin VIP của user
  - Output: `{ tier, totalSpent, nextTier, remainingToNextTier, discount }`

### 🎨 UI Components

**Admin:**
- `/admin/settings/vip-config` - Cấu hình VIP tiers
  - Form: Tier name, min spend, discount %, badge color

**Customer:**
- `My Account` - Hiển thị VIP badge, progress bar
  - "Bạn còn 5.000.000₫ nữa để lên VIP Bạc"
- `Checkout` - Hiển thị VIP discount áp dụng
- `Product Card` - Badge VIP nếu user là VIP

### ✅ Acceptance Criteria
- [x] User tự động lên tier khi order COMPLETED
- [x] VIP discount tự động apply ở checkout
- [x] Admin config được min spend & discount %
- [x] UI hiển thị progress bar đẹp
- [x] Coupon + VIP discount cộng dồn

---

## 🎯 SPRINT 3: Inventory Management (Ngày 3-4)

### 📊 Database Schema
```prisma
model Product {
  // ...existing fields
  stock           Int       @default(0)        // ✅ Already exists
  lowStockThreshold Int     @default(10)       // Cảnh báo sắp hết
  restockHistory  RestockLog[]
  // ...
}

model RestockLog {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  quantityAdded   Int                          // Số lượng nhập thêm
  previousStock   Int                          // Stock trước khi nhập
  newStock        Int                          // Stock sau khi nhập
  note            String?                      // Ghi chú (supplier, reason)
  adminId         String                       // Admin thực hiện
  createdAt       DateTime @default(now())

  @@index([productId])
  @@index([createdAt])
}

model StockAlert {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  alertType       AlertType                    // LOW_STOCK | OUT_OF_STOCK
  resolved        Boolean  @default(false)
  createdAt       DateTime @default(now())
  resolvedAt      DateTime?

  @@index([productId])
  @@index([resolved])
}

enum AlertType {
  LOW_STOCK       // Stock < lowStockThreshold
  OUT_OF_STOCK    // Stock = 0
}
```

### 🔧 Backend Logic

**Auto-deduct stock on order:**
```typescript
// Already implemented: Order creation decrements stock
// Add: Rollback stock if order cancelled
async function handleOrderCancellation(orderId: string) {
  const order = await prisma.order.findUnique({ 
    where: { id: orderId }, 
    include: { items: true } 
  });
  
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    });
  }
}
```

**Auto-generate stock alerts:**
```typescript
async function checkStockAlerts() {
  const lowStockProducts = await prisma.product.findMany({
    where: { 
      stock: { lte: prisma.raw('lowStockThreshold') },
      stock: { gt: 0 }
    }
  });
  
  for (const product of lowStockProducts) {
    await prisma.stockAlert.upsert({
      where: { productId: product.id, alertType: 'LOW_STOCK', resolved: false },
      create: { productId: product.id, alertType: 'LOW_STOCK' },
      update: {}
    });
  }
}
```

### 🔧 Backend API Endpoints

**Admin APIs:**
- `POST /api/admin/inventory/restock` - Nhập kho
  - Input: `{ productId, quantity, note }`
- `GET /api/admin/inventory/alerts` - Danh sách cảnh báo hết hàng
- `GET /api/admin/inventory/history/[productId]` - Lịch sử nhập kho
- `POST /api/admin/inventory/bulk-update` - Cập nhật stock hàng loạt

### 🎨 UI Components

**Admin:**
- `/admin/inventory` - Trang quản lý kho
  - Table: Product, Current Stock, Threshold, Status
  - Quick restock button
  - Alert badges (red = out, yellow = low)
- `/admin/inventory/[productId]/history` - Lịch sử nhập kho
- Dashboard widget: "5 sản phẩm sắp hết hàng"

**Customer:**
- Product page: "Chỉ còn 3 sản phẩm" (nếu stock < 10)
- Checkout: Validate stock before payment

### ✅ Acceptance Criteria
- [x] Admin nhập kho và log history
- [x] Auto-deduct stock khi order
- [x] Rollback stock khi order cancelled
- [x] Alerts tự động cho low stock
- [x] Dashboard hiển thị inventory summary

---

## 🎯 SPRINT 4: Review System với Admin Reply (Ngày 4-5)

### 📊 Database Schema
```prisma
model Review {
  // ...existing fields
  id              String   @id @default(cuid())
  userId          String?
  productId       String
  rating          Int                      // 1-5 ✅ Already exists
  content         String                   // ✅ Already exists
  approved        Boolean  @default(true)  // ✅ Already exists
  images          String[]                 // NEW: Review images
  adminReply      String?                  // NEW: Admin reply
  repliedAt       DateTime?                // NEW: Thời gian admin reply
  repliedBy       String?                  // NEW: Admin ID
  helpful         Int      @default(0)     // NEW: Số lượt helpful
  reported        Boolean  @default(false) // NEW: Bị báo cáo
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  // ...
}

model ReviewHelpful {
  id              String   @id @default(cuid())
  reviewId        String
  userId          String
  review          Review   @relation(fields: [reviewId], references: [id])
  user            User     @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())

  @@unique([reviewId, userId])
  @@index([reviewId])
}
```

### 🔧 Backend API Endpoints

**Customer APIs:**
- `POST /api/reviews` - Tạo review mới
  - Input: `{ productId, rating, content, images }`
  - Validation: Chỉ review nếu đã mua (order COMPLETED)
- `GET /api/reviews/[productId]` - Lấy reviews của sản phẩm
- `POST /api/reviews/[id]/helpful` - Đánh dấu helpful

**Admin APIs:**
- `GET /api/admin/reviews` - Danh sách tất cả reviews
- `POST /api/admin/reviews/[id]/reply` - Admin reply
- `PUT /api/admin/reviews/[id]/approve` - Approve/reject review
- `DELETE /api/admin/reviews/[id]` - Xóa review spam

### 🎨 UI Components

**Customer:**
- `Product Detail` page:
  - Review form (rating stars, text, upload images)
  - Display reviews with admin replies
  - Sort: Newest, Highest rated, Most helpful
  - Filter: Rating (5⭐, 4⭐, etc.)
- `My Account > My Reviews` - Lịch sử review

**Admin:**
- `/admin/reviews` - Quản lý reviews
  - Table: Product, User, Rating, Content, Status
  - Quick reply button
  - Approve/Reject actions

### ✅ Acceptance Criteria
- [x] Customer review với stars + text + images
- [x] Chỉ review nếu đã mua hàng
- [x] Admin reply trực tiếp trên review
- [x] Helpful button
- [x] Admin approve/reject reviews

---

## 🎯 SPRINT 5: Invoice PDF Export (Ngày 5)

### 📦 Tech Stack
- **Library:** `pdfkit` hoặc `react-pdf/renderer`
- **Storage:** Save PDF to `/public/invoices/` hoặc cloud storage

### 🔧 Backend API Endpoints

- `GET /api/orders/[id]/invoice` - Xuất PDF hóa đơn
  - Generate PDF with:
    - Company info & logo
    - Order details, items, pricing
    - Coupon & VIP discounts
    - QR code for payment
  - Return: PDF file download

### 🎨 Invoice Template

```
┌─────────────────────────────────────┐
│   PC BUILDER SHOP                   │
│   Địa chỉ: 123 Lý Thường Kiệt       │
│   Phone: 0123456789                 │
│                                     │
│   HÓA ĐƠN BÁN HÀNG                  │
│   #INV-20241204-001                 │
│   Ngày: 04/12/2024                  │
├─────────────────────────────────────┤
│ Khách hàng: Nguyễn Văn A            │
│ VIP Tier: VIP Bạc                   │
│ SĐT: 0987654321                     │
├─────────────────────────────────────┤
│ STT │ Sản phẩm        │ SL │ Giá   │
│  1  │ CPU Intel i9    │ 1  │ 10M   │
│  2  │ RAM 32GB        │ 2  │ 4M    │
├─────────────────────────────────────┤
│ Tạm tính:              18.000.000₫ │
│ Coupon (SALE10):       -1.800.000₫ │
│ VIP Discount (4%):       -648.000₫ │
│ TỔNG CỘNG:             15.552.000₫ │
├─────────────────────────────────────┤
│ Phương thức: VNPay                  │
│ Trạng thái: Đã thanh toán           │
│                                     │
│ Cảm ơn quý khách!                   │
│ [QR Code]                           │
└─────────────────────────────────────┘
```

### ✅ Acceptance Criteria
- [x] Generate PDF với đầy đủ thông tin
- [x] Hiển thị coupon + VIP discount
- [x] Download button ở order detail
- [x] PDF professional & branded

---

## 🎯 SPRINT 6: VNPay Payment Gateway (Ngày 6-7)

### 📦 VNPay Integration

**Flow:**
1. Customer chọn "Thanh toán VNPay"
2. Backend tạo payment URL với HMAC signature
3. Redirect đến VNPay sandbox
4. VNPay callback về `/api/vnpay/callback`
5. Verify signature & update order status

### 🔧 Backend API Endpoints

- `POST /api/vnpay/create-payment` - Tạo payment URL
  - Input: `{ orderId, amount, bankCode? }`
  - Output: `{ paymentUrl }`
- `GET /api/vnpay/callback` - VNPay IPN callback
  - Verify signature
  - Update order status
  - Send notification

### 📋 Environment Variables
```env
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/checkout/success
```

### 🎨 UI Components

**Customer:**
- `Checkout` page:
  - Payment method selector: Bank Transfer | Cash | VNPay
  - VNPay button → redirect to gateway
- `/checkout/success` - Payment success page
- `/checkout/failed` - Payment failed page

### ✅ Acceptance Criteria
- [x] VNPay sandbox integration working
- [x] Order auto-update sau payment
- [x] Secure HMAC signature verification
- [x] Error handling & retry logic

---

## 🎯 SPRINT 7: Customer UI/UX Enhancements (Ngày 7-8)

### 🎨 UI Components to Build

**1. Coupon Selection Modal (giống Shopee)**
```
┌───────────────────────────────────┐
│  Chọn mã giảm giá                 │
├───────────────────────────────────┤
│  🎟️ SALE50 - Giảm 50k           ▶│
│     Đơn tối thiểu 500k             │
│     HSD: 31/12/2024                │
├───────────────────────────────────┤
│  🎟️ VIP10 - Giảm 10%            ▶│
│     Chỉ dành cho VIP               │
│     HSD: 15/01/2025                │
├───────────────────────────────────┤
│  [Nhập mã khác...]                 │
│  [Áp dụng]                         │
└───────────────────────────────────┘
```

**2. VIP Progress Bar**
```
┌───────────────────────────────────┐
│  🏆 VIP Bạc                        │
│  ━━━━━━━━━━━━━━━━━━━━ 60%        │
│  Đã mua: 12.000.000₫               │
│  Còn 8.000.000₫ nữa lên VIP Vàng   │
│  Giảm giá hiện tại: 4%             │
└───────────────────────────────────┘
```

**3. Checkout Summary**
```
┌───────────────────────────────────┐
│  Tổng tiền hàng    18.000.000₫    │
│  Coupon (SALE10)   -1.800.000₫    │
│  VIP Discount      -648.000₫      │
│  ─────────────────────────────    │
│  Tổng thanh toán   15.552.000₫    │
│                                    │
│  [🎟️ Chọn mã giảm giá]          │
│  [💳 Thanh toán]                  │
└───────────────────────────────────┘
```

**4. Low Stock Badge**
```html
<div class="product-card">
  <span class="badge badge-warning">
    ⚠️ Chỉ còn 3 sản phẩm
  </span>
</div>
```

**5. Review Section với Admin Reply**
```
┌───────────────────────────────────┐
│  ⭐⭐⭐⭐⭐  Rất hài lòng!         │
│  Nguyễn Văn A - 01/12/2024        │
│  Sản phẩm chất lượng, ship nhanh  │
│  [🖼️ Image 1] [🖼️ Image 2]       │
│                                    │
│  👍 Hữu ích (15)  💬 Admin reply   │
│  ┌─────────────────────────────┐  │
│  │ 💼 PC Builder Shop:          │  │
│  │ Cảm ơn bạn đã tin tưởng!     │  │
│  └─────────────────────────────┘  │
└───────────────────────────────────┘
```

### ✅ Acceptance Criteria
- [x] Coupon modal đẹp giống Shopee/Tiki
- [x] VIP badge & progress bar
- [x] Checkout hiển thị breakdown giá rõ ràng
- [x] Low stock warnings
- [x] Review UI với images & admin replies

---

## 📅 TIMELINE TỔNG THỂ

| Sprint | Feature | Duration | Priority |
|--------|---------|----------|----------|
| 1 | Coupon System | 2 ngày | 🔴 High |
| 2 | VIP Tier System | 1 ngày | 🔴 High |
| 3 | Inventory Management | 1 ngày | 🟡 Medium |
| 4 | Review + Admin Reply | 1 ngày | 🟡 Medium |
| 5 | Invoice PDF Export | 0.5 ngày | 🟢 Low |
| 6 | VNPay Integration | 1 ngày | 🔴 High |
| 7 | Customer UI/UX | 1 ngày | 🔴 High |

**TỔNG: 7-8 ngày làm việc**

---

## 🚀 NEXT STEPS

1. **Review kế hoạch** - Bạn approve plan này?
2. **Bắt đầu Sprint 1** - Implement Coupon System
3. **Daily standup** - Báo cáo progress mỗi ngày

**Sẵn sàng bắt đầu Sprint 1? 🎯**
