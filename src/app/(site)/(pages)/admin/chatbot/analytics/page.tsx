/**
 * Admin ChatBot - Analytics Page
 * Path: /admin/chatbot/analytics
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Analytics {
  totalConversations: number;
  totalMessages: number;
  activeConversations: number;
  avgMessagesPerConversation: number;
  messagesByDay: Array<{ date: string; count: number }>;
  topKeywords: Array<{ keyword: string; count: number }>;
}

export default function ChatBotAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/chatbot/analytics`);
      const data = await res.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-5">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/chatbot"
          className="text-[#9333EA] hover:text-[#7E22CE] font-medium mb-4 inline-block"
        >
          ← Back to conversations
        </Link>
        <h1 className="text-3xl font-bold text-gray-9 mb-2">
          📊 ChatBot Analytics
        </h1>
        <p className="text-gray-5">Thống kê & insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Conversations */}
        <div className="bg-gradient-to-br from-[#9333EA] to-[#7E22CE] text-white rounded-xl p-6 shadow-lg">
          <div className="text-white/80 text-sm mb-2">Total Conversations</div>
          <div className="text-4xl font-bold mb-2">
            {analytics.totalConversations}
          </div>
          <div className="text-white/70 text-xs">All time</div>
        </div>

        {/* Total Messages */}
        <div className="bg-gradient-to-br from-[#3C50E0] to-[#1E40AF] text-white rounded-xl p-6 shadow-lg">
          <div className="text-white/80 text-sm mb-2">Total Messages</div>
          <div className="text-4xl font-bold mb-2">
            {analytics.totalMessages}
          </div>
          <div className="text-white/70 text-xs">User + Bot replies</div>
        </div>

        {/* Active Now */}
        <div className="bg-gradient-to-br from-[#22AD5C] to-[#1A8245] text-white rounded-xl p-6 shadow-lg">
          <div className="text-white/80 text-sm mb-2">Active Now</div>
          <div className="text-4xl font-bold mb-2">
            {analytics.activeConversations}
          </div>
          <div className="text-white/70 text-xs">Conversations open</div>
        </div>

        {/* Avg Messages */}
        <div className="bg-gradient-to-br from-[#F27430] to-[#E1580E] text-white rounded-xl p-6 shadow-lg">
          <div className="text-white/80 text-sm mb-2">Avg Messages</div>
          <div className="text-4xl font-bold mb-2">
            {analytics.avgMessagesPerConversation}
          </div>
          <div className="text-white/70 text-xs">Per conversation</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Day */}
        <div className="bg-white rounded-xl border border-gray-3 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-9 mb-4">
            Messages Over Time (Last 7 Days)
          </h2>
          <div className="space-y-3">
            {analytics.messagesByDay.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="text-sm text-gray-6 w-24">
                  {new Date(day.date).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex-1 h-8 bg-gray-1 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#9333EA] to-[#3C50E0] rounded-lg flex items-center justify-end px-3 text-white text-sm font-semibold"
                    style={{
                      width: `${Math.min(
                        (day.count /
                          Math.max(...analytics.messagesByDay.map((d) => d.count))) *
                          100,
                        100
                      )}%`,
                      minWidth: day.count > 0 ? "40px" : "0",
                    }}
                  >
                    {day.count > 0 && day.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Keywords */}
        <div className="bg-white rounded-xl border border-gray-3 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-9 mb-4">
            Top Keywords (Most Asked)
          </h2>
          <div className="space-y-3">
            {analytics.topKeywords
              .filter((kw) => kw.count > 0)
              .map((kw, index) => (
                <div key={kw.keyword} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9333EA] to-[#3C50E0] text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-9 uppercase">
                        {kw.keyword}
                      </span>
                      <span className="text-sm text-gray-6">{kw.count}x</span>
                    </div>
                    <div className="h-2 bg-gray-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#9333EA] to-[#3C50E0] rounded-full"
                        style={{
                          width: `${Math.min(
                            (kw.count /
                              Math.max(...analytics.topKeywords.map((k) => k.count))) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {analytics.topKeywords.filter((kw) => kw.count > 0).length === 0 && (
            <div className="text-center py-8 text-gray-5">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-gradient-to-br from-[#E1E8FF] to-[#F3E8FF] rounded-xl border-2 border-[#C084FC] p-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-bold text-gray-9 mb-2">Key Insights</h3>
            <ul className="space-y-2 text-sm text-gray-7">
              <li>
                • Users trung bình hỏi{" "}
                <strong>{analytics.avgMessagesPerConversation}</strong> tin nhắn
                mỗi conversation
              </li>
              <li>
                • Có <strong>{analytics.activeConversations}</strong> conversations
                đang active
              </li>
              <li>
                • Keywords hot nhất:{" "}
                <strong>
                  {analytics.topKeywords
                    .filter((k) => k.count > 0)
                    .slice(0, 3)
                    .map((k) => k.keyword)
                    .join(", ") || "N/A"}
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
