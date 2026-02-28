"use client"

import { motion } from "motion/react"
import { Crown, Lock, ShieldCheck } from "lucide-react"

interface PremiumOverlayProps {
  title: string
  description: string
  onUpgradeClick: () => void
}

export function PremiumOverlay({ title, description, onUpgradeClick }: PremiumOverlayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full w-full flex-col items-center justify-center bg-black/40 p-8 text-center backdrop-blur-xl"
    >
      <div className="relative mb-6">
        <div className="absolute -inset-4 animate-pulse rounded-full bg-gold/20 blur-xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gold/10 ring-1 ring-gold/30 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
          <Crown className="h-10 w-10 text-gold" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-gold/50">
          <Lock className="h-4 w-4 text-gold" />
        </div>
      </div>

      <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-[280px] text-xs font-bold uppercase tracking-widest text-gold/60">
        Recurso Exclusivo do Sistema
      </p>
      
      <div className="mt-8 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <button
        onClick={onUpgradeClick}
        className="group relative mt-10 w-full max-w-[240px] overflow-hidden rounded-2xl bg-gold py-5 font-display text-xl font-black uppercase tracking-widest text-black transition-all hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="relative flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          Desbloquear
        </span>
      </button>

      <p className="mt-6 text-[10px] font-medium text-muted-foreground/40">
        * Torne-se um Caçador de Rank S para acessar todas as funções.
      </p>
    </motion.div>
  )
}
