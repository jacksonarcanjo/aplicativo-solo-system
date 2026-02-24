"use client"

import { useEffect, useState } from "react"
import { useGame } from "@/lib/game-store"
import { CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export function NotificationToast() {
  const { notification, clearNotification } = useGame()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [notification])

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed left-1/2 top-6 z-[100] w-full max-w-[320px] -translate-x-1/2 px-4"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl">
            {/* Animated Background Glow */}
            <div className="absolute -right-4 -top-4 h-16 w-16 bg-neon-blue/20 blur-2xl" />
            
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                notification.type === "success" 
                  ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]" 
                  : "bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.3)]"
              }`}>
                {notification.type === "success" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Notificação do Sistema
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-white">
                  {notification.message}
                </p>
              </div>

              <button 
                onClick={clearNotification}
                className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 2.5, ease: "linear" }}
              className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${
                notification.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
