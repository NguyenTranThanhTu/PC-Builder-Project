import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        vipTier: true,
        totalSpent: true,
        lastTierUpdate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current tier config
    let tierConfig = null;
    if (user.vipTier > 0) {
      const tier = await prisma.vIPTierConfig.findUnique({
        where: { tier: user.vipTier },
      });
      if (tier) {
        tierConfig = { ...tier, minSpend: Number(tier.minSpend) };
      }
    }

    // Get next tier config
    let nextTierConfig = null;
    let progressPercent = 0;
    if (user.vipTier < 3) {
      const nextTier = await prisma.vIPTierConfig.findUnique({
        where: { tier: user.vipTier + 1 },
      });

      if (nextTier) {
        nextTierConfig = { ...nextTier, minSpend: Number(nextTier.minSpend) };
        const currentMinSpend = tierConfig?.minSpend || 0;
        const nextMinSpend = Number(nextTier.minSpend);
        const totalSpentNum = Number(user.totalSpent);
        const spendInRange = totalSpentNum - currentMinSpend;
        const rangeSize = nextMinSpend - currentMinSpend;
        progressPercent = Math.min(100, Math.round((spendInRange / rangeSize) * 100));
      }
    }

    return NextResponse.json({
      vipTier: user.vipTier,
      totalSpent: Number(user.totalSpent),
      tierConfig,
      nextTierConfig,
      progressPercent,
    });
  } catch (error) {
    console.error("[VIP_STATUS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
