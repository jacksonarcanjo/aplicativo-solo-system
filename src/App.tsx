"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { GameProvider, useGame } from "@/lib/game-store"
import { LoginScreen } from "@/components/login-screen"
import { StatusTab } from "@/components/status-tab"
import { MissionsTab } from "@/components/missions-tab"
import { StoreTab } from "@/components/store-tab"
import { GuildTab } from "@/components/guild-tab"
import { MusicTab } from "@/components/music-tab"
import { ChatTab } from "@/components/chat-tab"
import { ProfileTab } from "@/components/profile-tab"
import { HomeTab } from "@/components/home-tab"
import { SettingsSidebar } from "@/components/settings-sidebar"
import { BottomNav, type Tab } from "@/components/bottom-nav"
import { NotificationToast } from "@/components/notification-toast"
import { FloatingYoutubePlayer } from "@/components/floating-youtube-player"
import { UpgradeModal } from "@/components/upgrade-modal"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { NotificationsModal } from "@/components/notifications-modal"
import { SupportChat } from "@/components/support-chat"
import { AchievementsModal } from "@/components/achievements-modal"
import { PenaltyScreen } from "@/components/penalty-screen"
import { RankQuestModal } from "@/components/rank-quest-modal"

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { themeColor } = useGame()
  
  return (
    <div className={`theme-${themeColor} min-h-dvh`}>
      {children}
    </div>
  )
}

function AuthenticatedAppContent() {
  const { onboardingCompleted, isLoaded, isPenalized } = useGame()
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const openUpgrade = () => setShowUpgrade(true)

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" />
          <span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
            Sincronizando com o Sistema...
          </span>
        </div>
      </div>
    )
  }

  if (!onboardingCompleted) {
    return <OnboardingScreen />
  }

  return (
    <ThemeWrapper>
      {isPenalized && <PenaltyScreen />}
      <RankQuestModal />
      <main className="relative mx-auto min-h-dvh max-w-md bg-background">
        <NotificationToast />

        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "home" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}>
          <HomeTab 
            onOpenSettings={() => setShowSettings(true)} 
            onOpenNotifications={() => setShowNotifications(true)}
          />
        </div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "status" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><StatusTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "missions" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><MissionsTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "store" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><StoreTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "guild" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><GuildTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "music" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><MusicTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "chat" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><ChatTab onUpgradeClick={openUpgrade} /></div>
        <div className={cn("absolute inset-0 overflow-y-auto", activeTab === "profile" ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none")}><ProfileTab onUpgradeClick={openUpgrade} onOpenAchievements={() => setShowAchievements(true)} /></div>

        <FloatingYoutubePlayer onUpgradeClick={openUpgrade} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
        <SettingsSidebar 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          onOpenNotifications={() => {
            setShowSettings(false)
            setShowNotifications(true)
          }}
          onOpenSupport={() => {
            setShowSettings(false)
            setShowSupport(true)
          }}
        />
        <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        <SupportChat isOpen={showSupport} onClose={() => setShowSupport(false)} />
        <AchievementsModal isOpen={showAchievements} onClose={() => setShowAchievements(false)} />
      </main>
    </ThemeWrapper>
  )
}

function AuthenticatedApp() {
  return (
    <GameProvider>
      <AuthenticatedAppContent />
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
