// Utility function to check and upgrade user VIP tier
import { prisma } from "./prisma";

export async function checkAndUpgradeVIPTier(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vipTier: true, totalSpent: true },
  });

  if (!user) return null;

  // Get all VIP tier configs ordered by minSpend descending
  const tiers = await prisma.vIPTierConfig.findMany({
    orderBy: { minSpend: "desc" },
  });

  // Find highest tier user qualifies for
  let newTier = 0;
  for (const tier of tiers) {
    if (user.totalSpent >= tier.minSpend) {
      newTier = tier.tier;
      break;
    }
  }

  // Update tier if changed
  if (newTier !== user.vipTier) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        vipTier: newTier,
        lastTierUpdate: new Date(),
      },
    });
    return { upgraded: true, oldTier: user.vipTier, newTier };
  }

  return { upgraded: false, tier: user.vipTier };
}
