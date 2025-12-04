import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyReturnUrl, getResponseMessage } from "@/lib/vnpay";

/**
 * GET /api/vnpay/ipn
 * VNPay IPN (Instant Payment Notification)
 * This is called directly from VNPay server to our server
 * Must return specific response codes for VNPay to understand
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const vnp_Params: any = {};

    // Extract all VNPay parameters
    searchParams.forEach((value, key) => {
      vnp_Params[key] = value;
    });

    console.log("[VNPay IPN] Received params:", vnp_Params);

    // Verify signature
    const isValid = verifyReturnUrl(vnp_Params);

    if (!isValid) {
      console.error("[VNPay IPN] Invalid signature");
      return NextResponse.json({
        RspCode: "97",
        Message: "Invalid signature",
      });
    }

    const orderId = vnp_Params.vnp_TxnRef;
    const responseCode = vnp_Params.vnp_ResponseCode;
    const transactionNo = vnp_Params.vnp_TransactionNo;
    const amount = parseInt(vnp_Params.vnp_Amount) / 100;

    console.log("[VNPay IPN] Order:", orderId, "Response code:", responseCode);

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error("[VNPay IPN] Order not found:", orderId);
      return NextResponse.json({
        RspCode: "01",
        Message: "Order not found",
      });
    }

    // Check amount
    const orderAmount = Math.round(order.totalCents / 100);
    if (amount !== orderAmount) {
      console.error("[VNPay IPN] Amount mismatch:", { received: amount, expected: orderAmount });
      return NextResponse.json({
        RspCode: "04",
        Message: "Invalid amount",
      });
    }

    // Check if already processed
    if (order.status === "PROCESSING" || order.status === "COMPLETED") {
      console.log("[VNPay IPN] Order already processed:", orderId);
      return NextResponse.json({
        RspCode: "02",
        Message: "Order already confirmed",
      });
    }

    // Payment successful
    if (responseCode === "00") {
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

      console.log("[VNPay IPN] Payment confirmed for order:", orderId);

      // TODO: Send notification to customer

      return NextResponse.json({
        RspCode: "00",
        Message: "Success",
      });
    } else {
      // Payment failed - do nothing, order stays PENDING
      console.log("[VNPay IPN] Payment failed:", getResponseMessage(responseCode));

      return NextResponse.json({
        RspCode: "00",
        Message: "Success",
      });
    }
  } catch (error) {
    console.error("[VNPay IPN] Error:", error);
    return NextResponse.json({
      RspCode: "99",
      Message: "Unknown error",
    });
  }
}
