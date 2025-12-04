import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { tier: string } }
) {
  try {
    const tier = parseInt(params.tier);
    if (isNaN(tier) || tier < 1 || tier > 3) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const config = await prisma.vIPTierConfig.findUnique({
      where: { tier },
    });

    if (!config) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("[VIP_TIER_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
