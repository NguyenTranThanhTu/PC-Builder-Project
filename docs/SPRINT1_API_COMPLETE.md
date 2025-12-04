# Sprint 1: Coupon System - API Layer Complete ✅

## Completion Status
Database Layer ✅ + API Layer ✅ = **Ready for UI Development**

---

## 🎯 APIs Created

### 1. Admin APIs - Coupon Management
**Base:** `/api/admin/coupons`

#### GET `/api/admin/coupons`
List all coupons with filtering and pagination
- **Query Params:** 
  - `search` - Search by code or description
  - `isActive` - Filter by active status (true/false)
  - `forVIPOnly` - Filter VIP-only coupons (true/false)
  - `page` - Page number (default: 1)
  - `pageSize` - Items per page (default: 10)
- **Response:**
```json
{
  "coupons": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "pageCount": 5
  }
}
```

#### POST `/api/admin/coupons`
Create new coupon
- **Body:**
```json
{
  "code": "WELCOME10",
  "description": "Giảm 10% cho đơn hàng đầu tiên",
  "discountType": "PERCENTAGE", // or "FIXED_AMOUNT"
  "discountValue": 10, // 10% or amount in cents
  "minOrderValue": 100000, // cents
  "maxDiscount": 50000, // cents (optional)
  "maxUsage": 100, // optional
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "isActive": true,
  "forVIPOnly": false,
  "minVIPTier": null // 1, 2, or 3 (optional)
}
```

#### GET `/api/admin/coupons/[id]`
Get coupon details with usage history (last 10 orders)

#### PUT `/api/admin/coupons/[id]`
Update coupon (code cannot be changed)

#### DELETE `/api/admin/coupons/[id]`
Delete coupon
- **Smart Delete:** 
  - If used → Deactivate (soft delete)
  - If unused → Permanent delete

---

### 2. Customer APIs - Coupon Validation

#### POST `/api/coupons/validate`
Validate coupon and calculate discount in real-time
- **Body:**
```json
{
  "couponCode": "WELCOME10",
  "orderTotal": 1000000 // cents
}
```
- **Response (Valid):**
```json
{
  "valid": true,
  "coupon": {
    "id": "...",
    "code": "WELCOME10",
    "description": "Giảm 10% cho đơn hàng đầu tiên",
    "discountType": "PERCENTAGE",
    "discountValue": 10
  },
  "discountAmount": 100000, // cents
  "discountPercent": 10,
  "finalTotal": 900000 // cents
}
```
- **Response (Invalid):**
```json
{
  "error": "Mã khuyến mãi đã hết hạn",
  "valid": false
}
```

**Validation Rules:**
- ❌ Code không tồn tại
- ❌ Mã đã bị vô hiệu hóa
- ❌ Chưa đến ngày bắt đầu
- ❌ Đã hết hạn
- ❌ Đã hết lượt sử dụng
- ❌ Chỉ dành cho VIP (user không phải VIP)
- ❌ Yêu cầu VIP tier cao hơn
- ❌ Đơn hàng chưa đạt giá trị tối thiểu

---

### 3. Updated Order API

#### POST `/api/orders`
Added coupon and VIP discount support
- **New Fields:**
```json
{
  "items": [...],
  "customerName": "...",
  "couponCode": "WELCOME10" // NEW: Optional
}
```

**Discount Calculation Logic:**
```
Subtotal = Σ(product price × quantity)
VIP Discount = Subtotal × VIP Tier %  (3%, 4%, or 5%)
After VIP = Subtotal - VIP Discount

Coupon Discount = Calculate based on:
  - PERCENTAGE: After VIP × coupon %
  - FIXED_AMOUNT: Fixed value in cents
  - Apply maxDiscount cap if exists
  
Total = After VIP - Coupon Discount
```

**Response:**
```json
{
  "order": {
    "id": "...",
    "subtotalCents": 1000000,
    "vipDiscount": 30000,    // 3% VIP Đồng
    "couponCode": "WELCOME10",
    "couponDiscount": 97000,  // 10% of (1000000 - 30000)
    "totalCents": 873000
  },
  "vipUpgrade": {
    "upgraded": true,        // User was upgraded!
    "oldTier": 0,
    "newTier": 1             // Now VIP Đồng
  }
}
```

**Transaction Safety:**
- ✅ Create order
- ✅ Record OrderCoupon junction
- ✅ Increment coupon usage count
- ✅ Update user totalSpent
- ✅ Decrement product stock
- ✅ All atomic (rollback on error)

---

## 🔄 VIP Auto-Upgrade System

**Utility:** `/src/lib/vipTier.ts`

Function: `checkAndUpgradeVIPTier(userId)`
- Called after every successful order
- Checks if `user.totalSpent` qualifies for higher tier
- Auto-upgrades and updates `lastTierUpdate`
- Returns upgrade status to show congratulations message

**Tiers (from seed data):**
- VIP Đồng: 5,000,000₫ → 3% discount
- VIP Bạc: 20,000,000₫ → 4% discount
- VIP Vàng: 50,000,000₫ → 5% discount

---

## 📊 Database Schema (from migration)

### Coupon
```prisma
model Coupon {
  id             String        @id @default(cuid())
  code           String        @unique // UPPERCASE
  description    String?
  discountType   DiscountType  // PERCENTAGE | FIXED_AMOUNT
  discountValue  Int           // cents or %
  minOrderValue  Int           @default(0) // cents
  maxDiscount    Int?          // cents (cap for %)
  maxUsage       Int?          // null = unlimited
  usageCount     Int           @default(0)
  startDate      DateTime
  endDate        DateTime
  isActive       Boolean       @default(true)
  forVIPOnly     Boolean       @default(false)
  minVIPTier     Int?          // 1, 2, or 3
  orderCoupons   OrderCoupon[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}
```

### OrderCoupon (Junction Table)
```prisma
model OrderCoupon {
  id             String   @id @default(cuid())
  orderId        String
  couponId       String
  discountAmount Int      // cents at time of use
  order          Order    @relation(...)
  coupon         Coupon   @relation(...)
  createdAt      DateTime @default(now())
}
```

### VIPTierConfig
```prisma
model VIPTierConfig {
  id              String @id @default(cuid())
  tier            Int    @unique // 1, 2, 3
  name            String // "VIP Đồng", "VIP Bạc", "VIP Vàng"
  minSpend        Int    // cents
  discountPercent Int    // 3, 4, 5
  badgeColor      String // Hex color for UI badge
}
```

### Updated Models
```prisma
model User {
  vipTier        Int      @default(0)
  totalSpent     Int      @default(0)
  lastTierUpdate DateTime?
}

model Order {
  subtotalCents   Int @default(0)
  couponCode      String?
  couponDiscount  Int @default(0)
  vipDiscount     Int @default(0)
  orderCoupons    OrderCoupon[]
}
```

---

## 🧪 Testing the APIs

### Using REST Client (docs/admin.http)

```http
### Get all coupons
GET http://localhost:3000/api/admin/coupons?search=VIP&isActive=true
Authorization: Bearer {{adminToken}}

### Create coupon
POST http://localhost:3000/api/admin/coupons
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "code": "FLASH25",
  "description": "Flash sale 25% giảm giá",
  "discountType": "PERCENTAGE",
  "discountValue": 25,
  "minOrderValue": 500000,
  "maxDiscount": 200000,
  "maxUsage": 50,
  "startDate": "2024-12-10T00:00:00Z",
  "endDate": "2024-12-10T23:59:59Z",
  "isActive": true
}

### Validate coupon
POST http://localhost:3000/api/coupons/validate
Authorization: Bearer {{userToken}}
Content-Type: application/json

{
  "couponCode": "WELCOME10",
  "orderTotal": 1500000
}

### Create order with coupon
POST http://localhost:3000/api/orders
Authorization: Bearer {{userToken}}
Content-Type: application/json

{
  "items": [
    { "productId": "...", "quantity": 1 }
  ],
  "customerName": "Nguyễn Văn A",
  "customerEmail": "test@example.com",
  "customerPhone": "0909123456",
  "shippingAddress": "123 ABC Street",
  "city": "Hồ Chí Minh",
  "country": "Vietnam",
  "paymentMethod": "COD",
  "couponCode": "WELCOME10"
}
```

---

## ✅ What's Complete

1. **Admin CRUD APIs** - Full coupon management
2. **Customer Validation API** - Real-time coupon validation
3. **Order API Integration** - Automatic discount calculation
4. **VIP Auto-Upgrade** - After each order completion
5. **Database Schema** - Migrated and seeded
6. **Sample Data** - 3 VIP tiers + 5 coupons ready

---

## 🚧 Next Steps (UI Development)

### Admin UI
- [ ] `/admin/coupons` - List page with filters
- [ ] Create/Edit coupon modal (form validation)
- [ ] Coupon usage analytics chart
- [ ] Quick actions: Activate/Deactivate toggle

### Customer UI
- [ ] Coupon selector modal (Shopee-style)
- [ ] Real-time validation feedback
- [ ] Discount breakdown in cart
- [ ] VIP upgrade celebration modal
- [ ] VIP badge in header/profile

---

## 💡 Implementation Notes

**Price Handling:**
- All prices stored in **cents** (avoid float errors)
- VND format: `(cents / 100).toLocaleString('vi-VN')`

**Coupon Code:**
- Always converted to UPPERCASE
- Unique constraint in database

**VIP Discount Priority:**
- VIP discount applied FIRST (to subtotal)
- Coupon discount applied SECOND (to amount after VIP)

**Security:**
- Admin APIs: Require `isAdmin()` check
- Customer APIs: Require authenticated session
- Validation: Server-side only (never trust client)

**TypeScript:**
- Run `npx prisma generate` after schema changes
- Restart TypeScript server if types not updating
