// Admin API: Get all coupons with filters
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const forVIPOnly = searchParams.get("forVIPOnly");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (forVIPOnly !== null) {
      where.forVIPOnly = forVIPOnly === "true";
    }

    // Get total count
    const total = await prisma.coupon.count({ where });

    // Get coupons with pagination
    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { orderCoupons: true },
        },
      },
    });

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[COUPONS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Admin API: Create new coupon
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      maxUsage,
      startDate,
      endDate,
      isActive,
      forVIPOnly,
      minVIPTier,
    } = body;

    // Validation
    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(), // Always uppercase
        description,
        discountType,
        discountValue: parseInt(discountValue),
        minOrderValue: parseInt(minOrderValue || 0),
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        maxUsage: maxUsage ? parseInt(maxUsage) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== false,
        forVIPOnly: forVIPOnly === true,
        minVIPTier: minVIPTier ? parseInt(minVIPTier) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("[COUPONS_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
