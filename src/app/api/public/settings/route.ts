import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/settings - Get site settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (key) {
      const setting = await prisma.siteSetting.findUnique({
        where: { key },
      });
      return NextResponse.json(setting?.value || null);
    }

    const settings = await prisma.siteSetting.findMany();
    
    // Return as key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("[PUBLIC SETTINGS GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
