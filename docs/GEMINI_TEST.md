# 🧪 TEST GEMINI API

## Bước 1: Đảm bảo đã có API key

Kiểm tra file `.env` có dòng:
```bash
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

## Bước 2: Start dev server

```bash
npm run dev
```

## Bước 3: Test GET endpoint (kiểm tra connection)

Mở browser hoặc dùng curl:

```bash
# Browser
http://localhost:3000/api/chat/test

# PowerShell
curl http://localhost:3000/api/chat/test
```

**Expected response:**
```json
{
  "success": true,
  "message": "✅ Gemini API đã kết nối thành công!",
  "model": "gemini-1.5-flash",
  "status": "ready"
}
```

## Bước 4: Test POST endpoint (chat thử)

```bash
# PowerShell
$body = @{
    message = "Xin chào, tôi muốn build PC gaming 30 triệu"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/chat/test" -Method POST -Body $body -ContentType "application/json"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "userMessage": "Xin chào, tôi muốn build PC gaming 30 triệu",
    "aiResponse": "Chào bạn! Với budget 30 triệu cho gaming...",
    "timestamp": "2025-12-13T...",
    "model": "gemini-1.5-flash"
  }
}
```

## Bước 5: Test với nhiều message khác nhau

```bash
# Test 1: Hỏi về CPU
$body = @{ message = "i5 và i7 khác nhau gì?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/chat/test" -Method POST -Body $body -ContentType "application/json"

# Test 2: Hỏi về tương thích
$body = @{ message = "i9-14900K dùng với B760 có được không?" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/chat/test" -Method POST -Body $body -ContentType "application/json"

# Test 3: Hỏi về build
$body = @{ message = "Build PC render video 40 triệu" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/chat/test" -Method POST -Body $body -ContentType "application/json"
```

## ❌ Troubleshooting

### Error: "API key không hợp lệ"
- Kiểm tra lại API key trong `.env`
- Đảm bảo không có khoảng trắng thừa
- Key phải bắt đầu bằng `AIzaSy...`

### Error: "Đã vượt quá giới hạn"
- Free tier: 15 requests/phút
- Đợi 1 phút rồi thử lại

### Error: "Cannot find module '@google/generative-ai'"
```bash
npm install @google/generative-ai
```

### Server không restart sau khi thay đổi .env
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ✅ Khi nào test thành công?

Bạn sẽ thấy:
1. ✅ GET `/api/chat/test` trả về `success: true`
2. ✅ POST với message bất kỳ trả về AI response bằng tiếng Việt
3. ✅ Response có nội dung liên quan đến PC Builder

➡️ **Tiếp theo: Build full chatbot UI!**
