"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatDisplay } from "@/components/chat-display";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { useChat } from "@/context/ChatContext";
import { chat } from "@/service/chat";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentChatId, setCurrentChatId } = useChat();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      setCurrentChatId(params.id as string);
      // Here you would typically fetch the chat history for this ID
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chat(input);
      if (!response.ok) {
        throw new Error("Failed to fetch message from server");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.Answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto relative">
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
    </div>
  );
}