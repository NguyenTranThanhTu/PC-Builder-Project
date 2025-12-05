import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentUrl } from "@/lib/vnpay";

/**
 * POST /api/vnpay/create-payment
 * Create VNPay payment URL for an order
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, bankCode } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Thiếu mã đơn hàng" }, { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.user?.email !== session.user.email) {
      return NextResponse.json({ error: "Không có quyền truy cập đơn hàng này" }, { status: 403 });
    }

    // Check if order is already paid or cancelled
    if (order.status === "COMPLETED") {
      return NextResponse.json({ error: "Đơn hàng đã được thanh toán" }, { status: 400 });
    }
    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "Đơn hàng đã bị hủy" }, { status: 400 });
    }

    // Convert cents to VND
    const amountVND = Math.round(order.totalCents / 100);

    // Create order description (VNPay only accepts ASCII, no special characters)
    // Remove Vietnamese characters and special chars
    const sanitizeText = (text: string) => {
      return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .substring(0, 50);
    };
    
    const orderInfo = `Thanh toan don hang ${order.id.substring(0, 8)}`;

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddr = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "127.0.0.1";

    // Create payment URL
    const paymentUrl = createPaymentUrl({
      orderId: order.id,
      amount: amountVND,
      orderInfo,
      ipAddr,
      bankCode: bankCode || undefined,
      locale: "vn",
    });

    // Log payment request
    console.log("[VNPay] Creating payment for order:", {
      orderId: order.id,
      amount: amountVND,
      amountCents: order.totalCents,
      ipAddr,
      bankCode,
    });
    console.log("[VNPay] Payment URL:", paymentUrl);

    return NextResponse.json({
      paymentUrl,
      orderId: order.id,
      amount: amountVND,
    });
  } catch (error) {
    console.error("[VNPay] Create payment error:", error);
    return NextResponse.json(
      { error: "Lỗi tạo liên kết thanh toán" },
      { status: 500 }
    );
  }
}
