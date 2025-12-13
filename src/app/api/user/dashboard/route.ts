import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVipTier } from "@/lib/vipTier";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user by email with VIP tier info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        vipTier: true,
        totalSpent: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Get all orders for stats
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        totalCents: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total spent from orders
    const totalSpent = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, order) => sum + order.totalCents, 0) / 100;

    // Use VIP tier from database (already calculated)
    const actualVipTier = user.vipTier || 0;
    
    // Fetch VIP tier configs from database
    const vipTierConfigs = await prisma.vIPTierConfig.findMany({
      orderBy: { tier: 'asc' },
    });

    // Build tiers array from database with proper structure
    const tiers: Array<{ tier: number; name: string; min: number; max: number; discount: number }> = [
      { tier: 0, name: "Thường", min: 0, max: 0, discount: 0 },
    ];

    vipTierConfigs.forEach((config, index) => {
      const minSpend = Number(config.minSpend) / 100; // Convert cents to VND
      const nextConfig = vipTierConfigs[index + 1];
      const maxSpend = nextConfig ? Number(nextConfig.minSpend) / 100 : Infinity; // Convert cents to VND
      
      tiers.push({
        tier: config.tier,
        name: config.name,
        min: minSpend,
        max: maxSpend,
        discount: config.discountPercent,
      });
      
      // Update tier 0 max to first tier's min
      if (index === 0) {
        tiers[0].max = minSpend;
      }
    });

    // Get discount for actual tier
    const currentTierConfig = tiers.find(t => t.tier === actualVipTier);
    const vipDiscount = currentTierConfig?.discount || 0;

    // Calculate next tier
    const nextTier = tiers[Math.min(actualVipTier + 1, tiers.length - 1)];
    const nextTierAmount =
      actualVipTier < tiers.length - 1 ? Math.max(0, nextTier.min - totalSpent) : 0;

    // Calculate spending by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const spendingByMonth: { [key: string]: number } = {};
    
    orders
      .filter((o) => o.status === "COMPLETED" && o.createdAt >= sixMonthsAgo)
      .forEach((order) => {
        const monthKey = new Date(order.createdAt).toLocaleDateString("vi-VN", {
          month: "2-digit",
          year: "numeric",
        });
        spendingByMonth[monthKey] = (spendingByMonth[monthKey] || 0) + order.totalCents / 100;
      });

    // Get order counts by status
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => !["COMPLETED", "CANCELLED", "FAILED"].includes(o.status)
    ).length;
    const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

    // Get recent orders (last 5)
    const recentOrders = orders.slice(0, 5);

    // Get user's reviews
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        status: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
      vipTier: actualVipTier, // Use actual tier from database
      vipDiscount, // Use discount from database config
      nextTierAmount,
      nextTierName: nextTier.name,
      spendingByMonth,
      recentOrders,
      reviews,
      tiers, // Send tiers info to frontend for progress calculation
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
