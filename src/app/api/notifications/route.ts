import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Lấy thông tin user từ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const userId = session.user.id;
    // Lấy danh sách notification của user, mới nhất trước
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      // Trả về cả thông báo đã đọc và chưa đọc, trạng thái read sẽ được frontend xử lý
    });
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("Get notifications error", err);
    return NextResponse.json({ error: "Lấy thông báo thất bại" }, { status: 500 });
  }
}
