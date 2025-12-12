import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/users/[id] - Get user detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            items: {
              include: {
                product: {
                  select: { name: true, imageUrl: true },
                },
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate stats
    const completedOrders = await prisma.order.count({
      where: { userId: id, status: "COMPLETED" },
    });

    const totalSpent = await prisma.order.aggregate({
      where: { userId: id, status: "COMPLETED" },
      _sum: { totalCents: true },
    });

    // Get VIP tier info
    let vipTierInfo = null;
    if (user.vipTier > 0) {
      const tier = await prisma.vIPTierConfig.findUnique({
        where: { tier: user.vipTier },
      });
      if (tier) {
        vipTierInfo = { ...tier, minSpend: Number(tier.minSpend) };
      }
    }

    // Get next VIP tier info
    let nextVipTier = null;
    const nextTier = await prisma.vIPTierConfig.findFirst({
      where: { tier: user.vipTier + 1 },
      orderBy: { tier: "asc" },
    });
    if (nextTier) {
      nextVipTier = { ...nextTier, minSpend: Number(nextTier.minSpend) };
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        vipTier: user.vipTier,
        totalSpent: Number(user.totalSpent),
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orders: user.orders,
        reviews: user.reviews,
      },
      stats: {
        totalOrders: user._count.orders,
        completedOrders,
        totalSpent: Number(totalSpent._sum.totalCents || 0),
        totalReviews: user._count.reviews,
      },
      vipTierInfo,
      nextVipTier,
    });
  } catch (error) {
    console.error("[USER_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    const body = await req.json();
    const { role, status } = body;

    const updates: any = {};
    if (role && ["USER", "ADMIN"].includes(role)) {
      updates.role = role;
    }
    // Note: status field doesn't exist in current schema, we'll use a custom field or handle differently

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        vipTier: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[USER_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
