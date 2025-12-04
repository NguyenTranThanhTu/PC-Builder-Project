# VNPay Payment Gateway Integration Guide

## 📋 Tổng quan

Sprint 6 đã hoàn thành tích hợp VNPay Payment Gateway vào hệ thống, cho phép khách hàng thanh toán trực tuyến qua cổng thanh toán VNPay.

## ✅ Các tính năng đã triển khai

### Backend
- ✅ **VNPay Helper Library** (`src/lib/vnpay.ts`)
  - Tạo và xác thực chữ ký HMAC SHA512
  - Tạo payment URL với đầy đủ tham số
  - Xử lý response codes từ VNPay
  - Hỗ trợ 14+ ngân hàng Việt Nam

- ✅ **API Endpoints**
  - `POST /api/vnpay/create-payment`: Tạo link thanh toán
  - `GET /api/vnpay/return`: Xử lý callback từ browser
  - `GET /api/vnpay/ipn`: Xử lý IPN từ VNPay server

### Frontend
- ✅ **Payment UI**
  - Thêm option VNPay vào Payment Method
  - Dropdown chọn ngân hàng (không bắt buộc)
  - Loading state khi đang xử lý thanh toán
  - Dynamic button text theo phương thức thanh toán

- ✅ **Payment Result Pages**
  - `/payment/success`: Hiển thị thông tin thanh toán thành công
  - `/payment/failed`: Hiển thị lỗi và gợi ý giải quyết

## 🔧 Cấu hình

### 1. Đăng ký VNPay Sandbox

1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản sandbox
3. Lấy thông tin:
   - `TMN Code` (Terminal/Merchant Code)
   - `Hash Secret Key`

### 2. Cấu hình Environment Variables

Cập nhật file `.env` với thông tin VNPay:

```env
# VNPay Payment Gateway Configuration
VNPAY_TMN_CODE="your-vnpay-tmn-code"
VNPAY_HASH_SECRET="your-vnpay-hash-secret"
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL="http://localhost:3002/api/vnpay/return"
```

**Lưu ý:**
- `VNPAY_TMN_CODE`: Mã terminal từ VNPay
- `VNPAY_HASH_SECRET`: Secret key để ký giao dịch
- `VNPAY_URL`: URL sandbox (production sẽ khác)
- `VNPAY_RETURN_URL`: URL callback về hệ thống (phải match với port hiện tại)

### 3. Khởi động lại server

```bash
npm run dev
```

## 🚀 Luồng thanh toán

### 1. Customer Checkout Flow

```
Khách hàng → Checkout → Chọn VNPay → Nhập thông tin → Submit
     ↓
POST /api/orders (tạo đơn hàng với status PENDING)
     ↓
POST /api/vnpay/create-payment (tạo payment URL)
     ↓
Redirect → VNPay Gateway
     ↓
Khách hàng thanh toán tại VNPay
     ↓
VNPay callback → GET /api/vnpay/return
     ↓
Update order status → PROCESSING
     ↓
Redirect → /payment/success hoặc /payment/failed
```

### 2. VNPay IPN (Server-to-Server)

```
VNPay Server → GET /api/vnpay/ipn
     ↓
Verify signature
     ↓
Validate order & amount
     ↓
Update order status
     ↓
Return response code to VNPay
```

## 📝 Chi tiết kỹ thuật

### Signature Generation

VNPay sử dụng HMAC SHA512 để ký giao dịch:

1. **Sắp xếp parameters** theo alphabet
2. **Tạo query string** (key=value&key2=value2)
3. **Hash với secret key** bằng HMAC SHA512
4. **Chuyển sang uppercase**

Code implementation:
```typescript
function createSignature(data: string, secretKey: string): string {
  const hmac = crypto.createHmac("sha512", secretKey);
  return hmac.update(Buffer.from(data, "utf-8")).digest("hex");
}
```

### Payment URL Parameters

- `vnp_Version`: 2.1.0
- `vnp_Command`: pay
- `vnp_TmnCode`: Terminal code
- `vnp_Amount`: Số tiền * 100 (đơn vị nhỏ nhất)
- `vnp_CurrCode`: VND
- `vnp_TxnRef`: Order ID
- `vnp_OrderInfo`: Mô tả đơn hàng
- `vnp_OrderType`: other
- `vnp_Locale`: vn
- `vnp_ReturnUrl`: Callback URL
- `vnp_IpAddr`: Client IP
- `vnp_CreateDate`: YYYYMMDDHHmmss
- `vnp_ExpireDate`: +15 phút
- `vnp_BankCode`: (Optional) Mã ngân hàng
- `vnp_SecureHash`: Chữ ký

### Response Codes

| Code | Ý nghĩa |
|------|---------|
| 00 | Giao dịch thành công |
| 07 | Trừ tiền thành công, nghi vấn giao dịch |
| 09 | Giao dịch chưa hoàn tất |
| 10 | Giao dịch không thành công |
| 11 | Đã hết hạn chờ thanh toán |
| 12 | Thẻ/Tài khoản bị khóa |
| 13 | OTP không đúng |
| 24 | Khách hàng hủy giao dịch |
| 51 | Tài khoản không đủ số dư |
| 65 | Tài khoản vượt quá số lần thanh toán |
| 75 | Ngân hàng thanh toán đang bảo trì |
| 79 | Giao dịch vượt quá số tiền giới hạn |

## 🧪 Testing

### Test với VNPay Sandbox

1. **Tạo đơn hàng**
   - Đăng nhập hoặc checkout as guest
   - Thêm sản phẩm vào giỏ
   - Proceed to checkout

2. **Chọn VNPay payment**
   - Chọn payment method: VNPay
   - (Optional) Chọn ngân hàng
   - Click "Thanh toán VNPay"

3. **Test tại VNPay sandbox**
   - Sử dụng thẻ test từ VNPay sandbox
   - Test cả success và failed scenarios

4. **Verify callback**
   - Kiểm tra order status trong database
   - Kiểm tra redirect về success/failed page
   - Kiểm tra transaction number trong order notes

### Test Cases

- ✅ Successful payment với QR code
- ✅ Successful payment với bank selection
- ✅ Failed payment (insufficient balance)
- ✅ Failed payment (user cancelled)
- ✅ Signature verification
- ✅ Duplicate IPN handling
- ✅ Order amount validation

## 🔒 Security

### Implemented Security Measures

1. **Signature Verification**
   - Tất cả callback đều verify signature
   - Sử dụng HMAC SHA512
   - Secret key không bao giờ expose ra client

2. **Order Validation**
   - Verify order ownership (create-payment)
   - Verify order status (không thanh toán lại COMPLETED/CANCELLED)
   - Verify amount match (IPN)

3. **Duplicate Prevention**
   - IPN check order status trước khi update
   - Không process giao dịch đã PROCESSING/COMPLETED

4. **Error Handling**
   - Return specific error codes cho VNPay
   - Log errors để debug
   - User-friendly error messages

## 📊 Database Schema

Order model đã có sẵn các trường cần thiết:
- `status`: PENDING → PROCESSING → COMPLETED
- `note`: Lưu transaction number

```prisma
model Order {
  id                String      @id @default(cuid())
  status            OrderStatus @default(PENDING)
  note              String?     @db.Text
  // ... other fields
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
}
```

## 🐛 Troubleshooting

### Lỗi "Invalid Signature"
- Kiểm tra `VNPAY_HASH_SECRET` đúng
- Kiểm tra params không bị URL encode 2 lần
- Kiểm tra sort order của params

### Lỗi "Order not found"
- Kiểm tra orderId trong database
- Kiểm tra callback URL có đúng domain không

### Lỗi "Invalid Amount"
- Kiểm tra amount conversion (cents → VND)
- Ensure amount * 100 khi gửi lên VNPay

### Callback không hoạt động
- Kiểm tra `VNPAY_RETURN_URL` match với port hiện tại
- Kiểm tra firewall/proxy blocking callback
- Test với ngrok nếu localhost không nhận được IPN

## 📈 Next Steps (Production)

1. **Chuyển sang Production**
   - Đăng ký VNPay production account
   - Cập nhật `VNPAY_URL` sang production endpoint
   - Cập nhật `VNPAY_RETURN_URL` sang production domain

2. **Monitoring**
   - Log tất cả VNPay transactions
   - Setup alerts cho failed payments
   - Track payment success rate

3. **Enhancement**
   - Thêm payment retry mechanism
   - Auto-cancel orders sau X phút nếu không thanh toán
   - Email notification cho failed payments

## 📞 Support

- VNPay Documentation: https://sandbox.vnpayment.vn/apis/
- VNPay Support: support@vnpay.vn
- VNPay Hotline: 1900 55 55 77

---

**Last Updated:** Sprint 6 - VNPay Integration
**Status:** ✅ Complete (Backend + Frontend)
