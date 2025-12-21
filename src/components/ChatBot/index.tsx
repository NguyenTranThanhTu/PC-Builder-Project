/**
 * ChatBot Component - Main Export
 * 
 * Usage:
 * 1. Wrap your app with ChatProvider in layout.tsx
 * 2. Add <ChatBot /> and <ChatWindow /> components
 * 3. (Optional) Add <ChatBotAnnouncement /> for top banner
 */

export { default as ChatBot } from './ChatBot';
export { default as ChatWindow } from './ChatWindow';
export { default as ChatBotAnnouncement } from './ChatBotAnnouncement';
export { ChatProvider, useChatBot, QUICK_ACTIONS } from './ChatContext';
export type { Message, ChatState, QuickAction } from './types';
