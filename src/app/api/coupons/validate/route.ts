// Customer API: Validate coupon and calculate discount
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { couponCode, orderTotal } = body; // orderTotal in cents

    if (!couponCode || !orderTotal) {
      return NextResponse.json(
        { error: "Missing coupon code or order total" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, vipTier: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Mã khuyến mãi không tồn tại", valid: false },
        { status: 404 }
      );
    }

    // Validation checks
    const now = new Date();

    if (!coupon.isActive) {
      return NextResponse.json({
        error: "Mã khuyến mãi đã bị vô hiệu hóa",
        valid: false,
      });
    }

    if (coupon.startDate > now) {
      return NextResponse.json({
        error: "Mã khuyến mãi chưa có hiệu lực",
        valid: false,
      });
    }

    if (coupon.endDate < now) {
      return NextResponse.json({
        error: "Mã khuyến mãi đã hết hạn",
        valid: false,
      });
    }

    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return NextResponse.json({
        error: "Mã khuyến mãi đã hết lượt sử dụng",
        valid: false,
      });
    }

    if (coupon.forVIPOnly && user.vipTier === 0) {
      return NextResponse.json({
        error: "Mã khuyến mãi chỉ dành cho khách hàng VIP",
        valid: false,
      });
    }

    if (coupon.minVIPTier && user.vipTier < coupon.minVIPTier) {
      return NextResponse.json({
        error: `Mã khuyến mãi yêu cầu VIP cấp ${coupon.minVIPTier} trở lên`,
        valid: false,
      });
    }

    if (orderTotal < coupon.minOrderValue) {
      const minOrderVND = (coupon.minOrderValue / 100).toLocaleString("vi-VN");
      return NextResponse.json({
        error: `Đơn hàng tối thiểu ${minOrderVND}₫ để sử dụng mã này`,
        valid: false,
      });
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((orderTotal * coupon.discountValue) / 100);
    } else {
      // FIXED_AMOUNT
      discountAmount = coupon.discountValue;
    }

    // Apply max discount cap if exists
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // Discount cannot exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount, // in cents
      discountPercent:
        coupon.discountType === "PERCENTAGE" ? coupon.discountValue : null,
      finalTotal: orderTotal - discountAmount,
    });
  } catch (error) {
    console.error("[COUPON_VALIDATE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
