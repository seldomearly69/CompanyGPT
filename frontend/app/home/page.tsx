"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChatDisplay } from "@/components/chat-display"
import { Message } from "@/types/chat"
import { motion } from "framer-motion"
import {container, fastChild} from "@/app/(auth)/login/page"
import { chat, createNewChat } from "@/service/chat"
import { useChat } from "@/context/ChatContext"
import { getCurrentUser } from "@/lib/session";
import { useRouter } from "next/navigation";
import { getChatHistory, updateChatHistory } from "@/service/chat";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setCurrentChatId, refreshChats } = useChat()
  const [user, setUser] = useState<any>(null)
  const router = useRouter();
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
  }, [])

  const fetchChatHistory = async (chatId: string) => {
    try {
      const response = await getChatHistory(chatId);
      if (response.ok) {
        const data = await response.json();
        const mlist: Message[] = []
        for (const index in data.messages) {
          const messageObject: Message = {
            role: parseInt(index) % 2 === 0 ? "user" : "assistant",
            content: data.messages[index]
          }
          mlist.push(messageObject)
        }
        setMessages(mlist);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    if (currentChat) {
      fetchChatHistory(currentChat);
    }
  }, [currentChat, refreshTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!input.trim() || isLoading || !user) return;
  
    setIsLoading(true);
  
    try {
      if (messages.length === 0) {
        const chatResponse = await createNewChat(input, user.email);
        const chatData = await chatResponse.json();
        setCurrentChatId(chatData.chatId);
        setCurrentChat(chatData.chatId);
        await refreshChats(user.email);
        
        const userMessage: Message = {
          role: "user",
          content: input
        };
        
        setInput("");
        console.log(chatData)
        const response = await chat(input);
        if (!response.ok) {
          throw new Error("Failed to fetch message from server");
        }

        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.Answer
        };
        
        await updateChatHistory(chatData.chatId, [
          assistantMessage.content
        ]);
        
        setRefreshTrigger(prev => prev + 1);
        router.push(`/home/chat/${chatData.chatId}`, { scroll: false });
        return;
      }
  
      const userMessage: Message = {
        role: "user",
        content: input
      };
  
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
  
      const response = await chat(input);
      if (!response.ok) {
        throw new Error("Failed to fetch message from server");
      }
  
      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.Answer
      };

      if (currentChat) {
        await updateChatHistory(currentChat, [
          userMessage.content,
          assistantMessage.content
        ]);
        setRefreshTrigger(prev => prev + 1);
      }
  
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto relative">
      {messages.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center flex-1 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
                variants={container}
                initial="hidden"
                animate="visible"
                className="text-4xl mb-6"
              >
                {Array.from("What can I help you with?").map(
                  (letter, index) => (
                    <motion.span key={index} variants={fastChild}>
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  )
                )}
              </motion.p>
          <motion.form
            onSubmit={handleSubmit}
            className="flex gap-2 w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </motion.form>
        </motion.div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <ChatDisplay messages={messages} isLoading={isLoading} />
          </div>
          <motion.form
            onSubmit={handleSubmit}
            className="p-4 border-t flex gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </motion.form>
        </>
      )}
    </div>
  )
}