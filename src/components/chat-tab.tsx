"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { useGame } from "@/lib/game-store"
import { GoogleGenAI } from "@google/genai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Youtube, 
  MessageSquare, 
  Zap,
  MoreHorizontal,
  Trash2,
  Brain,
  ShieldAlert,
  Sword,
  Skull
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface ChatTabProps {
  onUpgradeClick: () => void
}

interface ChatAction {
  label: string;
  type: "accept_mission" | "decline_mission" | "punish";
  payload: any;
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  actions?: ChatAction[]
}

export function ChatTab({ onUpgradeClick }: ChatTabProps) {
  const { playerName, level, isPremium, playerClass, attributes, addXp, addGold, punishPlayer } = useGame()
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      role: "assistant", 
      content: `### [SISTEMA DE EVOLUÇÃO]
Olá, **${playerName}**. Eu sou o Sistema. 

Detectei que sua energia vital está estável. Como posso auxiliar em sua jornada para o topo hoje?` 
    }
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const parseActions = (text: string): { cleanText: string, actions: ChatAction[] } => {
    const actionRegex = /\[ACTION:\s*({.*?})\s*\]/g;
    const actions: ChatAction[] = [];
    let cleanText = text;

    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const actionData = JSON.parse(match[1]);
        actions.push(actionData);
        cleanText = cleanText.replace(match[0], "");
      } catch (e) {
        console.error("Failed to parse action:", e);
      }
    }

    return { cleanText: cleanText.trim(), actions };
  }

  const handleAction = (action: ChatAction, messageId: string) => {
    if (action.type === "accept_mission") {
      const { mission } = action.payload;
      // For now, we just simulate accepting it
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: `### [MISSÃO ACEITA]
**Objetivo:** ${mission.title}
**Recompensa:** +${mission.reward_xp} XP, +${mission.reward_gold} Gold
**Penalidade em caso de falha:** ${mission.penalty_desc}` 
      }]);
    } else if (action.type === "decline_mission") {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: `### [AVISO]
Você recusou o desafio. O caminho para o Rank S exige sacrifícios.` 
      }]);
    } else if (action.type === "punish") {
      const { reason, hp, gold } = action.payload;
      punishPlayer(reason, hp, gold);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: `### [PUNIÇÃO EXECUTADA]
**Motivo:** ${reason}
**Dano Recebido:** -${hp} HP
**Perda de Recursos:** -${gold} Gold` 
      }]);
    }

    // Remove actions from the message after clicking
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, actions: [] } : m));
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })
      const model = "gemini-3-flash-preview"
      
      const systemInstruction = `Você é o "Sistema" do Solo Leveling. Seu objetivo é ajudar o caçador ${playerName} a evoluir na vida real.
      Dados do Caçador:
      - Nome: ${playerName}
      - Nível: ${level}
      - Classe: ${playerClass}
      - Atributos: FOR:${attributes.FOR}, AGI:${attributes.AGI}, VIT:${attributes.VIT}, INT:${attributes.INT}, PER:${attributes.PER}, CAR:${attributes.CAR}
      
      Sua personalidade é fria, direta, mas motivadora. Use termos de RPG (missões, XP, rank, dungeons).
      Use Markdown para formatar suas respostas (negrito, títulos, listas).
      
      INTERATIVIDADE:
      Se você quiser propor uma missão, inclua um bloco JSON no final da mensagem exatamente neste formato:
      [ACTION: { "type": "accept_mission", "label": "Aceitar Missão", "payload": { "mission": { "title": "Treino de 100 flexões", "reward_xp": 100, "reward_gold": 50, "penalty_desc": "-20 HP" } } }]
      
      Se o jogador falhar ou for preguiçoso, você pode puni-lo:
      [ACTION: { "type": "punish", "label": "Receber Punição", "payload": { "reason": "Preguiça detectada", "hp": 10, "gold": 20 } }]
      
      Seja breve e focado em produtividade.`

      const response = await genAI.models.generateContent({
        model,
        contents: messages.concat(userMessage).map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      })

      const rawText = response.text || "O Sistema encontrou uma falha na conexão."
      const { cleanText, actions } = parseActions(rawText);

      const assistantMessage: Message = { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: cleanText,
        actions: actions.length > 0 ? actions : undefined
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Erro no chat:", error)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Erro ao conectar com o Sistema. Verifique sua conexão." }])
    } finally {
      setIsTyping(false)
    }
  }

  const quickPrompts = [
    "Proponha uma missão de foco",
    "Como subir de nível?",
    "Dicas de treino",
    "Analise meus atributos"
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Bot className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0a0a0f] bg-emerald-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                IA do Sistema
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
                Online • Versão 4.0
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ id: Date.now().toString(), role: "assistant", content: "Chat reiniciado. Como posso ajudar?" }])}
            className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none"
      >
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex w-full gap-3",
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
              m.role === "user" 
                ? "border-neon-blue/30 bg-neon-blue/10 text-neon-blue" 
                : "border-white/10 bg-white/5 text-white"
            )}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
            </div>
            
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className={cn(
                "relative rounded-2xl p-4 text-sm leading-relaxed shadow-lg",
                m.role === "user" 
                  ? "bg-neon-blue text-black font-medium rounded-tr-none" 
                  : "bg-white/5 text-white border border-white/10 rounded-tl-none backdrop-blur-md"
              )}>
                <div className="max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-lg font-black uppercase tracking-tighter text-neon-blue mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-md font-black uppercase tracking-tight text-white mb-1" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-sm font-bold uppercase text-white/90 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-black text-neon-blue" {...props} />,
                      code: ({node, ...props}) => <code className="bg-white/10 px-1 rounded text-xs font-mono" {...props} />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Action Buttons */}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {m.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(action, m.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                        action.type === "punish" 
                          ? "bg-rose-600 text-white hover:bg-rose-700" 
                          : "bg-neon-blue text-black hover:bg-neon-blue/80"
                      )}
                    >
                      {action.type === "punish" ? <ShieldAlert className="h-3 w-3" /> : <Sword className="h-3 w-3" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white">
              <Brain className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0">
        {/* Quick Prompts */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt)
              }}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:border-neon-blue/50 hover:bg-neon-blue/10 hover:text-neon-blue"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form 
          onSubmit={handleSubmit}
          className="relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-4 pr-14 text-sm text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-neon-blue text-black shadow-lg shadow-neon-blue/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          O Sistema pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  )
}
