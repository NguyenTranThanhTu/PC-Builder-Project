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
 */
export function sortObject(obj: any): any {
  const sorted: any = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Create HMAC SHA512 signature
 */
export function createSignature(data: string, secretKey: string): string {
  return crypto.createHmac("sha512", secretKey).update(Buffer.from(data, "utf-8")).digest("hex");
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

  const createDate = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
  const expireDate = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    .toISOString()
    .replace(/[-T:\.Z]/g, "")
    .slice(0, 14);

  let vnp_Params: any = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPay requires amount in smallest unit (1đ = 100)
    vnp_ReturnUrl: VNPAY_CONFIG.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params.vnp_BankCode = bankCode;
  }

  // Sort and create signature
  vnp_Params = sortObject(vnp_Params);

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const secureHash = createSignature(signData, VNPAY_CONFIG.vnp_HashSecret);

  vnp_Params.vnp_SecureHash = secureHash;

  const paymentUrl = VNPAY_CONFIG.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

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
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  // Sort and create signature
  const sortedParams = sortObject(vnp_Params);
  const signData = querystring.stringify(sortedParams, { encode: false });
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
