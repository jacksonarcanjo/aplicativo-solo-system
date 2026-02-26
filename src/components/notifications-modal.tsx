"use client"

import { motion, AnimatePresence } from "motion/react"
import { X, Bell, Trash2, Check, Clock } from "lucide-react"
import { useGame } from "@/lib/game-store"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { appNotifications, markNotificationAsRead, clearAllNotifications } = useGame()

  const unreadCount = appNotifications.filter(n => !n.read).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-[201] mx-auto max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl"
          >
            <div className="flex flex-col max-h-[70vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="h-6 w-6 text-neon-blue" />
                    {unreadCount > 0 && (
                      <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">Notificações</h2>
                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Alertas do Sistema</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {appNotifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
                      title="Limpar tudo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {appNotifications.length > 0 ? (
                  appNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer",
                        notification.read 
                          ? "border-white/5 bg-white/5 opacity-60" 
                          : "border-neon-blue/20 bg-neon-blue/5 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-neon-blue" />
                      )}
                      
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={cn(
                          "text-sm font-black transition-colors",
                          notification.read ? "text-white/80" : "text-white group-hover:text-neon-blue"
                        )}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="rounded-full bg-neon-blue/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-neon-blue">
                            Nova
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(notification.date), { addSuffix: true, locale: ptBR })}
                        </div>
                        {notification.read && (
                          <div className="flex items-center gap-1 text-emerald-500">
                            <Check className="h-3 w-3" />
                            Lida
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
                      <Bell className="h-8 w-8 opacity-20" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Nenhuma Notificação</h3>
                    <p className="text-xs text-muted-foreground">O Sistema não detectou novos alertas.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 bg-white/5 p-4 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Fim dos Registros do Sistema
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
