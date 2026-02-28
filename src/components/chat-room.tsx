"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/lib/auth-context"
import { useGame, getRank } from "@/lib/game-store"
import { Send, User, Loader2, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
}

export function ChatRoom() {
  const { user } = useAuth()
  const { playerName, level } = useGame()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSocket = io(window.location.origin)
    setSocket(newSocket)

    newSocket.on("connect", () => {
      setIsConnected(true)
    })

    newSocket.on("previous_messages", (prevMessages: Message[]) => {
      setMessages(prevMessages)
    })

    newSocket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    newSocket.on("disconnect", () => {
      setIsConnected(false)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !socket || !isConnected) return

    socket.emit("send_message", {
      userId: user?.uid,
      userName: playerName || user?.displayName || "Caçador",
      userAvatar: user?.photoURL,
      content: input.trim()
    })

    setInput("")
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-neon-blue" />
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Chat da Guilda</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-rose-500")} />
          <span className="text-[10px] font-bold uppercase text-muted-foreground">
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none"
      >
        {messages.length === 0 && isConnected && (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-20">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma mensagem ainda</p>
          </div>
        )}
        
        {!isConnected && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reconectando...</p>
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.userId === user?.uid
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: isMe ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col gap-1",
                isMe ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">
                  {m.userName}
                </span>
                <span className="text-[8px] text-muted-foreground/50">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                isMe 
                  ? "bg-neon-blue text-black font-medium rounded-tr-none" 
                  : "bg-white/10 text-white rounded-tl-none"
              )}>
                {m.content}
              </div>
            </motion.div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-4 pt-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Diga algo aos caçadores..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-neon-blue text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
