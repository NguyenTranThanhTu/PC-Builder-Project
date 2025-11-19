import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Bạn cần đăng nhập để đánh giá" }, { status: 401 });
    }
    const body = await req.json();
    const { productId, rating, content }: { productId: string; rating: number; content: string } = body;
    if (!productId || !Number.isFinite(rating) || rating < 1 || rating > 5 || !content) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    // ensure product exists
    const p = await prisma.product.findUnique({ where: { id: String(productId) }, select: { id: true } });
    if (!p) return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });

    const review = await prisma.review.create({
      data: {
        userId: currentUser.id,
        productId: p.id,
        rating: Math.round(rating),
        content: String(content).slice(0, 2000),
        approved: true,
      },
    });

    return NextResponse.json({ id: review.id }, { status: 201 });
  } catch (err) {
    console.error("Create review error", err);
    return NextResponse.json({ error: "Tạo đánh giá thất bại" }, { status: 500 });
  }
}
