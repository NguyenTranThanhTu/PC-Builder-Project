import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/reviews/[id]/helpful - Tăng số lượt "Hữu ích"
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Kiểm tra review tồn tại
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, helpfulCount: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Đánh giá không tồn tại" },
        { status: 404 }
      );
    }

    // Tăng helpfulCount
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        helpfulCount: true,
      },
    });

    return NextResponse.json({
      message: "Cảm ơn phản hồi của bạn",
      helpfulCount: updatedReview.helpfulCount,
    });
  } catch (error) {
    console.error("Error updating helpful count:", error);
    return NextResponse.json(
      { error: "Lỗi server khi cập nhật" },
      { status: 500 }
    );
  }
}
