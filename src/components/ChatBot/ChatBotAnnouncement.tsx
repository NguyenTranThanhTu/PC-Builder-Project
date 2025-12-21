/**
 * ChatBot Announcement Banner
 * Hiển thị thông báo tính năng mới ở top của trang
 */
"use client";

import React, { useState, useEffect } from 'react';
import { useChatBot } from './ChatContext';

export default function ChatBotAnnouncement() {
  const [show, setShow] = useState(false);
  const { toggleChat } = useChatBot();

  useEffect(() => {
    // Chỉ hiển thị nếu chưa từng thấy announcement này
    const hasSeenAnnouncement = localStorage.getItem('chatbot-announcement-seen');
    if (!hasSeenAnnouncement) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('chatbot-announcement-seen', 'true');
  };

  const handleTryNow = () => {
    handleClose();
    toggleChat();
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] animate-in slide-in-from-top duration-500">
      {/* Gradient banner */}
      <div className="bg-gradient-to-r from-[#9333EA] via-[#3C50E0] to-[#9333EA] text-white py-3 px-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Content */}
          <div className="flex items-center gap-3 flex-1">
            {/* Icon with pulse */}
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
              <div className="relative text-2xl">🤖</div>
            </div>

            {/* Text */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FBBF24] text-[#7E22CE] text-xs font-black px-2 py-1 rounded-full animate-bounce">
                ✨ NEW
              </span>
              <span className="font-bold text-sm sm:text-base">
                AI Advisor đã có mặt!
              </span>
              <span className="text-sm hidden sm:inline">
                Tư vấn PC miễn phí 24/7 🚀
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTryNow}
              className="bg-white text-[#9333EA] font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg text-sm whitespace-nowrap"
            >
              Thử ngay! 🎯
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
