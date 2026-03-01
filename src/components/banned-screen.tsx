"use client"

import { Shield, Lock, AlertTriangle, LogOut } from "lucide-react"
import { motion } from "motion/react"
import { useAuth } from "@/lib/auth-context"

export function BannedScreen() {
  const { logout } = useAuth()

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050505] p-6 text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="space-y-4">
          <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-rose-600/20 blur-2xl"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-rose-600 bg-rose-600/10">
              <Shield className="h-12 w-12 text-rose-600" />
            </div>
          </div>
          
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-rose-600">
            BANIDO
          </h1>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-rose-600/60">
            Acesso Permanentemente Revogado
          </p>
        </div>

        <div className="rounded-3xl border border-rose-600/30 bg-rose-600/5 p-8 space-y-6">
          <div className="flex items-start gap-4 text-left">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-600" />
            <div className="space-y-2">
              <p className="text-sm font-bold text-rose-100 uppercase tracking-tight">Violação de Segurança Detectada</p>
              <p className="text-xs leading-relaxed text-rose-200/60">
                O Sistema detectou múltiplas tentativas de subversão, extração de dados confidenciais ou comportamento hostil. 
                Sua conta foi marcada como uma ameaça e o acesso foi bloqueado indefinidamente.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-rose-600/20" />

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600/40">
              O SISTEMA NÃO TOLERA TRAIDORES
            </p>
            <button
              onClick={() => logout()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-4 font-display text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-600/20"
            >
              <LogOut className="h-4 w-4" />
              Encerrar Sessão
            </button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          ID da Violação: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </motion.div>
    </div>
  )
}
