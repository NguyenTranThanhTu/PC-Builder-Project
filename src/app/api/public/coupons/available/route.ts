import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get user VIP tier if logged in
    let userVipTier = 0;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { vipTier: true },
      });
      userVipTier = user?.vipTier || 0;
    }

    const now = new Date();

    // Get all active coupons that user can potentially use
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { forVIPOnly: false }, // Public coupons
          { forVIPOnly: true, minVIPTier: { lte: userVipTier } }, // VIP coupons user qualifies for
        ],
      },
      orderBy: [
        { forVIPOnly: "asc" }, // Public first
        { discountValue: "desc" }, // Highest discount first
      ],
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("[AVAILABLE_COUPONS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
