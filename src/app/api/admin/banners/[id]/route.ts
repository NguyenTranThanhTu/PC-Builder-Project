import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/banners/[id] - Get single banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banner = await prisma.banner.findUnique({
      where: { id: params.id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("[ADMIN BANNER GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/banners/[id] - Update banner
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(buttonText !== undefined && { buttonText }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("[ADMIN BANNER PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banners/[id] - Delete banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.banner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN BANNER DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
