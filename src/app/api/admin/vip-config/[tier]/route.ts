import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// DELETE /api/admin/vip-config/[tier] - Delete VIP tier config
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tier: string } }
) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const tier = parseInt(params.tier);

    // Check if any users have this tier
    const usersWithTier = await prisma.user.count({
      where: { vipTier: tier },
    });

    if (usersWithTier > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete tier ${tier}. ${usersWithTier} users currently have this tier.`,
        },
        { status: 400 }
      );
    }

    await prisma.vIPTierConfig.delete({
      where: { tier },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VIP_CONFIG_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
