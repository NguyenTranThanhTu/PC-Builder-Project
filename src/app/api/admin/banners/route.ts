import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/banners - List all banners
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get("position");

    const where: any = {};
    if (position) where.position = position;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("[ADMIN BANNERS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners - Create new banner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      buttonText,
      position,
      isActive,
      order,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and imageUrl are required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        buttonText,
        position: position || "hero",
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("[ADMIN BANNERS POST]", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}
