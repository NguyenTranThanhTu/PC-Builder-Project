import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reviews/my-reviews?productIds=id1,id2,id3
// Lấy danh sách productIds mà user đã review
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập" },
        { status: 401 }
      );
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productIdsParam = searchParams.get("productIds");

    if (!productIdsParam) {
      return NextResponse.json(
        { error: "productIds là bắt buộc" },
        { status: 400 }
      );
    }

    const productIds = productIdsParam.split(",").filter(Boolean);

    if (productIds.length === 0) {
      return NextResponse.json({ reviewedProductIds: [] });
    }

    // Lấy reviews của user cho các products này
    const reviews = await prisma.review.findMany({
      where: {
        userId: user.id,
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
      },
    });

    const reviewedProductIds = reviews.map((r) => r.productId);

    return NextResponse.json({ reviewedProductIds });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Lỗi server" },
      { status: 500 }
    );
  }
}
