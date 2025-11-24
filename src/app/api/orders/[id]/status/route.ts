import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const { status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("Update order status error", err);
    return NextResponse.json({ error: "Cập nhật trạng thái thất bại" }, { status: 500 });
  }
}
