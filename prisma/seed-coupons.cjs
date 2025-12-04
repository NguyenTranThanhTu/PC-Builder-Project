const { PrismaClient, DiscountType } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedCouponsAndVIP() {
  console.log("🎟️  Seeding Coupons and VIP Tiers...");

  // Seed VIP Tier Configs
  const vipTiers = [
    {
      tier: 1,
      name: "VIP Đồng",
      minSpend: 5000000, // 5 triệu (in cents: 500000000)
      discountPercent: 3,
      badgeColor: "#CD7F32",
    },
    {
      tier: 2,
      name: "VIP Bạc",
      minSpend: 20000000, // 20 triệu (in cents: 2000000000)
      discountPercent: 4,
      badgeColor: "#C0C0C0",
    },
    {
      tier: 3,
      name: "VIP Vàng",
      minSpend: 50000000, // 50 triệu (in cents: 5000000000)
      discountPercent: 5,
      badgeColor: "#FFD700",
    },
  ];

  for (const tier of vipTiers) {
    await prisma.vIPTierConfig.upsert({
      where: { tier: tier.tier },
      update: tier,
      create: tier,
    });
  }

  console.log("✅ VIP Tiers created!");

  // Seed Sample Coupons
  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3); // 3 months from now

  const coupons = [
    // === MÃ CHO TẤT CẢ USER (forVIPOnly: false) ===
    {
      code: "NEWUSER50K",
      description: "Giảm 50k cho khách hàng mới - Đơn từ 500k",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 5000000, // 50k (cents)
      minOrderValue: 50000000, // 500k (cents)
      maxDiscount: null,
      maxUsage: null,
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: false,
      minVIPTier: null,
    },
    {
      code: "WELCOME10",
      description: "Giảm 10% cho khách hàng mới - Đơn tối thiểu 1 triệu",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 100000000, // 1 triệu (cents)
      maxDiscount: 50000000, // Max 500k (cents)
      maxUsage: null, // Unlimited
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: false,
      minVIPTier: null,
    },
    {
      code: "SAVE100K",
      description: "Giảm 100k cho đơn từ 2 triệu",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 10000000, // 100k (cents)
      minOrderValue: 200000000, // 2 triệu (cents)
      maxDiscount: null,
      maxUsage: null,
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: false,
      minVIPTier: null,
    },
    {
      code: "SAVE500K",
      description: "Giảm ngay 500k cho đơn từ 10 triệu",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 50000000, // 500k (cents)
      minOrderValue: 1000000000, // 10 triệu (cents)
      maxDiscount: null,
      maxUsage: 100, // Limited to 100 uses
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: false,
      minVIPTier: null,
    },
    {
      code: "FLASH20",
      description: "Flash Sale - Giảm 20% (Số lượng có hạn)",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderValue: 50000000, // 500k (cents)
      maxDiscount: 100000000, // Max 1 triệu (cents)
      maxUsage: 50, // Limited
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: false,
      minVIPTier: null,
    },

    // === MÃ DÀNH CHO VIP (forVIPOnly: true) ===
    {
      code: "VIP15",
      description: "Giảm 15% cho khách VIP - Tất cả đơn hàng",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minOrderValue: 0,
      maxDiscount: 200000000, // Max 2 triệu (cents)
      maxUsage: null,
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: true,
      minVIPTier: 1, // VIP Đồng trở lên
    },
    {
      code: "VIP200K",
      description: "Giảm 200k cho VIP Bạc - Đơn từ 3 triệu",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 20000000, // 200k (cents)
      minOrderValue: 300000000, // 3 triệu (cents)
      maxDiscount: null,
      maxUsage: null,
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: true,
      minVIPTier: 2, // VIP Bạc trở lên
    },
    {
      code: "MEGA1M",
      description: "Giảm 1 triệu cho đơn từ 20 triệu - Chỉ VIP Vàng",
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 100000000, // 1 triệu (cents)
      minOrderValue: 2000000000, // 20 triệu (cents)
      maxDiscount: null,
      maxUsage: 20,
      startDate: now,
      endDate: futureDate,
      isActive: true,
      forVIPOnly: true,
      minVIPTier: 3, // Chỉ VIP Vàng
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  console.log("✅ Sample coupons created!");
  console.log("\n📋 Created Coupons (8 total):");
  console.log("  🎫 FOR ALL USERS:");
  console.log("    - NEWUSER50K: 50k off (min 500k)");
  console.log("    - WELCOME10: 10% off (min 1M)");
  console.log("    - SAVE100K: 100k off (min 2M)");
  console.log("    - SAVE500K: 500k off (min 10M)");
  console.log("    - FLASH20: 20% flash sale (limited 50)");
  console.log("  ⭐ VIP EXCLUSIVE:");
  console.log("    - VIP15: 15% off (VIP Bronze+)");
  console.log("    - VIP200K: 200k off (VIP Silver+, min 3M)");
  console.log("    - MEGA1M: 1M off (VIP Gold only, min 20M)");
}

async function main() {
  try {
    await seedCouponsAndVIP();
    console.log("\n🎉 Seed completed successfully!");
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
