"use client"

import { useGame } from "@/lib/game-store"
import { Sparkles, Crown, X } from "lucide-react"
import { useState } from "react"

interface AdBannerProps {
  onUpgradeClick: () => void
}

export function AdBanner({ onUpgradeClick }: AdBannerProps) {
  const { isPremium } = useGame()
  const [isVisible, setIsVisible] = useState(true)

  if (isPremium || !isVisible) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neon-blue/20 bg-neon-blue/5 p-4">
      <div className="absolute -right-4 -top-4 h-16 w-16 bg-neon-blue/10 blur-2xl" />
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 text-muted-foreground hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue">
          <Sparkles className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-xs font-black uppercase tracking-widest text-white">
            Remover Anúncios
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Apoie o Sistema e ganhe recompensas exclusivas.
          </p>
        </div>

        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-2 rounded-lg bg-neon-blue px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-neon-blue/20 transition-all hover:scale-105 active:scale-95"
        >
          <Crown className="h-3 w-3" />
          Upgrade
        </button>
      </div>
    </div>
  )
}
