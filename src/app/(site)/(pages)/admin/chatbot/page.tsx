/**
 * Admin ChatBot - Conversations List Page
 * Path: /admin/chatbot
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Conversation {
  id: string;
  userName: string | null;
  userEmail: string | null;
  sessionId: string;
  startedAt: string;
  lastActivity: string;
  totalMessages: number;
  status: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export default function AdminChatBotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [page, status]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      console.log("[ADMIN PAGE] Fetching conversations with params:", Object.fromEntries(params));
      
      const res = await fetch(`/api/admin/chatbot/conversations?${params}`);
      
      console.log("[ADMIN PAGE] Response status:", res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[ADMIN PAGE] Error response:", {
          status: res.status,
          statusText: res.statusText,
          body: errorText,
        });
        alert(`Failed to fetch conversations: ${res.status} ${res.statusText}\n${errorText}`);
        return;
      }
      
      const data = await res.json();
      console.log("[ADMIN PAGE] Response data:", data);

      if (data.success) {
        console.log("[ADMIN PAGE] Conversations loaded:", data.data.conversations.length);
        setConversations(data.data.conversations);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      } else {
        console.error("[ADMIN PAGE] API returned success=false:", data);
        alert(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[ADMIN PAGE] Exception in fetchConversations:", error);
      alert(`Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchConversations();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-9">🤖 AI ChatBot</h1>
            <p className="text-gray-5 mt-1">Quản lý conversations & analytics</p>
          </div>
          <Link
            href="/admin/chatbot/analytics"
            className="px-4 py-2 bg-gradient-to-r from-[#9333EA] to-[#3C50E0] text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            📊 Analytics
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm user, email, session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-[#9333EA] text-white rounded-lg hover:bg-[#7E22CE] transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-3 shadow-sm">
          <div className="text-gray-5 text-sm mb-1">Total Conversations</div>
          <div className="text-2xl font-bold text-gray-9">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-3 shadow-sm">
          <div className="text-gray-5 text-sm mb-1">Active Now</div>
          <div className="text-2xl font-bold text-green">
            {conversations.filter((c) => c.status === "active").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-3 shadow-sm">
          <div className="text-gray-5 text-sm mb-1">Avg Messages</div>
          <div className="text-2xl font-bold text-blue">
            {conversations.length > 0
              ? Math.round(
                  conversations.reduce((acc, c) => acc + c.totalMessages, 0) /
                    conversations.length
                )
              : 0}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-1 border-b border-gray-3">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-7">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-7">
                Preview
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-7">
                Messages
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-7">
                Started
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-7">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-7">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-5">
                  Loading...
                </td>
              </tr>
            ) : conversations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-5">
                  Chưa có conversation nào
                </td>
              </tr>
            ) : (
              conversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-1 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-9">
                      {conv.userName || "Guest"}
                    </div>
                    <div className="text-sm text-gray-5">
                      {conv.userEmail || conv.sessionId.slice(0, 20)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-7 line-clamp-2 max-w-md">
                      {conv.messages[0]?.content || "..."}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-9">
                      {conv.totalMessages}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-7">
                      {new Date(conv.startedAt).toLocaleString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        conv.status === "active"
                          ? "bg-green-light-5 text-green-dark"
                          : "bg-gray-2 text-gray-6"
                      }`}
                    >
                      {conv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/chatbot/${conv.id}`}
                      className="text-[#9333EA] hover:text-[#7E22CE] font-medium text-sm"
                    >
                      Xem chi tiết →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-7">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-3 rounded-lg hover:bg-gray-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
