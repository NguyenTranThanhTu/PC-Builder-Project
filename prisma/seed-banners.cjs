const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Seeding banners...");

  // Hero Carousel Banners (3 slides tua đi tua lại)
  const heroSlide1 = await prisma.banner.upsert({
    where: { id: "hero-carousel-1" },
    update: {},
    create: {
      id: "hero-carousel-1",
      title: "True Wireless Noise Cancelling Headphone",
      subtitle: "30% Sale Off",
      imageUrl: "/images/hero/hero-01.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "Shop Now",
      position: "hero-carousel",
      isActive: true,
      order: 0,
    },
  });

  const heroSlide2 = await prisma.banner.upsert({
    where: { id: "hero-carousel-2" },
    update: {},
    create: {
      id: "hero-carousel-2",
      title: "Wireless Gaming Headset",
      subtitle: "30% Sale Off",
      imageUrl: "/images/hero/hero-01.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "Shop Now",
      position: "hero-carousel",
      isActive: true,
      order: 1,
    },
  });

  const heroSlide3 = await prisma.banner.upsert({
    where: { id: "hero-carousel-3" },
    update: {},
    create: {
      id: "hero-carousel-3",
      title: "Premium Audio Experience",
      subtitle: "30% Sale Off",
      imageUrl: "/images/hero/hero-01.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "Shop Now",
      position: "hero-carousel",
      isActive: true,
      order: 2,
    },
  });

  // Hero Side Banners (2 banners trên dưới bên phải)
  const heroSide1 = await prisma.banner.upsert({
    where: { id: "hero-side-1" },
    update: {},
    create: {
      id: "hero-side-1",
      title: "iPhone 14 Plus & 14 Pro Max",
      subtitle: "limited time offer",
      imageUrl: "/images/hero/hero-02.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "",
      position: "hero-side",
      isActive: true,
      order: 0,
    },
  });

  const heroSide2 = await prisma.banner.upsert({
    where: { id: "hero-side-2" },
    update: {},
    create: {
      id: "hero-side-2",
      title: "Wireless Headphone",
      subtitle: "limited time offer",
      imageUrl: "/images/hero/hero-01.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "",
      position: "hero-side",
      isActive: true,
      order: 1,
    },
  });

  // Promo Banners (1 lớn + 2 nhỏ ở dưới)
  const promoBig = await prisma.banner.upsert({
    where: { id: "promo-big-1" },
    update: {},
    create: {
      id: "promo-big-1",
      title: "Apple iPhone 14 Plus",
      subtitle: "UP TO 30% OFF",
      imageUrl: "/images/promo/promo-01.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "Buy Now",
      position: "promo-big",
      isActive: true,
      order: 0,
    },
  });

  const promoSmall1 = await prisma.banner.upsert({
    where: { id: "promo-small-1" },
    update: {},
    create: {
      id: "promo-small-1",
      title: "Foldable Motorised Treadmill",
      subtitle: "Workout At Home - Flat 20% off",
      imageUrl: "/images/promo/promo-02.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "Grab Now",
      position: "promo-small",
      isActive: true,
      order: 0,
    },
  });

  const promoSmall2 = await prisma.banner.upsert({
    where: { id: "promo-small-2" },
    update: {},
    create: {
      id: "promo-small-2",
      title: "Apple Watch Ultra",
      subtitle: "Up to 40% off",
      imageUrl: "/images/promo/promo-03.png",
      linkUrl: "/shop-with-sidebar",
      buttonText: "Shop Now",
      position: "promo-small",
      isActive: true,
      order: 1,
    },
  });

  console.log("✅ Seeded banners:");
  console.log("  - 3 Hero Carousel banners");
  console.log("  - 2 Hero Side banners");
  console.log("  - 1 Promo Big banner");
  console.log("  - 2 Promo Small banners");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
