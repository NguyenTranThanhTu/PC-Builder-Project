# Kế hoạch phát triển PC-Builder-Project

## 📋 Tổng quan tính năng hiện có

### ✅ Đã hoàn thiện:
1. **Hệ thống sản phẩm**:
   - CRUD sản phẩm (admin)
   - Quản lý danh mục
   - Thuộc tính sản phẩm động
   - Upload ảnh
   - Quản lý tồn kho (stock)
   - Soft-delete (DRAFT/PUBLISHED/ARCHIVED)

2. **Hệ thống đơn hàng**:
   - Đặt hàng
   - Quản lý đơn hàng (admin)
   - Cập nhật trạng thái (PENDING → PROCESSING → SHIPPED → COMPLETED)
   - Hủy đơn hàng với lý do
   - Thông báo trạng thái đơn hàng
   - **Tự động trừ kho khi đặt hàng** ✅

3. **Giỏ hàng**:
   - Thêm/xóa/cập nhật số lượng
   - Lưu trữ local storage
   - Hiển thị tổng tiền

4. **Người dùng**:
   - Đăng ký/đăng nhập (NextAuth + Google)
   - Phân quyền USER/ADMIN
   - Xem lịch sử đơn hàng

5. **PC Builder**:
   - Chọn linh kiện
   - Kiểm tra tương thích (đã có schema)

## 🚀 Các tính năng cần phát triển theo yêu cầu

### 1. Quản lý khuyến mãi/Mã giảm giá (PRIORITY: HIGH)

#### Frontend đã có:
- `src/components/Cart/Discount.tsx` - UI nhập mã ở trang giỏ hàng
- `src/components/Checkout/Coupon.tsx` - UI nhập mã ở trang checkout

#### Cần phát triển:
- [ ] Thêm model `Coupon` vào Prisma schema
- [ ] API tạo/sửa/xóa mã giảm giá (admin)
- [ ] API validate và áp dụng mã giảm giá
- [ ] Logic tính toán giảm giá (%, số tiền cố định, free ship)
- [ ] Hiển thị giảm giá trong checkout
- [ ] Lưu mã đã sử dụng vào order

**Schema đề xuất:**
```prisma
model Coupon {
  id            String    @id @default(cuid())
  code          String    @unique
  type          CouponType // PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING
  value         Int       // Giá trị giảm (% hoặc cents)
  minOrderValue Int?      // Đơn tối thiểu
  maxDiscount   Int?      // Giảm tối đa (cho %)
  usageLimit    Int?      // Số lần dùng tối đa
  usedCount     Int       @default(0)
  startDate     DateTime?
  endDate       DateTime?
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  orders        Order[]   @relation("OrderCoupon")
}

enum CouponType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
}
```

### 2. Quản lý kho nâng cao (PRIORITY: HIGH)

#### Đã có:
- Trường `stock` trong Product ✅
- Trừ kho khi đặt hàng ✅
- Kiểm tra tồn kho trước khi đặt hàng ✅

#### Cần phát triển:
- [ ] **Giới hạn số lượng mua tối đa theo stock**
  - Cập nhật UI giỏ hàng: không cho tăng số lượng nếu vượt stock
  - Validate ở API khi đặt hàng
- [ ] **Cảnh báo hết hàng**
  - Badge "Hết hàng" trên product listing
  - Disable nút "Add to Cart"
- [ ] **Cộng lại kho khi hủy đơn**
  - Thêm logic restore stock khi order status → CANCELLED
- [ ] **Lịch sử nhập/xuất kho (optional)**

### 3. Hệ thống đánh giá sản phẩm (PRIORITY: MEDIUM)

#### Đã có:
- Model `Review` trong schema ✅
- API POST `/api/reviews` để tạo đánh giá ✅
- Admin dashboard hiển thị reviews ✅

#### Cần phát triển:
- [ ] **UI frontend cho khách hàng đánh giá**
  - Form đánh giá với rating (1-5 sao) và nội dung
  - Hiển thị danh sách đánh giá trên trang chi tiết sản phẩm
- [ ] **Admin trả lời đánh giá**
  - Thêm trường `adminReply` vào model Review
  - UI admin để trả lời đánh giá
  - Hiển thị câu trả lời trên frontend
- [ ] **Duyệt/ẩn đánh giá**
  - Trang quản lý reviews cho admin
  - Approve/reject reviews
  - Filter theo rating, product
- [ ] **Tính trung bình rating cho sản phẩm**

### 4. Hệ thống khách hàng VIP (PRIORITY: LOW)

#### Cần phát triển:
- [ ] Thêm trường `loyaltyPoints`, `tier` vào User model
- [ ] Logic tích điểm dựa trên tổng giá trị đơn hàng
- [ ] Các mức VIP: BRONZE, SILVER, GOLD, PLATINUM
- [ ] Giảm giá tự động cho từng tier
- [ ] UI hiển thị điểm và tier trên My Account

**Schema đề xuất:**
```prisma
enum UserTier {
  STANDARD
  BRONZE    // >= 5 triệu
  SILVER    // >= 10 triệu
  GOLD      // >= 20 triệu
  PLATINUM  // >= 50 triệu
}

model User {
  // ...existing fields
  loyaltyPoints  Int       @default(0)
  tier           UserTier  @default(STANDARD)
  totalSpent     Int       @default(0) // tổng chi tiêu (cents)
}
```

### 5. Hoàn thiện quản lý user (đang dở)

#### Đã có:
- Trang `/admin/users` hiển thị danh sách ✅
- API GET `/api/admin/users` ✅

#### Cần phát triển:
- [ ] Chi tiết user (view)
- [ ] Chỉnh sửa thông tin user
- [ ] Xóa/khóa user
- [ ] Xem lịch sử đơn hàng của user
- [ ] Thống kê chi tiêu

## 📅 Lộ trình triển khai đề xuất

### Sprint 1: Quản lý kho & UI cơ bản (1-2 ngày)
1. Giới hạn số lượng mua theo stock
2. Cảnh báo hết hàng trên UI
3. Cộng lại kho khi hủy đơn

### Sprint 2: Hệ thống mã giảm giá (2-3 ngày)
1. Tạo Coupon model + migration
2. Admin CRUD coupon
3. API validate & apply coupon
4. Tích hợp vào checkout flow

### Sprint 3: Hệ thống đánh giá (2-3 ngày)
1. UI frontend đánh giá sản phẩm
2. Hiển thị reviews trên product detail
3. Admin trả lời & duyệt reviews
4. Tính trung bình rating

### Sprint 4: Khách hàng VIP (1-2 ngày)
1. User tier system
2. Logic tích điểm
3. Giảm giá tự động theo tier

### Sprint 5: Hoàn thiện quản lý user (1 ngày)
1. CRUD user cho admin
2. Xem chi tiết & thống kê user

## 📝 Ghi chú kỹ thuật

- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth
- Frontend: Next.js 15, React 19, Tailwind CSS
- State: Redux Toolkit

## ✅ Checklist trước khi bắt đầu

- [x] Đọc kỹ toàn bộ code hiện tại
- [x] Hiểu rõ schema database
- [x] Xác định các tính năng cần phát triển
- [ ] Xác nhận lộ trình với sếp/team
- [ ] Bắt đầu Sprint 1
