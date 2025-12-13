// Admin API: Get, Update, Delete specific coupon
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get single coupon by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        orderCoupons: {
          include: {
            order: {
              select: {
                id: true,
                createdAt: true,
                totalCents: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Last 10 uses
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[COUPON_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Update coupon
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      maxUsage,
      startDate,
      endDate,
      isActive,
      forVIPOnly,
      minVIPTier,
    } = body;

    // Check if coupon exists
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Update coupon (code cannot be changed)
    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        description,
        discountType,
        discountValue: discountValue ? parseInt(discountValue) : undefined,
        minOrderValue: minOrderValue ? parseInt(minOrderValue) : undefined,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        forVIPOnly,
        minVIPTier: minVIPTier ? parseInt(minVIPTier) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[COUPON_PUT]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Delete coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Check if coupon has been used
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderCoupons: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // If coupon has been used, soft delete (deactivate)
    if (coupon._count.orderCoupons > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: "Coupon deactivated (has been used)",
      });
    }

    // Otherwise, hard delete
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("[COUPON_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
