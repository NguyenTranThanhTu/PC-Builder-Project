/**
 * ChatBot Logging Service
 * Lưu conversations và messages vào database
 */

import { prisma } from "./prisma";

// Type assertions for Prisma models (temporary fix until types regenerate)
const db = prisma as any;

export interface LogChatMessageParams {
  conversationId: string;
  role: "user" | "bot";
  content: string;
  modelUsed?: string;
  tokensUsed?: number;
  responseTime?: number;
  isError?: boolean;
  errorMessage?: string;
}

export interface CreateConversationParams {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Tạo conversation mới hoặc lấy conversation đang active
 */
export async function getOrCreateConversation(params: CreateConversationParams) {
  const { sessionId, userId, userEmail, userName, userAgent, ipAddress } = params;

  // Tìm conversation đang active của session này
  let conversation = await db.chatConversation.findFirst({
    where: {
      sessionId,
      status: "active",
    },
  });

  // Nếu chưa có, tạo mới
  if (!conversation) {
    conversation = await db.chatConversation.create({
      data: {
        sessionId,
        userId: userId || null,
        userEmail: userEmail || null,
        userName: userName || null,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        status: "active",
        totalMessages: 0,
      },
    });
  }

  return conversation;
}

/**
 * Log một tin nhắn vào database
 */
export async function logChatMessage(params: LogChatMessageParams) {
  const {
    conversationId,
    role,
    content,
    modelUsed,
    tokensUsed,
    responseTime,
    isError = false,
    errorMessage,
  } = params;

  // Tạo message
  const message = await db.chatMessage.create({
    data: {
      conversationId,
      role,
      content,
      modelUsed,
      tokensUsed,
      responseTime,
      isError,
      errorMessage,
    },
  });

  // Update conversation metadata
  await db.chatConversation.update({
    where: { id: conversationId },
    data: {
      totalMessages: { increment: 1 },
      lastActivity: new Date(),
    },
  });

  return message;
}

/**
 * Đánh dấu conversation đã kết thúc
 */
export async function endConversation(conversationId: string) {
  return await db.chatConversation.update({
    where: { id: conversationId },
    data: {
      status: "ended",
      endedAt: new Date(),
    },
  });
}

/**
 * Lấy danh sách conversations (cho admin)
 */
export async function getConversations(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    startDate,
    endDate,
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { userEmail: { contains: search, mode: "insensitive" } },
      { userName: { contains: search, mode: "insensitive" } },
      { sessionId: { contains: search, mode: "insensitive" } },
    ];
  }

  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) where.startedAt.gte = startDate;
    if (endDate) where.startedAt.lte = endDate;
  }

  console.log("[CHAT LOGGER] getConversations called with:", { page, limit, search, status, where });

  // Get data
  try {
    const [conversations, total] = await Promise.all([
      db.chatConversation.findMany({
        where,
        orderBy: { lastActivity: "desc" },
        skip,
        take: limit,
        include: {
          messages: {
            take: 3,
            orderBy: { timestamp: "asc" },
          },
        },
      }),
      db.chatConversation.count({ where }),
    ]);

    console.log("[CHAT LOGGER] Query result:", { total, conversationsCount: conversations.length });

    return {
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[CHAT LOGGER] Error in getConversations:", error);
    throw error;
  }
}

/**
 * Lấy chi tiết một conversation
 */
export async function getConversationDetail(conversationId: string) {
  return await db.chatConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
      },
    },
  });
}

/**
 * Analytics: Thống kê tổng quan
 */
export async function getChatAnalytics(params: {
  startDate?: Date;
  endDate?: Date;
}) {
  const { startDate, endDate } = params;

  const where: any = {};
  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) where.startedAt.gte = startDate;
    if (endDate) where.startedAt.lte = endDate;
  }

  // Total conversations
  const totalConversations = await db.chatConversation.count({ where });

  // Total messages
  const totalMessages = await db.chatMessage.count({
    where: {
      conversation: where,
    },
  });

  // Active conversations
  const activeConversations = await db.chatConversation.count({
    where: { ...where, status: "active" },
  });

  // Average messages per conversation
  const avgMessagesPerConversation =
    totalConversations > 0 ? totalMessages / totalConversations : 0;

  // Messages by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const messagesByDay = await db.$queryRaw<
    Array<{ date: string; count: number }>
  >`
    SELECT 
      DATE(timestamp) as date,
      COUNT(*)::int as count
    FROM "ChatMessage"
    WHERE timestamp >= ${sevenDaysAgo}
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `;

  // Top keywords (simplified - lấy từ content)
  const recentMessages = await db.chatMessage.findMany({
    where: {
      role: "user",
      timestamp: startDate ? { gte: startDate } : undefined,
    },
    select: { content: true },
    take: 1000,
  });

  // Extract keywords (CPU, GPU, RAM, etc.)
  const keywords = [
    "i9",
    "i7",
    "i5",
    "i3",
    "ryzen",
    "rtx",
    "rx",
    "4090",
    "4080",
    "4070",
    "4060",
    "7900",
    "7800",
    "7700",
    "ddr5",
    "ddr4",
    "z790",
    "b760",
    "b650",
    "x670",
  ];

  const keywordCounts: Record<string, number> = {};
  keywords.forEach((kw) => (keywordCounts[kw] = 0));

  recentMessages.forEach((msg) => {
    const content = msg.content.toLowerCase();
    keywords.forEach((kw) => {
      if (content.includes(kw)) {
        keywordCounts[kw]++;
      }
    });
  });

  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    totalConversations,
    totalMessages,
    activeConversations,
    avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 10) / 10,
    messagesByDay,
    topKeywords,
  };
}

/**
 * Xóa conversations cũ (cleanup job)
 */
export async function deleteOldConversations(daysOld: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await db.chatConversation.deleteMany({
    where: {
      startedAt: { lt: cutoffDate },
    },
  });
}
