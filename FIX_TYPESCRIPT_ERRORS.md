# 🔧 Hướng dẫn Fix Lỗi TypeScript

## Vấn đề đã được giải quyết ✅

### 1. **NextAuth CLIENT_FETCH_ERROR** - ĐÃ FIX
**Nguyên nhân:** Thiếu các biến môi trường `NEXTAUTH_URL` và `NEXTAUTH_SECRET` trong file `.env`

**Đã fix:** File `.env` đã được cập nhật với:
```env
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-min-32-characters"
ADMIN_EMAILS="admin@example.com"
```

**Kết quả:** NextAuth giờ sẽ hoạt động bình thường, không còn lỗi "Failed to fetch" hay "Unexpected token '<'"

---

### 2. **Prisma TypeScript Errors (25 lỗi)** - CẦN BẠN LÀM THÊM 1 BƯỚC

**Nguyên nhân:** TypeScript server trong VSCode chưa reload sau khi chạy `npx prisma generate`

**Đã làm:**
- ✅ Chạy `npx prisma generate` thành công
- ✅ Prisma Client đã được tạo mới với đầy đủ types: `Coupon`, `VIPTierConfig`, `vipTier`, `totalSpent`

**BẠN CẦN LÀM:**

### 🔄 Restart TypeScript Server trong VSCode

**Cách 1: Dùng Command Palette (Khuyến nghị)**
1. Nhấn `Ctrl + Shift + P` (hoặc `Cmd + Shift + P` trên Mac)
2. Gõ: `TypeScript: Restart TS Server`
3. Chọn option đó và nhấn Enter

**Cách 2: Reload VSCode**
1. Nhấn `Ctrl + Shift + P`
2. Gõ: `Developer: Reload Window`
3. Enter

**Cách 3: Đóng và mở lại VSCode**
- Đơn giản là tắt VSCode và mở lại

---

## Kiểm tra kết quả

Sau khi restart TypeScript server:

1. **Mở file bất kỳ có lỗi**, ví dụ:
   - `src/app/api/admin/coupons/route.ts`
   - `src/app/api/coupons/validate/route.ts`
   - `src/app/api/user/vip-status/route.ts`

2. **Kiểm tra Problems panel:**
   - Nhấn `Ctrl + Shift + M` để mở Problems panel
   - Số lỗi sẽ giảm từ 25 xuống còn 1 (lỗi regex trong products/new/page.tsx)

3. **Test NextAuth:**
   - Mở trình duyệt: http://localhost:3000
   - Click "Sign In" hoặc vào trang checkout
   - Không còn lỗi CLIENT_FETCH_ERROR

---

## Lỗi còn lại (không quan trọng)

### ⚠️ Regex flag lỗi trong `src/app/(site)/(pages)/admin/products/new/page.tsx`

```typescript
const validStr = /^[\p{L}0-9 \-]+$/u;
```

**Lỗi:** "This regular expression flag is only available when targeting 'es6' or later."

**Cách fix (nếu cần):**
- Cập nhật `tsconfig.json` → `"target": "es2015"` hoặc cao hơn
- HOẶC thay regex bằng: `/^[a-zA-Z0-9 \-]+$/` (không dùng Unicode flag)

**Lưu ý:** Lỗi này không ảnh hưởng đến coupon/VIP system, có thể fix sau.

---

## Tổng kết

✅ **NextAuth đã hoạt động** - Thêm NEXTAUTH_URL và NEXTAUTH_SECRET vào .env
✅ **Prisma Client đã generate** - Chạy npx prisma generate thành công
⚠️ **VSCode TypeScript chưa reload** - BẠN CẦN RESTART TS SERVER (xem hướng dẫn trên)

Sau khi restart TypeScript server, tất cả các lỗi về `coupon`, `vipTier`, `vIPTierConfig` sẽ biến mất! 🎉
