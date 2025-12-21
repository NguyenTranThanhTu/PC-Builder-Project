/**
 * ChatBot Types
 */

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  isTyping: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon: string;
}
