import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = (await context).params;
    const { status, reason, cancelReason } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }
    // Lấy đơn hàng hiện tại
    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    // Chỉ cho phép hủy khi trạng thái là PENDING hoặc PROCESSING
    if (status === "CANCELLED" && !["PENDING", "PROCESSING"].includes(currentOrder.status)) {
      return NextResponse.json({ error: "Không thể hủy đơn hàng đang giao hoặc đã hoàn thành" }, { status: 400 });
    }
    // Cập nhật trạng thái đơn hàng
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        cancelReason: status === "CANCELLED" ? cancelReason ?? null : undefined,
      },
      include: { user: true },
    });

    // Tạo notification cho user
    let message = "";
    switch (status) {
      case "PROCESSING":
        message = "Đơn hàng của bạn đã được xác nhận và đang xử lý.";
        break;
      case "SHIPPED":
        message = "Đơn hàng của bạn đang được giao.";
        break;
      case "COMPLETED":
        message = "Đơn hàng của bạn đã hoàn thành. Cảm ơn bạn đã mua hàng!";
        break;
      case "CANCELLED":
        message = `Đơn hàng của bạn đã bị hủy${reason ? ", lý do: " + reason : ""}.`;
        break;
      default:
        message = `Trạng thái đơn hàng đã chuyển sang: ${status}`;
    }
    // Chỉ tạo notification nếu có userId
    if (order.userId) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: status,
          message,
        },
      });
    }
    
    // Convert BigInt to Number for JSON serialization
    const serializedOrder = {
      ...order,
      user: order.user ? {
        ...order.user,
        totalSpent: Number(order.user.totalSpent)
      } : null
    };
    
    return NextResponse.json({ success: true, order: serializedOrder });
  } catch (err) {
    console.error("Update order status error", err);
    return NextResponse.json({ error: "Cập nhật trạng thái thất bại" }, { status: 500 });
  }
}
