import { Message } from "@/types/chat"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ChatDisplayProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatDisplay({ messages, isLoading }: ChatDisplayProps) {
    console.log("isLoading: ", isLoading)
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "mb-4 flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%]",
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              )}
            >
              <p className="whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 flex justify-start"
          >
            <div className="rounded-lg px-4 py-2 bg-gray-200">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
  