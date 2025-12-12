# Hướng dẫn cấu hình Cloudinary

## Bước 1: Tạo tài khoản Cloudinary

1. Truy cập https://cloudinary.com
2. Click **Sign Up** (miễn phí)
3. Chọn plan **Free** (25GB storage, 25GB bandwidth/tháng)
4. Xác nhận email

## Bước 2: Lấy credentials

Sau khi đăng nhập, vào **Dashboard**:

1. Tìm phần **Account Details**
2. Copy các thông tin sau:
   - **Cloud Name**: (ví dụ: `dxyz123abc`)
   - **API Key**: (ví dụ: `123456789012345`)
   - **API Secret**: Click **👁️ Reveal** để xem (ví dụ: `AbcDefGhiJklMnoPqr_StUvWxYz`)

## Bước 3: Cập nhật .env.local

Mở file `.env.local` trong project và thay thế các giá trị:

```env
# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxyz123abc"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbcDefGhiJklMnoPqr_StUvWxYz"
```

⚠️ **LƯU Ý:**
- Cloud Name là **public** (dùng trong browser)
- API Key và API Secret là **private** (chỉ dùng trong server-side code)
- **KHÔNG commit .env.local** lên Git!

## Bước 4: Restart dev server

```bash
# Dừng server hiện tại (Ctrl + C)
npm run dev
```

## Bước 5: Test upload

1. Đăng nhập vào website
2. Vào **My Orders** → chọn đơn hàng **Hoàn thành**
3. Click **⭐ Đánh giá sản phẩm**
4. Upload ảnh → Kiểm tra console log
5. Submit review → Ảnh sẽ được lưu vào Cloudinary folder `reviews/`

## Kiểm tra trong Cloudinary Dashboard

1. Vào **Media Library**
2. Tìm folder **reviews**
3. Xem ảnh đã upload (có auto-optimization: max 1000x1000, quality auto, WebP)

## Tính năng đã tích hợp

✅ **Upload ảnh thật** lên Cloudinary (thay vì object URLs)
✅ **Auto optimization**: 
   - Resize max 1000x1000px
   - Auto quality (giảm dung lượng)
   - Auto format WebP (nếu browser hỗ trợ)
✅ **Validation**:
   - Chỉ chấp nhận JPG, PNG, WEBP
   - Max 5MB/ảnh
   - Max 5 ảnh/review
✅ **Delete API** (optional cleanup): `DELETE /api/upload?publicId=xxx`

## Troubleshooting

### Lỗi "Invalid credentials"
- Kiểm tra lại Cloud Name, API Key, API Secret
- Đảm bảo không có khoảng trắng thừa
- Restart dev server

### Lỗi "Upload failed"
- Kiểm tra kích thước file (<5MB)
- Kiểm tra định dạng file (JPG/PNG/WEBP)
- Kiểm tra network connection

### Ảnh không hiển thị
- Kiểm tra URL trong response có đúng không
- Kiểm tra CORS settings trong Cloudinary (mặc định cho phép tất cả origins)

## Chi phí

**Free plan giới hạn:**
- 25 GB storage
- 25 GB bandwidth/tháng
- 25,000 transformations/tháng

➡️ **Đủ cho development và small projects!**

Nếu vượt giới hạn → nâng cấp lên **Paid plan** (~$0.0008/GB)
