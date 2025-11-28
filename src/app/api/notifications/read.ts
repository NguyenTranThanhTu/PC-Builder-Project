import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const userId = session.user.id;
    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ error: "Thiếu notificationId" }, { status: 400 });
    }
    await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mark notification read error", err);
    return NextResponse.json({ error: "Đánh dấu đã đọc thất bại" }, { status: 500 });
  }
}
