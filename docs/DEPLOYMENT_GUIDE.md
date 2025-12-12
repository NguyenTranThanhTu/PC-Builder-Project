# 🚀 Hướng dẫn Deploy dự án

## ⚠️ QUAN TRỌNG: Environment Variables

**KHÔNG BAO GIỜ commit file `.env.local` hoặc `.env` lên Git!**

File `.gitignore` đã chặn `.env*.local`, nhưng hãy luôn kiểm tra trước khi push:
```bash
git status  # Đảm bảo .env.local KHÔNG xuất hiện
```

---

## 📋 Chuẩn bị trước khi deploy

### 1. Setup Database Production

**Tùy chọn A: Supabase (Khuyến nghị - Free tier tốt)**
1. Đăng ký: https://supabase.com
2. Tạo project mới
3. Vào **Settings** → **Database** → Copy **Connection String**
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Tùy chọn B: Railway**
1. Đăng ký: https://railway.app
2. New Project → Add PostgreSQL
3. Copy **DATABASE_URL** từ Variables tab

**Tùy chọn C: Neon (Serverless Postgres)**
1. Đăng ký: https://neon.tech
2. Tạo project → Copy connection string

### 2. Setup Cloudinary (Bắt buộc cho review photos)

1. Đăng ký FREE: https://cloudinary.com
2. Vào **Dashboard** → **Product Environment Credentials**
3. Lấy 3 giá trị:
   - Cloud Name
   - API Key  
   - API Secret

### 3. Setup VNPay (Tùy chọn - chỉ nếu cần thanh toán online)

**Sandbox (Testing):**
- Đăng ký: https://sandbox.vnpayment.vn
- Lấy TMN Code và Hash Secret

**Production (Doanh nghiệp):**
- Liên hệ: https://vnpay.vn
- Cần giấy phép kinh doanh

---

## 🎯 Deploy lên Vercel (Khuyến nghị)

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Bước 2: Import vào Vercel

1. Truy cập: https://vercel.com
2. Click **Add New** → **Project**
3. Import GitHub repository của bạn
4. Vercel sẽ tự detect Next.js

### Bước 3: Configure Environment Variables

Trong **Settings** → **Environment Variables**, thêm:

#### BẮT BUỘC:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate mới bằng: openssl rand -base64 32>
ADMIN_EMAILS=your-email@gmail.com
```

#### BẮT BUỘC cho Review Photos:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### TÙY CHỌN (Google OAuth):
```env
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

**Lưu ý Google OAuth:**
- Vào https://console.cloud.google.com/apis/credentials
- Thêm **Authorized redirect URIs**: `https://your-domain.vercel.app/api/auth/callback/google`

#### TÙY CHỌN (VNPay):
```env
VNPAY_TMN_CODE=your-code
VNPAY_HASH_SECRET=your-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://your-domain.vercel.app/api/vnpay/return
```

### Bước 4: Run Migrations

Sau khi deploy lần đầu:

1. Vào **Settings** → **Environment Variables**
2. Thêm thêm biến **SHADOW_DATABASE_URL** (giống DATABASE_URL)
3. Chạy migrations qua Vercel CLI hoặc GitHub Actions

**Hoặc** chạy local trước khi deploy:
```bash
# Set DATABASE_URL to production
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Bước 5: Deploy!

Click **Deploy** → Vercel sẽ build và deploy tự động

**Đợi ~3-5 phút** → Website live tại `https://your-project.vercel.app`

---

## 🌐 Deploy lên Railway

### Bước 1: Tạo Railway project

1. Đăng ký: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Chọn repository của bạn

### Bước 2: Add PostgreSQL

1. Click **+ New** → **Database** → **Add PostgreSQL**
2. Railway tự động tạo biến `DATABASE_URL`

### Bước 3: Add Environment Variables

Vào **Variables** tab, thêm:

```env
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=<generate mới>
ADMIN_EMAILS=your-email@gmail.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Bước 4: Deploy

Railway tự động deploy khi push code lên GitHub!

---

## 🐳 Deploy với Docker (Advanced)

Nếu muốn self-host trên VPS/AWS:

```bash
# Build Docker image
docker build -t pc-builder .

# Run với env file
docker run -p 3000:3000 --env-file .env.production pc-builder
```

---

## 🧪 Testing Production Build Locally

Trước khi deploy, test production build:

```bash
# Build
npm run build

# Start production server
npm start
```

Kiểm tra:
- ✅ No build errors
- ✅ Database migrations hoạt động
- ✅ Cloudinary upload hoạt động
- ✅ VNPay redirect đúng URL

---

## 📊 Checklist Deploy

- [ ] Database production đã setup (Supabase/Railway/Neon)
- [ ] Cloudinary account đã tạo (FREE plan)
- [ ] Environment variables đã config đầy đủ
- [ ] `.env.local` KHÔNG được commit
- [ ] `NEXTAUTH_SECRET` đã generate mới cho production
- [ ] `NEXTAUTH_URL` đã đổi thành domain production
- [ ] Google OAuth redirect URIs đã cập nhật (nếu dùng)
- [ ] VNPay return URL đã đổi thành domain production (nếu dùng)
- [ ] Database migrations đã chạy trên production DB
- [ ] Seed data đã chạy (nếu cần demo categories/products)

---

## 🆘 Troubleshooting

### Lỗi "Invalid api_key"
→ Cloudinary credentials chưa đúng, kiểm tra lại `.env`

### Lỗi "NEXTAUTH_URL mismatch"
→ Đổi `NEXTAUTH_URL` thành domain production (https://...)

### Database connection failed
→ Kiểm tra `DATABASE_URL` format đúng chưa, firewall có block IP Vercel không

### Images không load
→ Kiểm tra Cloudinary `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` có đúng không

### Build failed
→ Chạy `npm run build` local trước để catch errors sớm

---

## 💰 Chi phí dự kiến

**FREE tier (đủ cho demo/small projects):**
- **Vercel**: Free (100GB bandwidth/tháng)
- **Supabase**: Free (500MB database, 1GB bandwidth/tháng)
- **Cloudinary**: Free (25GB storage, 25GB bandwidth/tháng)
- **VNPay Sandbox**: Free testing

**Total: $0/tháng** ✨

**Paid nếu scale lớn:**
- Vercel Pro: $20/tháng
- Supabase Pro: $25/tháng
- Cloudinary: ~$50/tháng cho 200GB
