import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// GET
export async function GET(request: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) {
    return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  }

  return NextResponse.json(banner);
}

// PATCH
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, subtitle, imageUrl, linkUrl, buttonText, position, isActive, order } = body;

  const banner = await prisma.banner.update({
    where: { id },
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
}

// DELETE
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
