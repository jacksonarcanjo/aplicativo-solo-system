"use client"

import { useState } from "react"
import { useGame, THEME_COLORS, BANNER_PRESETS, getRank, getNextRank, PREMIUM_TITLES } from "@/lib/game-store"
import { useAuth } from "@/lib/auth-context"
import { 
  User, 
  Settings, 
  LogOut, 
  Camera, 
  Palette, 
  Crown, 
  Shield, 
  Star,
  Check,
  ChevronRight,
  Edit3,
  ImageIcon,
  Trophy,
  Zap,
  Flame,
  Bell
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

import { usePushNotifications } from "@/hooks/use-push-notifications"

interface ProfileTabProps {
  onUpgradeClick: () => void
  onOpenAchievements: () => void
}

export function ProfileTab({ onUpgradeClick, onOpenAchievements }: ProfileTabProps) {
  const { 
    playerName, 
    playerClass, 
    playerTitle,
    level, 
    xp, 
    streak, 
    isPremium, 
    themeColor, 
    setThemeColor,
    bannerPresetId,
    setBannerPresetId,
    setPlayerName,
    setPlayerClass,
    setPlayerTitle,
    avatarUrl,
    setAvatarUrl,
    bannerUrl,
    setBannerUrl,
    achievements
  } = useGame()
  const { logout } = useAuth()
  const { isSubscribed, subscribe } = usePushNotifications()
  
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(playerName)
  const [tempClass, setTempClass] = useState(playerClass)
  const [tempTitle, setTempTitle] = useState(playerTitle)
  const [tempAvatar, setTempAvatar] = useState(avatarUrl)
  const [tempBanner, setTempBanner] = useState(bannerUrl)

  const currentRank = getRank(level)
  const nextRank = getNextRank(level)
  const xpToNext = nextRank ? nextRank.minLevel * 200 : level * 200
  const progress = (xp % 200) / 200 * 100

  const handleSave = () => {
    // Check if trying to save premium features without being premium
    if (!isPremium) {
      if (tempBanner !== bannerUrl || tempTitle !== playerTitle) {
        onUpgradeClick()
        return
      }
    }

    setPlayerName(tempName)
    setPlayerClass(tempClass)
    setPlayerTitle(tempTitle)
    setAvatarUrl(tempAvatar)
    setBannerUrl(tempBanner)
    setIsEditing(false)
  }

  const activeBanner = BANNER_PRESETS.find(b => b.id === bannerPresetId) || BANNER_PRESETS[0]
  const activeColor = THEME_COLORS.find(c => c.id === themeColor) || THEME_COLORS[0]
  const unclaimedCount = (achievements || []).filter(a => a.unlockedAt && !a.claimed).length

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Banner & Avatar Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-500",
            bannerUrl ? "bg-cover bg-center" : ""
          )} 
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : { background: activeBanner.gradient }}
        />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute left-4 top-4 z-20">
          <button 
            onClick={logout}
            className="rounded-full bg-black/40 p-2 text-rose-500 backdrop-blur-md hover:bg-black/60"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute right-4 top-4 z-20 flex gap-2">
          {!isPremium && (
            <button 
              onClick={onUpgradeClick}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-500/20"
            >
              <Crown className="h-3 w-3" />
              Upgrade
            </button>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-md hover:bg-black/60"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative -mt-16 px-6 flex flex-col items-center">
        <div className="relative">
          {/* Aura Effect for Premium */}
          {isPremium && (
            <div 
              className="absolute -inset-1 animate-aura-pulse rounded-[2.2rem] opacity-75 blur-md"
              style={{ '--aura-color': activeColor.hex } as any}
            />
          )}
          
          <div className={cn(
            "relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-[#0a0a0f] bg-white/10 shadow-2xl",
            isPremium && "border-white/20"
          )}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={playerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                <User className="h-16 w-16 text-white/20" />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute -bottom-2 -right-2 z-10 rounded-xl bg-neon-blue p-2 text-black shadow-lg shadow-neon-blue/20"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-6 text-center">
        {/* Name & Class */}
        <div className="mt-4">
          <div className="flex flex-col items-center">
            {isEditing ? (
              <div className="w-full max-w-xs space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome</label>
                  <input 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white focus:border-neon-blue focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classe</label>
                  <input 
                    value={tempClass}
                    onChange={(e) => setTempClass(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Foto (Avatar)</label>
                  <div className="flex gap-2">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.type === "image/gif" && !isPremium) {
                            alert("GIFs são permitidos apenas para usuários Premium.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTempAvatar(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-neon-blue file:text-black hover:file:bg-neon-blue/80"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Banner</label>
                    {!isPremium && <Crown className="h-3 w-3 text-gold animate-pulse" />}
                  </div>
                  <div className="relative">
                    <input 
                      type="file"
                      accept="image/*"
                      disabled={!isPremium}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTempBanner(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={cn(
                        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-neon-blue file:text-black hover:file:bg-neon-blue/80",
                        !isPremium && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    />
                    {!isPremium && (
                      <div 
                        onClick={onUpgradeClick}
                        className="absolute inset-0 cursor-pointer" 
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título</label>
                    {!isPremium && <Crown className="h-3 w-3 text-gold animate-pulse" />}
                  </div>
                  <select
                    value={tempTitle}
                    disabled={!isPremium}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className={cn(
                      "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-neon-blue focus:outline-none",
                      !isPremium && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    <option value="" className="bg-[#0a0a0f]">Sem Título</option>
                    {PREMIUM_TITLES.map(title => (
                      <option key={title} value={title} className="bg-[#0a0a0f]">{title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2 justify-center">
                  <button onClick={handleSave} className="rounded-lg bg-neon-blue px-6 py-2 text-xs font-bold text-black shadow-lg shadow-neon-blue/20">Salvar</button>
                  <button onClick={() => setIsEditing(false)} className="rounded-lg bg-white/5 px-6 py-2 text-xs font-bold text-white">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-3xl font-black tracking-tight text-white">{playerName}</h2>
                  {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-bold text-neon-blue/80">{playerClass}</p>
                  {playerTitle && (
                    <>
                      <span className="text-muted-foreground/30">•</span>
                      <p className="text-xs font-bold uppercase tracking-widest text-yellow-500/80">{playerTitle}</p>
                    </>
                  )}
                </div>
              </div>
            )}
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="mt-4 flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/10 hover:text-white transition-all"
              >
                <Edit3 className="h-3 w-3" />
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Level Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level</p>
            <p className="mt-0.5 text-lg font-black text-white">{level}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ofensiva</p>
            <div className="mt-0.5 flex items-center justify-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <p className="text-lg font-black text-white">{streak}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rank</p>
            <p className={cn(
              "mt-0.5 text-lg font-black",
              currentRank.color === "blue" ? "text-neon-blue" : currentRank.color === "gold" ? "text-yellow-500" : "text-rose-500"
            )}>
              {currentRank.icon}
            </p>
          </div>
        </div>

        {/* Achievements Quick Access */}
        <button 
          onClick={onOpenAchievements}
          className="mt-6 flex w-full items-center justify-between rounded-2xl border border-neon-gold/20 bg-neon-gold/5 p-4 transition-all hover:bg-neon-gold/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-gold/20 text-neon-gold">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-tight text-white">Conquistas</p>
              <p className="text-[10px] font-bold text-neon-gold/60">
                {achievements?.filter(a => a.unlockedAt).length} de {achievements?.length} desbloqueadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unclaimedCount > 0 && (
              <span className="flex h-5 px-2 items-center justify-center rounded-full bg-neon-gold text-[10px] font-black text-black animate-bounce">
                {unclaimedCount}
              </span>
            )}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>

        {/* Customization Sections */}
        <div className="mt-6 space-y-6">
          {/* Push Notifications */}
          <section className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-blue">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-white">Notificações Externas</p>
                  <p className="text-[10px] font-bold text-muted-foreground">Receba chamados do Sistema fora do app</p>
                </div>
              </div>
              <button
                onClick={subscribe}
                disabled={isSubscribed}
                className={cn(
                  "rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  isSubscribed 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-neon-blue text-black hover:scale-105 active:scale-95"
                )}
              >
                {isSubscribed ? "Ativado" : "Ativar"}
              </button>
            </div>
          </section>

          {/* Theme Colors */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cor da Aura</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => (color.premium && !isPremium) ? onUpgradeClick() : setThemeColor(color.id)}
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                    themeColor === color.id ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {themeColor === color.id && <Check className="h-5 w-5 text-black" />}
                  {color.premium && !isPremium && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-black p-0.5">
                      <Crown className="h-2 w-2 text-yellow-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Banner Presets */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Banner de Fundo</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => (preset.premium && !isPremium) ? onUpgradeClick() : setBannerPresetId(preset.id)}
                  className={cn(
                    "group relative h-20 overflow-hidden rounded-xl border-2 transition-all",
                    bannerPresetId === preset.id ? "border-white" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="absolute inset-0" style={{ background: preset.gradient }} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-2 left-2">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-white drop-shadow-md">
                      {preset.label}
                    </p>
                  </div>
                  {preset.premium && !isPremium && (
                    <div className="absolute right-2 top-2 rounded-full bg-black/40 p-1 backdrop-blur-sm">
                      <Crown className="h-3 w-3 text-yellow-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pb-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Solo System v3.4.2
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/50">
            Desenvolvido para caçadores que buscam a evolução constante.
          </p>
        </div>
      </div>
    </div>
  )
}
