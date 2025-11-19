import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OrderItemInput = { productId: string; quantity: number };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      note,
    }: {
      items: OrderItemInput[];
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      shippingAddress?: string;
      note?: string;
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
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Có sản phẩm không tồn tại" }, { status: 400 });
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

    const totalCents = sanitized.reduce((sum, it) => sum + (priceMap.get(it.productId) ?? 0) * it.quantity, 0);
    if (totalCents <= 0) {
      return NextResponse.json({ error: "Tổng tiền không hợp lệ" }, { status: 400 });
    }

    let userId: string | undefined = undefined;
    if (session?.user?.email) {
      const u = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = u?.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          note,
          status: "PENDING",
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

      // Decrement stock for each item
      for (const it of sanitized) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      return order;
    });

    return NextResponse.json({ orderId: result.id, totalCents: result.totalCents }, { status: 201 });
  } catch (err) {
    console.error("Create order error", err);
    return NextResponse.json({ error: "Tạo đơn hàng thất bại" }, { status: 500 });
  }
}
