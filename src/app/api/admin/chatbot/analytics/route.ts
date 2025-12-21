/**
 * Admin API: Get Chat Analytics
 * Route: /api/admin/chatbot/analytics
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChatAnalytics } from "@/lib/chatLogger";

export async function GET(req: Request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    // Get analytics
    const analytics = await getChatAnalytics({
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get analytics",
      },
      { status: 500 }
    );
  }
}
