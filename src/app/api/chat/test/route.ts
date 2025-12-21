/**
 * Test endpoint cho Gemini AI
 * Route: /api/chat/test
 */

import { NextResponse } from "next/server";
import { chatWithGemini, testGeminiConnection } from "@/lib/gemini";

/** Lấy model name từ env (sanitize nhẹ để tránh dính dấu ") */
function getEnvModelName() {
  const raw = (process.env.GEMINI_MODEL || "").trim();
  const sanitized = raw.replace(/^"+|"+$/g, "");
  return sanitized || "gemini-2.5-flash";
}

/** Tạo fallback model giống logic trong gemini.ts */
function getFallbackModel(primary: string) {
  const p = primary.toLowerCase();
  if (p.includes("flash") || p.includes("lite")) return "gemini-2.5-pro";
  if (p.includes("pro")) return "gemini-2.5-flash";
  return "gemini-2.5-flash";
}

/** Label hiển thị thân thiện (tuỳ bạn mở rộng) */
function toModelLabel(model: string) {
  // Có thể map "gemini-2.5-flash" -> "Gemini 2.5 Flash" nếu muốn
  return model;
}

export async function GET() {
  try {
    const isConnected = await testGeminiConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể kết nối với Gemini API. Kiểm tra lại API key / model.",
        },
        { status: 500 }
      );
    }

    const modelUsed = getEnvModelName();
    const fallbackModel = getFallbackModel(modelUsed);

    // (Tuỳ chọn) sample để debug nhanh xem model trả lời được không
    const sample = await chatWithGemini("ping");

    return NextResponse.json({
      success: true,
      message: "✅ Gemini API đã kết nối thành công!",
      status: "ready",

      // ✅ TƯƠNG THÍCH NGƯỢC: UI cũ hay đọc `model`
      model: modelUsed,

      // ✅ Field mới (khuyến nghị dùng dần)
      modelUsed,
      fallbackModel,
      modelLabel: toModelLabel(modelUsed),

      // Debug nhẹ
      sample: sample?.slice(0, 80) || "",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, history } = body as {
      message?: unknown;
      history?: unknown;
    };

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Call Gemini AI
    const aiResponse = await chatWithGemini(message, history as any);

    const modelUsed = getEnvModelName();
    const fallbackModel = getFallbackModel(modelUsed);

    return NextResponse.json({
      success: true,
      message: "Response generated successfully",
      data: {
        userMessage: message,
        aiResponse,
        timestamp: new Date().toISOString(),

        // ✅ TƯƠNG THÍCH NGƯỢC: UI cũ hay đọc `data.model`
        model: modelUsed,

        // ✅ Field mới
        modelUsed,
        fallbackModel,
        modelLabel: toModelLabel(modelUsed),
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate response",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
