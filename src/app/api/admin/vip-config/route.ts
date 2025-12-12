import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/vip-config - Get all VIP tier configurations
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const tiers = await prisma.vIPTierConfig.findMany({
      orderBy: { tier: "asc" },
    });

    // Get user count per tier
    const tierCounts = await Promise.all(
      tiers.map(async (tier) => {
        const count = await prisma.user.count({
          where: { vipTier: tier.tier },
        });
        return { tier: tier.tier, userCount: count };
      })
    );

    return NextResponse.json({
      tiers: tiers.map((tier) => ({
        ...tier,
        minSpend: Number(tier.minSpend),
        userCount:
          tierCounts.find((tc) => tc.tier === tier.tier)?.userCount || 0,
      })),
    });
  } catch (error) {
    console.error("[VIP_CONFIG_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST /api/admin/vip-config - Create or update VIP tier config
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const { tier, name, minSpend, discountPercent, badgeColor } = body;

    // Validation
    if (!tier || !name || minSpend === undefined || !discountPercent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (tier < 1 || tier > 10) {
      return NextResponse.json(
        { error: "Tier must be between 1 and 10" },
        { status: 400 }
      );
    }

    if (minSpend < 0 || discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json(
        { error: "Invalid minSpend or discountPercent" },
        { status: 400 }
      );
    }

    // Upsert tier config
    const config = await prisma.vIPTierConfig.upsert({
      where: { tier },
      create: {
        tier,
        name,
        minSpend,
        discountPercent,
        badgeColor: badgeColor || "#CD7F32",
      },
      update: {
        name,
        minSpend,
        discountPercent,
        badgeColor: badgeColor || undefined,
      },
    });

    return NextResponse.json({ 
      config: {
        ...config,
        minSpend: Number(config.minSpend)
      }
    });
  } catch (error) {
    console.error("[VIP_CONFIG_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
