"use client"

import { 
  Home,
  Swords, 
  Target, 
  Package, 
  Users, 
  Music, 
  MessageCircle, 
  User 
} from "lucide-react"
import { cn } from "@/lib/utils"

export type Tab = "home" | "status" | "missions" | "store" | "guild" | "music" | "chat" | "profile"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { id: Tab; icon: any; label: string }[] = [
  { id: "home", icon: Home, label: "Início" },
  { id: "status", icon: Swords, label: "Status" },
  { id: "missions", icon: Target, label: "Missões" },
  { id: "store", icon: Package, label: "Loja" },
  { id: "guild", icon: Users, label: "Guilda" },
  { id: "music", icon: Music, label: "Música" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "profile", icon: User, label: "Perfil" },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-3">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "scale-110" : "opacity-50 hover:opacity-80"
              )}
            >
              <div className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                isActive && "bg-neon-blue/20 text-neon-blue shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "stroke-[2.5px]"
                )} />
                
                {isActive && (
                  <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-neon-blue shadow-[0_0_8px_#00E5FF]" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-tighter transition-all duration-300",
                isActive ? "text-neon-blue" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
