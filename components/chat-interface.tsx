"use client"

import {useState, useRef, useEffect, memo} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export const ChatInterface = memo(function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Threat Intelligence Assistant with real-time database access (including CVE vulnerabilities and phishing domain data).\n\nI can help you with:\n- Query specific CVE vulnerability details\n- Analyze recent security threat trends\n- Provide targeted security recommendations\n- Retrieve phishing domain information\n\nI will clearly mark [DATABASE FACT] and [SECURITY ANALYSIS] to ensure information source transparency. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messageHistory }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      const assistantContent = await response.text()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat API error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, the service is temporarily unavailable. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later.`,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
      <Card className="w-full h-full flex flex-col shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Threat Intelligence AI Assistant
          </CardTitle>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Powered by RAG technology, providing accurate threat intelligence analysis with real-time database retrieval
          </p>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
          <div className="flex-1 p-6 mb-4 overflow-auto bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                  <div
                      key={message.id}
                      className={`flex gap-3 ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                          className={
                            message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                          }
                      >
                        {message.role === "user" ? (
                            <User className="h-4 w-4" />
                        ) : (
                            <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                        className={`flex flex-col gap-1 max-w-[85%] ${
                            message.role === "user" ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                          className={`rounded-lg px-4 py-3 shadow-sm ${
                              message.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        ) : (
                          <div className={`text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert
                            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                            prose-p:text-slate-800 dark:prose-p:text-slate-200
                            prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                            prose-ul:text-slate-800 dark:prose-ul:text-slate-200
                            prose-ol:text-slate-800 dark:prose-ol:text-slate-200
                            prose-li:text-slate-800 dark:prose-li:text-slate-200
                            prose-code:text-blue-600 dark:prose-code:text-blue-400
                            prose-code:bg-slate-100 dark:prose-code:bg-slate-800
                            prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800
                            prose-a:text-blue-600 dark:prose-a:text-blue-400`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                    </div>
                  </div>
              ))}
              {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-100">●</span>
                        <span className="animate-bounce delay-200">●</span>
                      </div>
                    </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="p-6 border-t bg-white dark:bg-slate-900">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Input
                  placeholder="Type your question, e.g.: What are the recent critical Microsoft vulnerabilities?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 h-12 text-base"
              />
              <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-12 w-12"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  )
})