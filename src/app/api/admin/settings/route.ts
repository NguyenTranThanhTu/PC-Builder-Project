import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings - Get all settings or by key
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (key) {
      const setting = await prisma.siteSetting.findUnique({
        where: { key },
      });
      return NextResponse.json(setting || null);
    }

    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[ADMIN SETTINGS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Create or update setting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("[ADMIN SETTINGS POST]", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 }
    );
  }
}
