/**
 * Admin ChatBot - Conversation Detail Page
 * Path: /admin/chatbot/[id]
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: string;
  modelUsed: string | null;
  responseTime: number | null;
  isError: boolean;
}

interface Conversation {
  id: string;
  userName: string | null;
  userEmail: string | null;
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  lastActivity: string;
  totalMessages: number;
  status: string;
  userAgent: string | null;
  messages: Message[];
}

export default function ConversationDetailPage() {
  const params = useParams();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchConversation();
    }
  }, [params.id]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/chatbot/conversations/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setConversation(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-5">Loading...</div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-5">Conversation not found</div>
          <Link
            href="/admin/chatbot"
            className="text-[#9333EA] hover:text-[#7E22CE] mt-4 inline-block"
          >
            ← Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/chatbot"
          className="text-[#9333EA] hover:text-[#7E22CE] font-medium mb-4 inline-block"
        >
          ← Back to conversations
        </Link>
        <h1 className="text-3xl font-bold text-gray-9 mb-2">
          Conversation Detail
        </h1>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-5 mb-1">User</div>
            <div className="font-semibold text-gray-9">
              {conversation.userName || "Guest"}
            </div>
            {conversation.userEmail && (
              <div className="text-sm text-gray-6">{conversation.userEmail}</div>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-5 mb-1">Messages</div>
            <div className="font-semibold text-gray-9">
              {conversation.totalMessages}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-5 mb-1">Status</div>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                conversation.status === "active"
                  ? "bg-green-light-5 text-green-dark"
                  : "bg-gray-2 text-gray-6"
              }`}
            >
              {conversation.status}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-5 mb-1">Started</div>
            <div className="text-sm text-gray-9">
              {new Date(conversation.startedAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>

        {/* Session & Browser Info */}
        <div className="mt-4 pt-4 border-t border-gray-3">
          <div className="text-sm text-gray-5 mb-2">Session ID</div>
          <code className="text-xs bg-gray-1 px-2 py-1 rounded">
            {conversation.sessionId}
          </code>
        </div>

        {conversation.userAgent && (
          <div className="mt-2">
            <div className="text-sm text-gray-5 mb-1">Browser</div>
            <div className="text-xs text-gray-6">{conversation.userAgent}</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-3 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-9 mb-4">Messages</h2>

        <div className="space-y-4">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-[#3C50E0] text-white"
                    : "bg-[#F3E8FF]"
                }`}
              >
                {msg.role === "user" ? "👤" : "🤖"}
              </div>

              {/* Message */}
              <div className="flex-1 max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#3C50E0] to-[#1E40AF] text-white"
                      : msg.isError
                      ? "bg-[#FEEBEB] text-[#E10E0E] border border-[#FBC0C0]"
                      : "bg-gray-1 text-gray-9 border border-gray-3"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-70">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                    </span>
                    {msg.modelUsed && (
                      <span className="font-mono">{msg.modelUsed}</span>
                    )}
                    {msg.responseTime && (
                      <span>{msg.responseTime}ms</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
