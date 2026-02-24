"use client"

import { useGame } from "@/lib/game-store"
import { Crown, Check, X, Sparkles, Zap, Shield, Star } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

const FEATURES = [
  { icon: Crown, label: "Títulos Exclusivos", desc: "Monarca das Sombras, Lorde das Trevas..." },
  { icon: Zap, label: "Auras de Cor", desc: "Verde Tóxico, Aura Sombria, Dourado Real" },
  { icon: Shield, label: "Banners Premium", desc: "Fenda do Vazio, Lua de Sangue e mais" },
  { icon: Star, label: "Sem Anúncios", desc: "Experiência limpa e sem interrupções" },
  { icon: Sparkles, label: "Suporte Prioritário", desc: "Acesso antecipado a novas missões" },
]

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { setIsPremium, isPremium } = useGame()

  const handleUpgrade = () => {
    setIsPremium(true)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl"
          >
            {/* Header with Gradient */}
            <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="relative flex flex-col items-center justify-center text-center">
                <Crown className="h-10 w-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                <h2 className="mt-2 text-xl font-black uppercase tracking-tighter text-white">
                  Solo System Premium
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-black/20 p-1 text-white/80 hover:bg-black/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 rounded-lg bg-white/5 p-1.5 text-neon-blue">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleUpgrade}
                  disabled={isPremium}
                  className="group relative w-full overflow-hidden rounded-xl bg-white py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isPremium ? "Já é Premium" : "Desbloquear Agora — R$ 19,90"}
                </button>
                
                <p className="text-center text-[10px] text-muted-foreground">
                  Pagamento único. Acesso vitalício a todos os recursos premium.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
