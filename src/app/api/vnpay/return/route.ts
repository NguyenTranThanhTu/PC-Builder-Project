import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyReturnUrl, getResponseMessage } from "@/lib/vnpay";

/**
 * GET /api/vnpay/return
 * VNPay return URL (callback from payment gateway to user's browser)
 * This redirects to the success/failed page with query params
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const vnp_Params: any = {};

    // Extract all VNPay parameters
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value;
    });

    console.log("[VNPay Return] Received params:", vnp_Params);

    // Verify signature
    const isValid = verifyReturnUrl(vnp_Params);

    if (!isValid) {
      console.error("[VNPay Return] Invalid signature");
      return NextResponse.redirect(
        new URL(
          `/payment/failed?message=${encodeURIComponent("Chữ ký không hợp lệ")}`,
          req.url
        )
      );
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;
    const transactionNo = vnp_Params.vnp_TransactionNo;
    const amount = parseInt(vnp_Params.vnp_Amount) / 100; // Convert back to VND

    console.log("[VNPay Return] Order:", orderId, "Response code:", responseCode);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error("[VNPay Return] Order not found:", orderId);
      return NextResponse.redirect(
        new URL(
          `/payment/failed?message=${encodeURIComponent("Không tìm thấy đơn hàng")}`,
          req.url
        )
      );
    }

    // Payment successful
    if (responseCode === "00") {
      // Update order status to PROCESSING (admin will mark as SHIPPED later)
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PROCESSING",
          paymentMethod: "vnpay",
          note: order.note
            ? `${order.note}\n[VNPay] GD: ${transactionNo}`
            : `[VNPay] Giao dịch: ${transactionNo}`,
        },
      });

      console.log("[VNPay Return] Payment successful for order:", orderId);

      // Redirect to success page
      return NextResponse.redirect(
        new URL(
          `/payment/success?orderId=${orderId}&amount=${amount}&transactionNo=${transactionNo}`,
          req.url
        )
      );
    } else {
      // Payment failed
      const message = getResponseMessage(responseCode);
      console.log("[VNPay Return] Payment failed:", message);

      return NextResponse.redirect(
        new URL(
          `/payment/failed?orderId=${orderId}&message=${encodeURIComponent(message)}&code=${responseCode}`,
          req.url
        )
      );
    }
  } catch (error) {
    console.error("[VNPay Return] Error:", error);
    return NextResponse.redirect(
      new URL(
        `/payment/failed?message=${encodeURIComponent("Lỗi xử lý kết quả thanh toán")}`,
        req.url
      )
    );
  }
}
