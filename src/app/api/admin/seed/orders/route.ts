import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const session = guard.session!;

  const products = await prisma.product.findMany({ take: 8, orderBy: { createdAt: "desc" } });
  if (products.length === 0) return NextResponse.json({ error: "No products to seed orders" }, { status: 400 });

  const take = Math.min(5, products.length);
  const pick = products.slice(0, take);
  const created: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < Math.min(5, 3 + Math.floor(Math.random() * 3)); i++) {
      const n = 1 + Math.floor(Math.random() * pick.length);
      const items = pick.slice(0, n).map((p) => ({ productId: p.id, quantity: 1 + Math.floor(Math.random() * 2), priceCents: p.priceCents }));
      const totalCents = items.reduce((s, it) => s + it.priceCents * it.quantity, 0);
      const o = await tx.order.create({
        data: {
          customerName: session.user?.name || session.user?.email || "Demo User",
          customerEmail: session.user?.email || undefined,
          customerPhone: "0900000000",
          shippingAddress: "Hanoi",
          status: i % 4 === 0 ? "PROCESSING" : i % 3 === 0 ? "SHIPPED" : "PENDING",
          totalCents,
          items: { create: items },
        },
      });
      created.push(o.id);
      for (const it of items) {
        await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
      }
    }
  });

  return NextResponse.json({ created }, { status: 201 });
}
