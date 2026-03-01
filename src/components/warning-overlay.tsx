"use client"

import { AlertTriangle, Shield, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useGame } from "@/lib/game-store"

export function WarningOverlay() {
  const { warningCount, isBanned } = useGame()

  if (warningCount === 0 || isBanned) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-yellow-500/30 bg-[#0a0a0f] p-8 text-center shadow-2xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
            <AlertTriangle className="h-10 w-10" />
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">ADVERTÊNCIA</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            O Sistema detectou uma atividade suspeita em sua conta. 
            Esta é sua <span className="text-yellow-500 font-bold">PRIMEIRA E ÚNICA</span> advertência.
          </p>
          
          <div className="mt-6 rounded-2xl bg-yellow-500/10 p-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Próxima Violação:</p>
            <p className="mt-1 text-xs font-bold text-white">BANIMENTO PERMANENTE DO SISTEMA</p>
          </div>

          <button
            onClick={() => window.location.reload()} // Simple way to clear the local state if needed or just close
            className="mt-8 w-full rounded-2xl bg-white py-4 text-sm font-black uppercase tracking-widest text-black transition-all active:scale-95"
          >
            EU ENTENDI
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
