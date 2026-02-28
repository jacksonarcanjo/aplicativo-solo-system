"use client"

import { useGame } from "@/lib/game-store"
import { motion, AnimatePresence } from "motion/react"
import { Zap, Shield, Sword, Trophy, Lock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function RankQuestModal() {
  const { rankQuest, completeRankQuest } = useGame()

  if (!rankQuest) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-[#0a0a0f] p-8 shadow-[0_0_50px_rgba(255,215,0,0.15)]"
        >
          {/* Decorative Background Elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative space-y-6 text-center">
            {/* Header */}
            <div className="space-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-gold/20">
                <Zap className="h-10 w-10 text-gold animate-pulse" />
              </div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-gold">
                {rankQuest.title}
              </h2>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60">
                Missão de Despertar de Rank
              </p>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-left space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {rankQuest.description}
              </p>
              
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
                  <Sword className="h-3 w-3" /> Requisito de Aprovação
                </h3>
                <div className="rounded-xl bg-black/40 p-4 border border-gold/10">
                  <p className="text-sm font-medium text-white italic">
                    "{rankQuest.requirement_desc}"
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-center justify-center gap-2 rounded-full bg-rose-500/10 px-4 py-2 border border-rose-500/20">
              <Lock className="h-3 w-3 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
                Ganho de XP Bloqueado até a conclusão
              </span>
            </div>

            {/* Footer Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={completeRankQuest}
                className="group relative w-full overflow-hidden rounded-2xl bg-gold py-5 font-display text-xl font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  Concluir Despertar
                </span>
              </button>
              
              <p className="text-[10px] font-medium text-muted-foreground">
                * O Sistema exige prova real. Só clique se realmente concluiu o desafio.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
