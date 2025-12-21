# 🔑 HƯỚNG DẪN LẤY GEMINI API KEY

## Bước 1: Truy cập Google AI Studio

1. Vào: **https://aistudio.google.com/app/apikey**
2. Đăng nhập bằng tài khoản Google của bạn

## Bước 2: Tạo API Key

1. Click nút **"Create API key"**
2. Chọn project hoặc tạo project mới
3. Copy API key (dạng: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

## Bước 3: Cập nhật vào .env

```bash
# Mở file .env
# Tìm dòng: GEMINI_API_KEY="your-gemini-api-key-here"
# Thay bằng key vừa copy

GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

## Bước 4: Restart dev server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## ⚠️ Lưu ý bảo mật

- ❌ **KHÔNG** commit API key lên Git
- ✅ File `.env` đã có trong `.gitignore`
- ✅ API key chỉ dùng server-side (không expose ra frontend)

## 📊 Free Tier Limits

- **15 requests/phút**
- **1,500 requests/ngày**
- **Miễn phí hoàn toàn** cho personal use

➡️ Đủ dùng cho shop nhỏ/vừa!

## 🔗 Links hữu ích

- API Keys: https://aistudio.google.com/app/apikey
- Documentation: https://ai.google.dev/
- Pricing: https://ai.google.dev/pricing

---

**✅ Sau khi có API key, tiếp tục với bước tiếp theo!**
