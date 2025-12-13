import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/reviews/[id]
 * Update review status, reply, etc.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const ok = await isAdmin(session);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, status, rejectionReason, adminReply } = body;

    // Check if review exists
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    let updateData: any = {};

    switch (action) {
      case "approve":
        updateData = { status: "APPROVED" };
        break;

      case "reject":
        updateData = {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Không phù hợp với tiêu chuẩn",
        };
        break;

      case "reply":
        if (!adminReply || adminReply.trim() === "") {
          return NextResponse.json(
            { error: "Admin reply cannot be empty" },
            { status: 400 }
          );
        }
        // Get admin user ID from database
        const adminUser = await prisma.user.findUnique({
          where: { email: session?.user?.email! },
          select: { id: true },
        });
        updateData = {
          adminReply: adminReply.trim(),
          adminReplyAt: new Date(),
          adminReplyBy: adminUser?.id || null,
        };
        break;

      case "delete-reply":
        updateData = {
          adminReply: null,
          adminReplyAt: null,
          adminReplyBy: null,
        };
        break;

      case "update-status":
        if (!status) {
          return NextResponse.json(
            { error: "Status is required" },
            { status: 400 }
          );
        }
        updateData = { status };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Xóa review vĩnh viễn
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const ok = await isAdmin(session);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if review exists
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
