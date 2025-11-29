import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, context) {
  const { id } = await context.params;
  console.log("[DELETE] Xóa đơn hàng:", id);
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    console.log("[DELETE] Không tìm thấy đơn hàng:", id);
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  }
  if (order.status !== "CANCELLED") {
    console.log("[DELETE] Đơn hàng chưa bị hủy, không xóa:", id);
    return NextResponse.json({ error: "Chỉ xóa được đơn hàng đã hủy" }, { status: 400 });
  }
  await prisma.order.delete({ where: { id } });
  console.log("[DELETE] Đã xóa đơn hàng:", id);
  return NextResponse.json({ success: true });
}