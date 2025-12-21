"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useChatBot, QUICK_ACTIONS } from './ChatContext';
import type { Message } from './types';

export default function ChatWindow() {
  const { messages, isOpen, isLoading, isTyping, sendMessage, toggleChat, clearMessages } = useChatBot();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#9333EA] to-[#3C50E0] text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            🤖
          </div>
          <div>
            <h3 className="font-semibold">AI Advisor</h3>
            <p className="text-xs opacity-90">Chuyên gia tư vấn PC</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              title="Xóa lịch sử chat"
            >
              🗑️
            </button>
          )}
          <button
            onClick={toggleChat}
            className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            title="Đóng chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-4">
            {/* Animated header */}
            <div className="mb-4 animate-in fade-in slide-in-from-top duration-700">
              <div className="text-6xl mb-3 animate-bounce">🤖</div>
              <div className="inline-block bg-gradient-to-r from-[#9333EA] to-[#3C50E0] text-white px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-lg">
                ✨ TÍNH NĂNG MỚI
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#9333EA] to-[#3C50E0] bg-clip-text text-transparent mb-2">
                AI Advisor
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Chuyên gia tư vấn PC thông minh 🚀
              </p>
            </div>

            {/* Features showcase */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-md border-2 border-[#E9D5FF] animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 text-left">
                  <span className="text-lg">💰</span>
                  <div>
                    <div className="font-semibold text-gray-700">Tư vấn ngân sách</div>
                    <div className="text-gray-500">Build PC phù hợp túi tiền</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className="font-semibold text-gray-700">So sánh nhanh</div>
                    <div className="text-gray-500">CPU, GPU, RAM...</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <span className="text-lg">🔍</span>
                  <div>
                    <div className="font-semibold text-gray-700">Kiểm tra tương thích</div>
                    <div className="text-gray-500">Main + CPU + RAM</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-left">
                  <span className="text-lg">⬆️</span>
                  <div>
                    <div className="font-semibold text-gray-700">Gợi ý nâng cấp</div>
                    <div className="text-gray-500">Tối ưu hiệu suất</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 my-4 animate-in fade-in duration-700 delay-300">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-xs text-gray-500 font-medium">Bắt đầu ngay</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            
            {/* Quick Actions with enhanced styling */}
            <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
              {QUICK_ACTIONS.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.message)}
                  className="group p-3 bg-gradient-to-br from-white to-gray-1 rounded-xl hover:from-[#F3E8FF] hover:to-[#E1E8FF] transition-all text-left border-2 border-gray-3 hover:border-[#C084FC] hover:shadow-lg hover:scale-105 duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{action.icon}</div>
                  <div className="text-xs font-bold text-gray-7 group-hover:text-[#9333EA] transition-colors">{action.label}</div>
                </button>
              ))}
            </div>

            {/* Pro tip */}
            <div className="mt-4 p-3 bg-[#E1E8FF] rounded-lg border border-[#3C50E0] animate-in fade-in duration-700 delay-500">
              <div className="flex items-start gap-2 text-left">
                <span className="text-lg">💡</span>
                <div className="text-xs">
                  <div className="font-semibold text-[#1E40AF] mb-1">Pro Tip:</div>
                  <div className="text-[#3C50E0]">
                    Tôi có thể nhớ cuộc trò chuyện của bạn! Cứ hỏi tiếp tục nhé 😊
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              🤖
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-3 border border-gray-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#9333EA] focus:border-transparent"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-[#9333EA] to-[#3C50E0] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Shift + Enter để xuống dòng
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-[#3C50E0] text-white' : 'bg-[#F3E8FF]'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser 
          ? 'bg-gradient-to-br from-[#3C50E0] to-[#1E40AF] text-white rounded-tr-sm'
          : message.isError
          ? 'bg-[#FEEBEB] text-[#E10E0E] border border-[#FBC0C0] rounded-tl-sm'
          : 'bg-white text-gray-8 border border-gray-3 rounded-tl-sm'
      }`}>
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </div>
        <div className={`text-xs mt-2 ${
          isUser ? 'text-blue-100' : 'text-gray-400'
        }`}>
          {message.timestamp.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
