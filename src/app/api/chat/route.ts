/**
 * Production Chat API
 * Route: /api/chat
 */

import { NextResponse } from "next/server";
import { chatWithGemini } from "@/lib/gemini";
import type { GeminiHistory } from "@/lib/gemini";
import { getOrCreateConversation, logChatMessage } from "@/lib/chatLogger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history, sessionId } = body as {
      message?: unknown;
      history?: unknown;
      sessionId?: string;
    };

    // Validate message
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Validate sessionId
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "SessionId is required",
        },
        { status: 400 }
      );
    }

    // Get user session (if logged in)
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

    // Get or create conversation
    console.log("[CHAT] Creating conversation for sessionId:", sessionId);
    console.log("[CHAT] User info:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
    });
    
    const conversation = await getOrCreateConversation({
      sessionId,
      userId: user?.id,
      userEmail: user?.email || undefined,
      userName: user?.name || undefined,
      userAgent,
      ipAddress,
    });
    console.log("[CHAT] Conversation created/found:", {
      id: conversation.id,
      sessionId: conversation.sessionId,
      status: conversation.status,
    });

    // Log user message
    console.log("[CHAT] Logging user message...");
    const userMsg = await logChatMessage({
      conversationId: conversation.id,
      role: "user",
      content: message.trim(),
    });
    console.log("[CHAT] User message logged:", {
      messageId: userMsg.id,
      conversationId: userMsg.conversationId,
      role: userMsg.role,
      contentLength: message.trim().length,
    });

    // Validate history format (optional)
    let validHistory: GeminiHistory | undefined;
    if (Array.isArray(history)) {
      validHistory = history as GeminiHistory;
    }

    // Call Gemini AI with conversation context
    let aiResponse: string;
    let isError = false;
    let errorMessage: string | undefined;
    
    try {
      aiResponse = await chatWithGemini(message.trim(), validHistory);
    } catch (error: any) {
      isError = true;
      errorMessage = error.message;
      aiResponse = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
    }

    const responseTime = Date.now() - startTime;

    // Log bot response
    console.log("[CHAT] Logging bot response...");
    const botMsg = await logChatMessage({
      conversationId: conversation.id,
      role: "bot",
      content: aiResponse,
      modelUsed: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      responseTime,
      isError,
      errorMessage,
    });
    console.log("[CHAT] Bot response logged:", {
      messageId: botMsg.id,
      conversationId: botMsg.conversationId,
      responseTime: `${responseTime}ms`,
      isError,
    });

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        conversationId: conversation.id,
      },
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);

    // Return user-friendly error message
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Có lỗi xảy ra khi xử lý tin nhắn",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
