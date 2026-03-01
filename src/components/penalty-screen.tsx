"use client"

import { useState, useEffect } from "react"
import { useGame } from "@/lib/game-store"
import { useAuth } from "@/lib/auth-context"
import { useLocationTracker } from "@/hooks/use-location-tracker"
import { AlertTriangle, Flame, Timer, Navigation, Lock, Zap } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export function PenaltyScreen() {
  const { user } = useAuth()
  const { penaltyQuest, clearPenalty, updatePenaltyProgress } = useGame()
  const { distance, duration, isTracking, startTracking, stopTracking, error } = useLocationTracker()
  
  const isAdmin = user?.email === "meucanaldetutorial@gmail.com"
  
  // Sync local tracking to global state
  useEffect(() => {
    if (isTracking) {
      updatePenaltyProgress(distance, Math.floor(duration / 60))
    }
  }, [distance, duration, isTracking, updatePenaltyProgress])

  if (!penaltyQuest) return null

  const progressDistance = (distance / (penaltyQuest.required_distance || 1)) * 100
  const progressTime = (Math.floor(duration / 60) / (penaltyQuest.required_time || 1)) * 100
  
  const isComplete = 
    (penaltyQuest.required_distance && distance >= penaltyQuest.required_distance) ||
    (penaltyQuest.required_time && Math.floor(duration / 60) >= penaltyQuest.required_time)

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] p-6 text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        {/* Warning Header */}
        <div className="space-y-4">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl"
            />
            <Lock className="relative h-12 w-12 text-rose-500" />
          </div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-rose-500">
            Zona de Penalidade
          </h1>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-rose-500/60">
            Acesso Bloqueado pelo Sistema
          </p>
        </div>

        {/* Message */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm font-medium leading-relaxed text-rose-100">
              {penaltyQuest.description}
            </p>
          </div>
          {error && (
            <div className="rounded-lg bg-rose-500/20 p-3 text-[10px] font-bold text-rose-400">
              ERRO: {error}. Verifique as permissões de localização.
            </div>
          )}
          <div className="h-px w-full bg-rose-500/20" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500/40">
            O Sistema não aceita fraqueza. Evolua ou permaneça no abismo.
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-6">
          {penaltyQuest.required_distance && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Navigation className="h-3 w-3" /> Distância
                </span>
                <span className="font-mono text-xs font-bold text-rose-500">
                  {distance.toFixed(0)} / {penaltyQuest.required_distance}m
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progressDistance)}%` }}
                  className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                />
              </div>
            </div>
          )}

          {penaltyQuest.required_time && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Timer className="h-3 w-3" /> Tempo de Exercício
                </span>
                <span className="font-mono text-xs font-bold text-rose-500">
                  {Math.floor(duration / 60)} / {penaltyQuest.required_time} min
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progressTime)}%` }}
                  className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-4">
          {isComplete ? (
            <button
              onClick={clearPenalty}
              className="group relative w-full overflow-hidden rounded-2xl bg-emerald-500 py-5 font-display text-xl font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <Zap className="h-6 w-6 fill-current" />
                Aceitar Redenção
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={isTracking ? stopTracking : startTracking}
                className={cn(
                  "group relative w-full overflow-hidden rounded-2xl py-5 font-display text-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]",
                  isTracking 
                    ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" 
                    : "bg-white text-black"
                )}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isTracking ? (
                    <>
                      <Lock className="h-5 w-5" /> Pausar Treinamento
                    </>
                  ) : (
                    <>
                      <Flame className="h-5 w-5" /> Iniciar Redenção
                    </>
                  )}
                </span>
              </button>

              {isAdmin && (
                <button 
                  onClick={clearPenalty}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500/60 hover:bg-white/10 hover:text-rose-500 transition-all"
                >
                  <Zap className="h-3 w-3" />
                  Pular Penalidade (Admin)
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-[10px] font-medium text-muted-foreground">
          * Todas as outras funções do aplicativo estão desabilitadas até a conclusão desta tarefa.
        </p>
      </motion.div>
    </div>
  )
}
