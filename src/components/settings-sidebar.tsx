"use client"

import { motion, AnimatePresence } from "motion/react"
import { 
  X, 
  Volume2, 
  VolumeX, 
  Headphones, 
  Instagram, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react"
import { useGame } from "@/lib/game-store"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface SettingsSidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpenNotifications: () => void
  onOpenSupport: () => void
}

export function SettingsSidebar({ isOpen, onClose, onOpenNotifications, onOpenSupport }: SettingsSidebarProps) {
  const { soundEnabled, setSoundEnabled, playerName, playerClass, level, appNotifications, avatarUrl } = useGame()
  const { logout } = useAuth()

  const unreadNotifications = appNotifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-[101] w-full max-w-[320px] border-l border-white/10 bg-[#0a0a0f] p-6 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">Configurações</h2>
                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Ajustes do Sistema</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Profile Summary */}
              <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-neon-blue/20 border border-neon-blue/30 flex items-center justify-center text-neon-blue font-black">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={playerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      playerName[0]
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{playerName}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{playerClass} • Nível {level}</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue w-2/3" />
                </div>
              </div>

              {/* Settings List */}
              <div className="flex-1 space-y-6 overflow-y-auto scrollbar-none">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preferências</h3>
                  
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {soundEnabled ? <Volume2 className="h-5 w-5 text-emerald-500" /> : <VolumeX className="h-5 w-5 text-rose-500" />}
                      <span className="text-sm font-bold text-white">Sons do Sistema</span>
                    </div>
                    <div className={cn(
                      "h-5 w-10 rounded-full transition-colors relative",
                      soundEnabled ? "bg-emerald-500" : "bg-white/10"
                    )}>
                      <div className={cn(
                        "absolute top-1 h-3 w-3 rounded-full bg-white transition-all",
                        soundEnabled ? "right-1" : "left-1"
                      )} />
                    </div>
                  </button>

                  <button 
                    onClick={onOpenNotifications}
                    className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Bell className="h-5 w-5 text-blue-500" />
                        {unreadNotifications > 0 && (
                          <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_5px_#f43f5e]" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-white">Notificações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifications > 0 && (
                        <span className="text-[10px] font-black text-rose-500">{unreadNotifications} novas</span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suporte & Social</h3>
                  
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span className="text-sm font-bold text-white">Instagram Oficial</span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>

                  <button 
                    onClick={onOpenSupport}
                    className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Headphones className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-bold text-white">Suporte Técnico</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sobre</h3>
                  <div className="rounded-xl bg-white/5 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Versão do Sistema</span>
                      <span className="text-xs font-bold text-white">4.1.2-stable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Build</span>
                      <span className="text-xs font-bold text-white">2026.02.26</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-rose-500/10 p-4 text-sm font-black uppercase tracking-widest text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  Encerrar Sessão
                </button>
                <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Solo Leveling: Sistema de Evolução
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
