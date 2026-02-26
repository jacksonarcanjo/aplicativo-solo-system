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
  ChevronLeft,
  Search,
  CheckCircle2
} from "lucide-react"
import { db } from "@/lib/firebase-config"
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  limit,
  doc,
  setDoc,
  getDocs
} from "firebase/firestore"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ChatMetadata {
  userId: string
  userName: string
  userEmail: string
  lastMessage: string
  lastTimestamp: any
  updatedAt: any
}

interface SupportMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: any
  isAdmin: boolean
}

interface AdminSupportPanelProps {
  onClose: () => void
}

export function AdminSupportPanel({ onClose }: AdminSupportPanelProps) {
  const [chats, setChats] = useState<ChatMetadata[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [input, setInput] = useState("")
  const [search, setSearch] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load chat list
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const loadChats = async () => {
      try {
        const chatsRef = collection(db, "support_chats")
        const q = query(chatsRef, orderBy("updatedAt", "desc"))
        const snapshot = await getDocs(q)
        
        if (!mounted) return

        const chatList = snapshot.docs.map(doc => ({
          ...doc.data()
        })) as ChatMetadata[]
        setChats(chatList)
      } catch (error) {
        console.error("Admin chat list error:", error)
      } finally {
        if (mounted) {
          timeoutId = setTimeout(loadChats, 10000) // Poll every 10s
        }
      }
    }

    loadChats()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([])
      return
    }

    let mounted = true
    let timeoutId: NodeJS.Timeout

    const loadMessages = async () => {
      try {
        const messagesRef = collection(db, "support_chats", selectedChatId, "messages")
        const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100))
        const snapshot = await getDocs(q)
        
        if (!mounted) return

        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SupportMessage[]
        setMessages(newMessages)
      } catch (error) {
        console.error("Admin messages error:", error)
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
  }, [selectedChatId])

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleReply = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedChatId) return

    const messageContent = input.trim()
    setInput("")

    try {
      const chatRef = doc(db, "support_chats", selectedChatId)
      const messagesRef = collection(chatRef, "messages")
      
      await addDoc(messagesRef, {
        senderId: "admin",
        senderName: "Administrador",
        content: messageContent,
        timestamp: serverTimestamp(),
        isAdmin: true
      })

      await setDoc(chatRef, {
        lastMessage: messageContent,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
    } catch (error) {
      console.error("Error sending admin reply:", error)
    }
  }

  const filteredChats = chats.filter(c => 
    c.userName?.toLowerCase().includes(search.toLowerCase()) || 
    c.userEmail?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedChat = chats.find(c => c.userId === selectedChatId)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-x-4 top-[5%] z-[201] mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl"
    >
      <div className="flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">Painel de Suporte</h2>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Modo Administrador</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat List */}
          <div className={cn(
            "w-full md:w-72 border-r border-white/5 flex flex-col bg-black/20",
            selectedChatId && "hidden md:flex"
          )}>
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Buscar caçador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-2 pl-9 pr-4 text-xs text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest opacity-40">Nenhum chamado</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.userId}
                    onClick={() => setSelectedChatId(chat.userId)}
                    className={cn(
                      "w-full p-4 text-left transition-all border-b border-white/5 hover:bg-white/5",
                      selectedChatId === chat.userId && "bg-neon-blue/10 border-r-2 border-r-neon-blue"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-white truncate max-w-[120px]">{chat.userName}</span>
                      {chat.lastTimestamp && (
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">
                          {formatDistanceToNow(chat.lastTimestamp.toDate(), { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{chat.lastMessage}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={cn(
            "flex-1 flex flex-col bg-black/40",
            !selectedChatId && "hidden md:flex items-center justify-center"
          )}>
            {selectedChatId ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5">
                  <button 
                    onClick={() => setSelectedChatId(null)}
                    className="md:hidden rounded-lg bg-white/5 p-2 text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-blue/20 text-neon-blue">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">{selectedChat?.userName}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{selectedChat?.userEmail}</p>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none"
                >
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex w-full gap-3",
                        m.isAdmin ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "relative rounded-2xl p-3 text-xs leading-relaxed shadow-lg max-w-[80%]",
                        m.isAdmin 
                          ? "bg-neon-blue text-black font-medium rounded-tr-none" 
                          : "bg-white/5 text-white border border-white/10 rounded-tl-none"
                      )}>
                        {m.content}
                        {m.timestamp && (
                          <div className={cn(
                            "mt-1 text-[7px] font-bold uppercase opacity-50",
                            m.isAdmin ? "text-right" : "text-left"
                          )}>
                            {formatDistanceToNow(m.timestamp.toDate(), { addSuffix: true, locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-white/5">
                  <form onSubmit={handleReply} className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Responder ao caçador..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-4 pr-12 text-xs text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-neon-blue text-black shadow-lg shadow-neon-blue/20 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 opacity-30">
                <MessageSquare className="h-16 w-16 mb-4" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Selecione um Chamado</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] mt-2">
                  Escolha um caçador na lista ao lado para visualizar e responder as dúvidas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
