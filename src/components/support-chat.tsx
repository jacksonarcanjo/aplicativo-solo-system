"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  X, 
  Send, 
  Headphones, 
  ShieldCheck, 
  User, 
  Clock, 
  MessageSquare,
  ShieldAlert,
  Bot
} from "lucide-react"
import { useGame } from "@/lib/game-store"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase-config"
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  limit,
  where,
  doc,
  setDoc,
  getDocs
} from "firebase/firestore"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ADMIN_EMAIL } from "@/lib/constants"
import { AdminSupportPanel } from "./admin-support-panel"

interface SupportChatProps {
  isOpen: boolean
  onClose: () => void
}

interface SupportMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: any
  isAdmin: boolean
}

export function SupportChat({ isOpen, onClose }: SupportChatProps) {
  const { user } = useAuth()
  const { playerName } = useGame()
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  // Load messages from Firestore
  useEffect(() => {
    if (!user || !isOpen || isAdmin) return

    let mounted = true
    let timeoutId: NodeJS.Timeout

    const loadMessages = async () => {
      try {
        const messagesRef = collection(db, "support_chats", user.uid, "messages")
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(50))
        const snapshot = await getDocs(q)
        
        if (!mounted) return

        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SupportMessage[]
        setMessages(newMessages)
      } catch (error) {
        console.error("Support chat sync error:", error)
      } finally {
        if (mounted) {
          timeoutId = setTimeout(loadMessages, 5000) // Poll every 5s
        }
      }
    }

    loadMessages()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [user, isOpen, isAdmin])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    const messageContent = input.trim()
    setInput("")

    try {
      const chatRef = doc(db, "support_chats", user.uid)
      const messagesRef = collection(chatRef, "messages")
      
      // Add message
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: playerName,
        content: messageContent,
        timestamp: serverTimestamp(),
        isAdmin: false
      })

      // Update metadata for admin list
      await setDoc(chatRef, {
        lastMessage: messageContent,
        lastTimestamp: serverTimestamp(),
        userName: playerName || "Jogador",
        userEmail: user.email || "",
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error("Error sending support message:", error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          />

          {isAdmin ? (
            <AdminSupportPanel onClose={onClose} />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[10%] z-[201] mx-auto max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl"
            >
              <div className="flex flex-col h-[70vh]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Headphones className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight text-white">Suporte Técnico</h2>
                      <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Fale com o Administrador</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none"
                >
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
                        <Bot className="h-8 w-8 opacity-20" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Inicie uma Conversa</h3>
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Envie uma mensagem para o administrador do Sistema. Responderemos o mais rápido possível.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "flex w-full gap-3",
                          m.isAdmin ? "flex-row" : "flex-row-reverse"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          m.isAdmin 
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-500" 
                            : "border-neon-blue/30 bg-neon-blue/10 text-neon-blue"
                        )}>
                          {m.isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        
                        <div className={cn(
                          "flex flex-col gap-1 max-w-[80%]",
                          m.isAdmin ? "items-start" : "items-end"
                        )}>
                          <div className={cn(
                            "relative rounded-2xl p-4 text-sm leading-relaxed shadow-lg",
                            m.isAdmin 
                              ? "bg-white/5 text-white border border-white/10 rounded-tl-none" 
                              : "bg-neon-blue text-black font-medium rounded-tr-none"
                          )}>
                            {m.content}
                          </div>
                          {m.timestamp && (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                              {formatDistanceToNow(m.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-white/5 bg-white/5 p-6">
                  <form 
                    onSubmit={handleSubmit}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Descreva seu problema ou dúvida..."
                      className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-4 pr-14 text-sm text-white placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                  <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    O Administrador visualizará sua mensagem em breve.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
