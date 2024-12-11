// context/ChatContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getRecentChats, createNewChat } from '@/service/chat';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatContextType {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  refreshChats: (email: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const refreshChats = async (email: string) => {
    try {
      const response = await getRecentChats(email);
      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ chats, setChats, currentChatId, setCurrentChatId, refreshChats }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};