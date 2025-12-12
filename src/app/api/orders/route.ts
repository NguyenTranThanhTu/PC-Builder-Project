import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndUpgradeVIPTier } from "@/lib/vipTier";

// GET /api/orders: List orders with pagination and filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 10;
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;

    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        { shippingAddress: { contains: q, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  imageUrl: true,
                  slug: true,
                },
              },
            },
          },
          user: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Convert BigInt to Number for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      user: order.user ? {
        ...order.user,
        totalSpent: Number(order.user.totalSpent)
      } : null
    }));

    return NextResponse.json({
      orders: serializedOrders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("List orders error", err);
    return NextResponse.json({ error: "Lấy danh sách đơn hàng thất bại" }, { status: 500 });
  }
}

type OrderItemInput = { productId: string; quantity: number };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    console.log("[Order API] Body:", body);
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      country,
      paymentMethod,
      note,
      couponCode,
    }: {
      items: OrderItemInput[];
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      shippingAddress?: string;
      city?: string;
      country?: string;
      paymentMethod?: string;
      note?: string;
      couponCode?: string;
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
    }
    if (!customerName || typeof customerName !== "string") {
      return NextResponse.json({ error: "Thiếu tên khách hàng" }, { status: 400 });
    }

    const sanitized: OrderItemInput[] = items
      .map((it) => ({ productId: String(it.productId), quantity: Number(it.quantity) }))
      .filter((it) => it.productId && Number.isFinite(it.quantity) && it.quantity > 0);
    if (sanitized.length === 0) {
      return NextResponse.json({ error: "Danh sách sản phẩm không hợp lệ" }, { status: 400 });
    }

    const productIds: string[] = [];
    for (const it of sanitized) {
      if (!productIds.includes(it.productId)) productIds.push(it.productId);
    }
    const products = await prisma.product.findMany({ 
      where: { 
        id: { in: productIds },
        status: "PUBLISHED" // Only allow ordering published products
      } 
    });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Có sản phẩm không khả dụng hoặc đã ngừng bán" }, { status: 400 });
    }

    // Map product price and compute totals
    const priceMap = new Map(products.map((p) => [p.id, p.priceCents] as const));
    const stockMap = new Map(products.map((p) => [p.id, p.stock] as const));

    for (const it of sanitized) {
      const stock = stockMap.get(it.productId) ?? 0;
      if (it.quantity > stock) {
        return NextResponse.json({ error: "Số lượng vượt quá tồn kho" }, { status: 400 });
      }
    }

    const subtotalCents = sanitized.reduce((sum, it) => sum + (priceMap.get(it.productId) ?? 0) * it.quantity, 0);
    if (subtotalCents <= 0) {
      return NextResponse.json({ error: "Tổng tiền không hợp lệ" }, { status: 400 });
    }

    // Get user info for VIP discount calculation
    let userId: string | undefined = undefined;
    let userVipTier = 0;
    let vipDiscountPercent = 0;
    if (session?.user?.email) {
      const u = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (u) {
        userId = u.id;
        userVipTier = u.vipTier;
        
        // Get VIP discount percent
        if (userVipTier > 0) {
          const vipConfig = await prisma.vIPTierConfig.findUnique({ where: { tier: userVipTier } });
          if (vipConfig) {
            vipDiscountPercent = vipConfig.discountPercent;
          }
        }
      }
    }

    // Calculate VIP discount (applied to subtotal)
    const vipDiscountCents = Math.round((subtotalCents * vipDiscountPercent) / 100);

    // Validate and calculate coupon discount
    let couponDiscountCents = 0;
    let validCoupon = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "Mã khuyến mãi không hợp lệ" }, { status: 400 });
      }

      const now = new Date();
      if (coupon.startDate > now || coupon.endDate < now) {
        return NextResponse.json({ error: "Mã khuyến mãi đã hết hạn hoặc chưa có hiệu lực" }, { status: 400 });
      }

      if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
        return NextResponse.json({ error: "Mã khuyến mãi đã hết lượt sử dụng" }, { status: 400 });
      }

      if (coupon.forVIPOnly && userVipTier === 0) {
        return NextResponse.json({ error: "Mã khuyến mãi chỉ dành cho khách hàng VIP" }, { status: 400 });
      }

      if (coupon.minVIPTier && userVipTier < coupon.minVIPTier) {
        return NextResponse.json({ error: `Mã khuyến mãi yêu cầu VIP cấp ${coupon.minVIPTier} trở lên` }, { status: 400 });
      }

      if (subtotalCents < coupon.minOrderValue) {
        const minVND = (coupon.minOrderValue / 100).toLocaleString("vi-VN");
        return NextResponse.json({ error: `Đơn hàng tối thiểu ${minVND}₫ để sử dụng mã này` }, { status: 400 });
      }

      // Calculate coupon discount (applied AFTER VIP discount)
      const amountAfterVIP = subtotalCents - vipDiscountCents;
      if (coupon.discountType === "PERCENTAGE") {
        couponDiscountCents = Math.round((amountAfterVIP * coupon.discountValue) / 100);
      } else {
        couponDiscountCents = coupon.discountValue;
      }

      // Apply max discount cap
      if (coupon.maxDiscount && couponDiscountCents > coupon.maxDiscount) {
        couponDiscountCents = coupon.maxDiscount;
      }

      // Cannot exceed remaining amount
      if (couponDiscountCents > amountAfterVIP) {
        couponDiscountCents = amountAfterVIP;
      }

      validCoupon = coupon;
    }

    const totalCents = subtotalCents - vipDiscountCents - couponDiscountCents;

    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            user: userId ? { connect: { id: userId } } : undefined,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            city,
            country,
            paymentMethod,
            note,
            status: "PENDING",
            subtotalCents,
            couponCode: validCoupon?.code,
            couponDiscount: couponDiscountCents,
            vipDiscount: vipDiscountCents,
            totalCents,
            items: {
              create: sanitized.map((it) => ({
                productId: it.productId,
                quantity: it.quantity,
                priceCents: priceMap.get(it.productId)!,
              })),
            },
          },
          include: { items: true },
        });

        // Create OrderCoupon record if coupon was used
        if (validCoupon) {
          await tx.orderCoupon.create({
            data: {
              orderId: order.id,
              couponId: validCoupon.id,
              discountAmount: couponDiscountCents,
            },
          });

          // Increment coupon usage count
          await tx.coupon.update({
            where: { id: validCoupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }

        // Update user totalSpent for VIP tier calculation
        if (userId) {
          await tx.user.update({
            where: { id: userId },
            data: { totalSpent: { increment: totalCents } },
          });
        }

        // Decrement stock for each item
        for (const it of sanitized) {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { decrement: it.quantity } },
          });
        }
        return order;
      });
    } catch (err) {
      console.error("[Order API] Error creating order:", err);
      throw err;
    }

    // Check if user qualifies for VIP upgrade
    let vipUpgrade = null;
    if (userId) {
      vipUpgrade = await checkAndUpgradeVIPTier(userId);
    }

    // Lấy lại order vừa tạo, include user
    const order = await prisma.order.findUnique({
      where: { id: result.id },
      include: { user: true, items: true },
    });
    
    // Convert BigInt to Number for JSON serialization
    const serializedOrder = {
      ...order,
      user: order?.user ? {
        ...order.user,
        totalSpent: Number(order.user.totalSpent)
      } : null
    };
    
    return NextResponse.json({ order: serializedOrder, vipUpgrade }, { status: 201 });
  } catch (err) {
    console.error("Create order error", err);
    return NextResponse.json({ error: "Tạo đơn hàng thất bại" }, { status: 500 });
  }
}
