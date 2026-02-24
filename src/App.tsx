"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { GameProvider } from "@/lib/game-store"
import { LoginScreen } from "@/components/login-screen"
import { StatusTab } from "@/components/status-tab"
import { MissionsTab } from "@/components/missions-tab"
import { StoreTab } from "@/components/store-tab"
import { GuildTab } from "@/components/guild-tab"
import { MusicTab } from "@/components/music-tab"
import { ChatTab } from "@/components/chat-tab"
import { ProfileTab } from "@/components/profile-tab"
import { BottomNav, type Tab } from "@/components/bottom-nav"
import { NotificationToast } from "@/components/notification-toast"
import { FloatingYoutubePlayer } from "@/components/floating-youtube-player"
import { UpgradeModal } from "@/components/upgrade-modal"

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState<Tab>("status")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const openUpgrade = () => setShowUpgrade(true)

  return (
    <GameProvider>
      <main className="relative mx-auto min-h-dvh max-w-md bg-background">
        <NotificationToast />

        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "status" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><StatusTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "missions" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><MissionsTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "store" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><StoreTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "guild" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><GuildTab /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "music" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><MusicTab /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "chat" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><ChatTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "profile" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><ProfileTab onUpgradeClick={openUpgrade} /></div>

        <FloatingYoutubePlayer onUpgradeClick={openUpgrade} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </main>
    </GameProvider>
  )
}

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" />
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Carregando...
          </span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <AuthenticatedApp />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
