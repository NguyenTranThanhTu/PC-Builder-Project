/**
 * VNPay Payment Gateway Integration
 * Documentation: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
 */

import crypto from "crypto";
import querystring from "querystring";

// VNPay Configuration
export const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "",
  vnp_Url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment/vnpay-return",
};

/**
 * Sort object by key (VNPay requirement)
 * DO NOT encode here - will be encoded by querystring.stringify
 */
export function sortObject(obj: any): any {
  const sorted: any = {};
  const str = Object.keys(obj).sort();
  
  for (const key of str) {
    sorted[key] = obj[key];
  }
  return sorted;
}

/**
 * Create HMAC SHA512 signature
 */
export function createSignature(data: string, secretKey: string): string {
  return crypto.createHmac("sha512", secretKey).update(data, "utf-8").digest("hex");
}

/**
 * Create VNPay payment URL
 * @param orderId - Order ID
 * @param amount - Amount in VND (not cents)
 * @param orderInfo - Order description
 * @param ipAddr - Customer IP address
 * @param bankCode - Bank code (optional)
 * @returns Payment URL
 */
export function createPaymentUrl(params: {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  bankCode?: string;
  locale?: string;
}): string {
  const { orderId, amount, orderInfo, ipAddr, bankCode, locale = "vn" } = params;

  // VNPay requires Vietnam timezone (UTC+7)
  // Always work with UTC, then add VN offset
  const now = new Date();
  const VN_OFFSET = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds
  
  // Format date in Vietnam timezone: YYYYMMDDHHmmss
  const formatDateVN = (utcDate: Date) => {
    // Get UTC timestamp, add VN offset (+7 hours)
    const vnTimestamp = utcDate.getTime() + VN_OFFSET;
    const vnDate = new Date(vnTimestamp);
    
    // Use UTC methods to extract components (since vnDate is already adjusted)
    const year = vnDate.getUTCFullYear();
    const month = String(vnDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vnDate.getUTCDate()).padStart(2, '0');
    const hours = String(vnDate.getUTCHours()).padStart(2, '0');
    const minutes = String(vnDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(vnDate.getUTCSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };
  
  // Calculate expire time (+15 minutes from now)
  const expireTime = new Date(now.getTime() + (15 * 60 * 1000));
  
  const createDate = formatDateVN(now);
  const expireDate = formatDateVN(expireTime);
  
  console.log('[VNPay] Time debug:', {
    utcNow: now.toISOString(),
    vnNow: new Date(now.getTime() + VN_OFFSET).toISOString().replace('Z', '+07:00'),
    createDate,
    expireDate,
  });

  // VNPay requires amount as integer (no decimals)
  const vnpAmount = Math.round(amount * 100);

  let vnp_Params: any = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: vnpAmount.toString(), // Must be string of integer
    vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params.vnp_BankCode = bankCode;
  }

  // Sort parameters alphabetically
  vnp_Params = sortObject(vnp_Params);

  // Create signature data with URL encoded values (VNPay requirement)
  // Format: key1=encodedValue1&key2=encodedValue2...
  const signData = Object.keys(vnp_Params)
    .map(key => {
      const value = vnp_Params[key];
      // Encode value but replace space with + (VNPay standard)
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      return `${key}=${encodedValue}`;
    })
    .join("&");
    
  const secureHash = createSignature(signData, VNPAY_CONFIG.vnp_HashSecret);

  vnp_Params.vnp_SecureHash = secureHash;

  // Build final URL with same encoding as signature
  const queryParams = Object.keys(vnp_Params)
    .map(key => {
      const value = vnp_Params[key];
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      return `${key}=${encodedValue}`;
    })
    .join("&");
    
  const paymentUrl = VNPAY_CONFIG.vnp_Url + "?" + queryParams;

  return paymentUrl;
}

/**
 * Verify VNPay callback signature
 * @param vnp_Params - Query parameters from VNPay callback
 * @returns true if signature is valid
 */
export function verifyReturnUrl(vnp_Params: any): boolean {
  const secureHash = vnp_Params.vnp_SecureHash;

  // Remove hash params before verification
  const params = { ...vnp_Params };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // Sort and create signature (same format as when creating payment URL)
  // VNPay callback already has values in their raw form (not URL encoded in params object)
  // So we need to encode them the same way we did when creating the payment URL
  const sortedParams = sortObject(params);
  const signData = Object.keys(sortedParams)
    .map(key => {
      const value = sortedParams[key];
      const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
      return `${key}=${encodedValue}`;
    })
    .join("&");
    
  const checkSum = createSignature(signData, VNPAY_CONFIG.vnp_HashSecret);

  return secureHash === checkSum;
}

/**
 * Parse VNPay response code to readable message
 */
export function getResponseMessage(responseCode: string): string {
  const messages: Record<string, string> = {
    "00": "Giao dịch thành công",
    "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
    "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    "75": "Ngân hàng thanh toán đang bảo trì.",
    "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
    "99": "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
  };

  return messages[responseCode] || "Lỗi không xác định";
}

/**
 * Get bank list for VNPay
 */
export const VNPAY_BANKS = [
  { code: "VNPAYQR", name: "Cổng thanh toán VNPAYQR" },
  { code: "VNBANK", name: "Ngân hàng nội địa" },
  { code: "INTCARD", name: "Thẻ quốc tế" },
  { code: "VIETCOMBANK", name: "Ngân hàng TMCP Ngoại thương Việt Nam" },
  { code: "VIETINBANK", name: "Ngân hàng TMCP Công thương Việt Nam" },
  { code: "BIDV", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
  { code: "AGRIBANK", name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam" },
  { code: "TECHCOMBANK", name: "Ngân hàng TMCP Kỹ thương Việt Nam" },
  { code: "ACB", name: "Ngân hàng TMCP Á Châu" },
  { code: "MB", name: "Ngân hàng TMCP Quân đội" },
  { code: "SACOMBANK", name: "Ngân hàng TMCP Sài Gòn Thương Tín" },
  { code: "EXIMBANK", name: "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam" },
  { code: "MSBANK", name: "Ngân hàng TMCP Hàng Hải" },
  { code: "HDBANK", name: "Ngân hàng TMCP Phát triển TP.HCM" },
];
