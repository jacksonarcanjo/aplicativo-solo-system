"use client"

import { useState } from "react"
import { useGame, getRank } from "@/lib/game-store"
import { motion, AnimatePresence } from "motion/react"
import { 
  TrendingUp, 
  Calendar, 
  Zap, 
  Shield, 
  Trophy, 
  Bell, 
  Settings,
  ChevronRight,
  Info,
  X,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HomeTabProps {
  onOpenSettings: () => void
  onOpenNotifications: () => void
}

const UPDATES = [
  { 
    id: "v4.1", 
    title: "Novo Sistema de Onboarding", 
    description: "Agora o Sistema se adapta aos seus objetivos pessoais e profissionais.", 
    date: "Hoje",
    details: "O novo sistema de onboarding permite que você defina seus objetivos principais (Saúde, Carreira, Estudos, Mentalidade ou Disciplina). Com base nessas escolhas, o Sistema priorizará missões e conselhos da IA que ajudem você a alcançar esses focos específicos. É o primeiro passo para uma evolução verdadeiramente personalizada."
  },
  { 
    id: "v4.0", 
    title: "IA do Sistema 4.0", 
    description: "A inteligência artificial foi aprimorada para fornecer missões mais desafiadoras.", 
    date: "2 dias atrás",
    details: "A IA do Sistema agora utiliza modelos de linguagem mais avançados para entender seu progresso. Ela pode detectar quando você está estagnado e propor 'Missões de Emergência' ou 'Side Quests' mais complexas. Além disso, a personalidade do Sistema está mais imersiva, agindo como um verdadeiro guia de Solo Leveling."
  },
  { 
    id: "v3.8", 
    title: "Sistema de Investimentos", 
    description: "Gere ouro passivamente com o novo mercado de investimentos.", 
    date: "1 semana atrás",
    details: "Introduzimos o Mercado de Investimentos do Caçador. Agora você pode usar seu ouro acumulado para comprar ativos que geram renda passiva diária. Desde 'Pequenas Lojas de Poções' até 'Guildas de Mineração', escolha onde investir para garantir que seu ouro cresça mesmo enquanto você não está caçando."
  },
]

export function HomeTab({ onOpenSettings, onOpenNotifications }: HomeTabProps) {
  const { playerName, level, xp, accountCreatedAt, objectives, streak, appNotifications, rankQuest } = useGame()
  const [selectedUpdate, setSelectedUpdate] = useState<typeof UPDATES[0] | null>(null)

  const unreadNotifications = appNotifications.filter(n => !n.read).length
  const accountAge = formatDistanceToNow(new Date(accountCreatedAt), { locale: ptBR })
  const progress = (xp % 200) / 200 * 100
  const isAtCap = rankQuest !== null
  const currentRank = getRank(level)

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-black/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              MENU INICIAL
            </h1>
            <p className="text-[10px] font-bold tracking-widest text-neon-blue uppercase">
              Bem-vindo de volta, {playerName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onOpenNotifications}
            className="relative rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-[0_0_8px_#f43f5e]">
                {unreadNotifications}
              </div>
            )}
          </button>
          <button 
            onClick={onOpenSettings}
            className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
        {/* Progression Card */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neon-blue" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Sua Progressão</h2>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-neon-blue/5 blur-3xl" />
            
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nível Atual</p>
                <h3 className="text-5xl font-black text-white">{level}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">XP Total</p>
                <h3 className="text-xl font-black text-neon-blue">{xp}</h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">
                  {isAtCap ? "Teto de Nível Atingido" : `Progresso para o Nível ${level + 1}`}
                </span>
                <span className={cn("text-white", isAtCap && "text-gold animate-pulse")}>
                  {isAtCap ? "DESPERTAR" : `${Math.floor(progress)}%`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={cn(
                    "h-full shadow-[0_0_10px_rgba(0,229,255,0.5)]",
                    isAtCap ? "bg-gold shadow-[0_0_15px_rgba(255,215,0,0.6)]" : "bg-gradient-to-r from-neon-blue to-blue-600"
                  )} 
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tempo de App</p>
                <p className="text-sm font-black text-white">{accountAge}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Sessão Atual</p>
                <p className="text-sm font-black text-emerald-500">{streak} Dias</p>
              </div>
            </div>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Focos do Sistema</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {objectives.length > 0 ? objectives.map((obj) => (
              <div key={obj} className="rounded-full border border-neon-blue/20 bg-neon-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neon-blue">
                {obj === "health" ? "Saúde" : obj === "career" ? "Carreira" : obj === "studies" ? "Estudos" : obj === "mindset" ? "Mentalidade" : "Disciplina"}
              </div>
            )) : (
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Desenvolvimento Geral
              </div>
            )}
          </div>
        </section>

        {/* Updates Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white/60">Novidades do Sistema</h2>
          </div>
          
          <div className="space-y-3">
            {UPDATES.map((update) => (
              <button 
                key={update.id} 
                onClick={() => setSelectedUpdate(update)}
                className="group relative w-full text-left overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-black text-white group-hover:text-neon-blue transition-colors">{update.title}</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{update.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{update.description}</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-neon-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalhes <ChevronRight className="h-2 w-2" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 gap-4">
          <div className={cn(
            "flex items-center justify-between rounded-2xl border border-white/5 p-6",
            currentRank.color === "blue" ? "bg-blue-500/10" : currentRank.color === "gold" ? "bg-gold/10" : "bg-rose-500/10"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl",
                currentRank.color === "blue" ? "bg-blue-500/20 text-blue-400" : currentRank.color === "gold" ? "bg-gold/20 text-gold" : "bg-rose-500/20 text-rose-400"
              )}>
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{currentRank.title}</h4>
                <p className="text-xs text-muted-foreground">Sua classificação atual no Sistema.</p>
              </div>
            </div>
            <div className={cn(
              "text-2xl font-black italic",
              currentRank.color === "blue" ? "text-blue-400" : currentRank.color === "gold" ? "text-gold" : "text-rose-400"
            )}>
              {currentRank.icon}
            </div>
          </div>
        </section>
      </div>

      {/* Update Details Modal */}
      <AnimatePresence>
        {selectedUpdate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUpdate(null)}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-[20%] z-[101] mx-auto max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl"
            >
              <div className="relative p-6">
                <button 
                  onClick={() => setSelectedUpdate(null)}
                  className="absolute right-4 top-4 rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedUpdate.title}</h3>
                    <p className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">{selectedUpdate.id} • {selectedUpdate.date}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedUpdate.details}
                  </p>
                  
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Status da Atualização</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Implementado com Sucesso</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedUpdate(null)}
                  className="mt-8 w-full rounded-xl bg-neon-blue py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

