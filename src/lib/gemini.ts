/**
 * Gemini AI Client
 * Wrapper for Google Generative AI SDK
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Giữ nguyên prompt của bạn ở đây
const PC_BUILDER_SYSTEM_PROMPT = `...GIỮ NGUYÊN PROMPT CỦA BẠN...`;

/** History đúng chuẩn SDK */
export type GeminiHistory = Array<{
  role: "user" | "model";
  parts: Array<{ text: string }>;
}>;

/** Tạo client (fail-fast nếu thiếu key) */
function getClient() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình trong .env file");
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Sanitize model name lấy từ .env:
 * - trim whitespace
 * - bỏ dấu nháy kép đầu/cuối nếu user vô tình viết GEMINI_MODEL="..."
 */
function sanitizeModelName(raw?: string) {
  const s = (raw || "").trim();
  if (!s) return "";
  return s.replace(/^"+|"+$/g, ""); // remove leading/trailing "
}

/**
 * Chọn model primary:
 * - ưu tiên GEMINI_MODEL trong env
 * - fallback default (khuyến nghị đời mới)
 */
function pickModelName() {
  return (
    sanitizeModelName(process.env.GEMINI_MODEL) ||
    "gemini-2.5-flash" // ✅ default khuyến nghị cho chatbot
  );
}

/** Chọn model fallback dựa trên primary */
function pickFallbackModel(primary: string) {
  const p = primary.toLowerCase();

  // Nếu primary là flash/lite → fallback pro (phân tích sâu hơn)
  if (p.includes("flash") || p.includes("lite")) return "gemini-2.5-pro";

  // Nếu primary là pro → fallback flash (nhanh hơn)
  if (p.includes("pro")) return "gemini-2.5-flash";

  // Trường hợp khác → fallback về flash
  return "gemini-2.5-flash";
}

/** Nhận diện lỗi model để fallback (404 / not supported / retired...) */
function isModelError(status: any, msg: string) {
  const m = msg.toLowerCase();

  return (
    status === 404 ||
    m.includes("not found") ||
    m.includes("is not supported for generatecontent") ||
    (m.includes("models/") && m.includes("not supported")) ||
    (m.includes("models/") && m.includes("is not found"))
  );
}

/** Nhận diện lỗi quota */
function isQuotaError(status: any, msg: string) {
  const m = msg.toLowerCase();
  return status === 429 || m.includes("429") || m.includes("quota") || m.includes("rate limit");
}

/** Nhận diện lỗi API key */
function isApiKeyError(status: any, msg: string) {
  const m = msg.toLowerCase();
  return status === 400 || status === 401 || status === 403 || m.includes("api key");
}

/**
 * Chat với Gemini AI
 * @param userMessage - Tin nhắn từ user
 * @param conversationHistory - Lịch sử chat (optional)
 */
export async function chatWithGemini(
  userMessage: string,
  conversationHistory?: GeminiHistory
): Promise<string> {
  const genAI = getClient();

  const primary = pickModelName();
  const fallback = pickFallbackModel(primary);

  // Log debug giúp biết app đang dùng model nào (rất hữu ích khi test)
  if (process.env.NODE_ENV !== "production") {
    console.log("[Gemini] primary:", primary, "| fallback:", fallback);
  }

  const tryOnce = async (modelName: string) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: PC_BUILDER_SYSTEM_PROMPT,
    });

    // Có history → dùng chat session
    if (conversationHistory?.length) {
      const chat = model.startChat({ history: conversationHistory });
      const result = await chat.sendMessage([{ text: userMessage }]);
      return result.response.text();
    }

    // Không có history → generateContent
    const result = await model.generateContent([{ text: userMessage }]);
    return result.response.text();
  };

  try {
    const text = await tryOnce(primary);
    return text?.trim() || "";
  } catch (error: any) {
    const msg = String(error?.message || "");
    const status = error?.status;

    // ✅ Nếu lỗi liên quan model → thử fallback
    if (isModelError(status, msg) && fallback !== primary) {
      try {
        const text = await tryOnce(fallback);
        return text?.trim() || "";
      } catch (e2: any) {
        const msg2 = String(e2?.message || "");
        throw new Error(`Model lỗi (primary+fallback). Primary: ${primary}, Fallback: ${fallback}. Details: ${msg2}`);
      }
    }

    // ✅ Lỗi quota
    if (isQuotaError(status, msg)) {
      throw new Error("Đã vượt giới hạn quota/rate limit của Gemini (free tier). Vui lòng thử lại sau ít phút.");
    }

    // ✅ Lỗi API key / permission
    if (isApiKeyError(status, msg)) {
      throw new Error("API key không hợp lệ hoặc không có quyền. Vui lòng kiểm tra GEMINI_API_KEY và quyền dự án trong AI Studio.");
    }

    throw new Error(`Lỗi kết nối Gemini AI: ${msg}`);
  }
}

/** Test connection với Gemini */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await chatWithGemini("Xin chào, bạn có thể giúp tôi không?");
    return response.trim().length > 0;
  } catch (error) {
    console.error("Test connection failed:", error);
    return false;
  }
}

/** Extract product mentions để highlight */
export function extractProductMentions(response: string): string[] {
  const productKeywords = [
    "i9-14900K", "i7-14700K", "i5-14400F",
    "RTX 4090", "RTX 4080", "RTX 4070", "RTX 4060",
    "RX 7900 XTX", "RX 7800 XT",
    "Z790", "B760", "X670E", "B650",
    "DDR5", "DDR4",
  ];

  const mentions: string[] = [];
  for (const keyword of productKeywords) {
    if (response.includes(keyword)) mentions.push(keyword);
  }
  return mentions;
}
