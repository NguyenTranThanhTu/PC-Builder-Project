"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Message, ChatState, QuickAction } from './types';

interface ChatContextValue extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// Generate or get session ID from localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('chatbot-session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatbot-session-id', sessionId);
  }
  return sessionId;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isOpen: false,
    isLoading: false,
    isTyping: false,
  });
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize sessionId on mount
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isTyping: true,
    }));

    try {
      // Build history for context
      const history = state.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
      }));

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content.trim(),
          history,
          sessionId
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add bot message
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: data.data.response,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
        isTyping: false,
      }));

    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'bot',
        content: `Xin lỗi, có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        isError: true,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        isTyping: false,
      }));
    }
  }, [state.messages, state.isLoading, sessionId]);

  return (
    <ChatContext.Provider value={{ ...state, sendMessage, toggleChat, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatBot() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatBot must be used within ChatProvider');
  }
  return context;
}

// Quick actions cho chatbot
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'build-30m',
    label: 'Build PC 30tr',
    message: 'Tôi muốn build PC gaming 30 triệu để chơi game 2K, bạn có thể gợi ý cấu hình không?',
    icon: '🎮',
  },
  {
    id: 'compare-cpu',
    label: 'So sánh CPU',
    message: 'So sánh Intel i5-14400F và AMD Ryzen 5 7600X cho gaming?',
    icon: '⚖️',
  },
  {
    id: 'check-compat',
    label: 'Kiểm tra tương thích',
    message: 'CPU i9-14900K có dùng được với mainboard B760 không?',
    icon: '🔍',
  },
  {
    id: 'upgrade',
    label: 'Nâng cấp PC',
    message: 'PC của tôi đang dùng i5-12400F + RTX 3060, nâng cấp gì để chơi game mượt hơn?',
    icon: '⬆️',
  },
];
