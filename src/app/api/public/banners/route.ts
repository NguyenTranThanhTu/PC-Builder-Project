import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/banners - Get active banners
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get("position") || "hero";

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        position,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("[PUBLIC BANNERS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}
