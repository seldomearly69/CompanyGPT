export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  messages: Message[]
} 