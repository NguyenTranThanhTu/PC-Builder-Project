/**
 * Admin API: Get Chat Conversations
 * Route: /api/admin/chatbot/conversations
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConversations } from "@/lib/chatLogger";

export async function GET(req: Request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    console.log("[ADMIN CHATBOT] Session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
    });
    
    if (!session?.user || session.user.role !== "ADMIN") {
      console.log("[ADMIN CHATBOT] Access denied - Not admin or no session");
      return NextResponse.json(
        { success: false, error: "Unauthorized", details: "Admin role required" },
        { status: 401 }
      );
    }
    
    console.log("[ADMIN CHATBOT] Access granted for:", session.user.email);

    // Parse query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    // Get conversations
    console.log("[ADMIN] Fetching conversations with params:", { page, limit, search, status });
    const result = await getConversations({
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
    });
    console.log("[ADMIN] Conversations found:", result.total, "items");

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get conversations",
      },
      { status: 500 }
    );
  }
}
