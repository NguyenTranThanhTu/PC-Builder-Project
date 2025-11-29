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
    const { notificationId, notificationIds } = await req.json();
    console.log('API /api/notifications/read:', { notificationId, notificationIds, userId });
    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      const result = await prisma.notification.updateMany({
        where: { id: { in: notificationIds }, userId },
        data: { read: true },
      });
      console.log('UpdateMany result:', result);
      return NextResponse.json({ success: true, updated: result });
    }
    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Thiu notificationId(s)" }, { status: 400 });
  } catch (err) {
    console.error("Mark notification read error", err);
    return NextResponse.json({ error: "Đánh dấu đã đọc thất bại" }, { status: 500 });
  }
}
