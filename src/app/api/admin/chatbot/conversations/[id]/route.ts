/**
 * Admin API: Get Conversation Detail
 * Route: /api/admin/chatbot/conversations/[id]
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConversationDetail } from "@/lib/chatLogger";

// ✅ Next.js 15 requires params to be a Promise
type Ctx = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: Request,
  { params }: Ctx
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ MUST await params
    const { id } = await params;

    const conversation = await getConversationDetail(id);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error("Get conversation detail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get conversation",
      },
      { status: 500 }
    );
  }
}
