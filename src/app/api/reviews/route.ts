import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema cho review
const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID là bắt buộc"),
  rating: z.number().int().min(1, "Rating tối thiểu là 1").max(5, "Rating tối đa là 5"),
  content: z.string().min(20, "Nội dung tối thiểu 20 ký tự").max(1000, "Nội dung tối đa 1000 ký tự"),
  images: z.array(z.string().url("Ảnh phải là URL hợp lệ")).max(5, "Tối đa 5 ảnh").optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để đánh giá sản phẩm" },
        { status: 401 }
      );
    }

    // 2. Parse và validate request body
    const body = await req.json();
    console.log("[Review API] Request body:", body);
    
    const validation = createReviewSchema.safeParse(body);
    
    if (!validation.success) {
      console.log("[Review API] Validation errors:", validation.error);
      return NextResponse.json(
        { error: validation.error.errors?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const { productId, rating, content, images } = validation.data;
    const userId = session.user.id;

    // 3. Kiểm tra product tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // 4. Kiểm tra user đã review chưa
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Bạn đã đánh giá sản phẩm này rồi" },
        { status: 409 }
      );
    }

    // 5. Kiểm tra user đã mua sản phẩm chưa (verified purchase)
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        items: {
          some: {
            productId,
          },
        },
      },
      select: { id: true },
    });

    const verifiedPurchase = !!purchasedOrder;

    // 6. Tạo review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        content,
        images,
        verifiedPurchase,
        helpfulCount: 0,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            vipTier: true,
          },
        },
      },
    });

    // 7. Format response
    const formattedReview = {
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
      verifiedPurchase: review.verifiedPurchase,
      helpfulCount: review.helpfulCount,
      images: review.images,
      adminReply: review.adminReply,
      adminReplyAt: review.adminReplyAt?.toISOString() || null,
      user: {
        name: review.user?.name || "Anonymous",
        image: review.user?.image || null,
        vipTier: review.user?.vipTier || 0,
      },
    };

    return NextResponse.json(
      {
        message: "Đánh giá đã được gửi thành công",
        review: formattedReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Lỗi server khi tạo đánh giá" },
      { status: 500 }
    );
  }
}

// GET /api/reviews?productId=xxx - Lấy reviews của 1 sản phẩm
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId là bắt buộc" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            vipTier: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
      verifiedPurchase: review.verifiedPurchase,
      helpfulCount: review.helpfulCount,
      images: review.images,
      adminReply: review.adminReply,
      adminReplyAt: review.adminReplyAt?.toISOString() || null,
      user: {
        name: review.user?.name || "Anonymous",
        image: review.user?.image || null,
        vipTier: review.user?.vipTier || 0,
      },
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Lỗi server khi lấy đánh giá" },
      { status: 500 }
    );
  }
}
