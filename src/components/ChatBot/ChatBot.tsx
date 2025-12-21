"use client";

import React, { useState, useEffect } from 'react';
import { useChatBot } from './ChatContext';

export default function ChatBot() {
  const { isOpen, toggleChat, messages } = useChatBot();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show tooltip after 2 seconds if user hasn't interacted
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('chatbot-intro-seen');
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hide tooltip after 8 seconds or when user interacts
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleClick = () => {
    setShowTooltip(false);
    setHasInteracted(true);
    localStorage.setItem('chatbot-intro-seen', 'true');
    toggleChat();
  };

  return (
    <>
      {/* Animated Pulse Ring - chỉ hiện khi chưa mở */}
      {!isOpen && !hasInteracted && (
        <div className="fixed bottom-6 right-6 w-16 h-16 z-[9998] pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9333EA] to-[#3C50E0] opacity-75 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9333EA] to-[#3C50E0] opacity-50 animate-pulse"></div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-[9999] transition-all duration-300 ${
          isOpen 
            ? 'bg-gray-6 hover:bg-gray-7 rotate-90' 
            : 'bg-gradient-to-br from-[#9333EA] to-[#3C50E0] hover:scale-110 hover:shadow-[#9333EA]/50'
        }`}
        title={isOpen ? 'Đóng chat' : 'Mở chatbot AI'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Badge "NEW" - nổi bật */}
      {!isOpen && !hasInteracted && (
        <div className="fixed bottom-[88px] right-[88px] z-[10000] pointer-events-none">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FBBF24] to-[#F27430] blur-lg opacity-75 animate-pulse"></div>
            {/* Badge */}
            <div className="relative bg-gradient-to-r from-[#FBBF24] via-[#F27430] to-[#F23030] text-white text-xs font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
              ✨ NEW
            </div>
          </div>
        </div>
      )}

      {/* Message count badge - khi đã có tin nhắn */}
      {!isOpen && messages.length > 0 && (
        <div className="fixed bottom-[88px] right-[88px] w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold z-[10000] animate-bounce shadow-lg">
          {messages.length > 9 ? '9+' : messages.length}
        </div>
      )}

      {/* Tooltip giới thiệu - hiện sau 2 giây */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-24 right-6 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative bg-gradient-to-br from-[#9333EA] to-[#3C50E0] text-white px-6 py-4 rounded-2xl shadow-2xl max-w-[280px]">
            {/* Close button */}
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white text-[#9333EA] rounded-full flex items-center justify-center text-sm font-bold hover:scale-110 transition-transform shadow-lg"
            >
              ✕
            </button>
            
            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg">AI Advisor</span>
                  <span className="bg-[#FBBF24] text-[#7E22CE] text-xs font-black px-2 py-0.5 rounded-full">NEW</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Chuyên gia AI hỗ trợ <span className="font-bold">24/7</span>
              </p>
              <ul className="text-xs space-y-1 opacity-90">
                <li>✨ Tư vấn build PC theo ngân sách</li>
                <li>⚡ So sánh linh kiện chi tiết</li>
                <li>🔍 Kiểm tra tương thích</li>
              </ul>
              <button
                onClick={handleClick}
                className="w-full mt-2 bg-white text-[#9333EA] font-bold py-2 rounded-lg hover:scale-105 transition-transform shadow-lg"
              >
                Thử ngay! 🚀
              </button>
            </div>

            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-[#9333EA] to-[#3C50E0] rotate-45"></div>
          </div>
        </div>
      )}
    </>
  );
}
