"use client"

import { useState } from "react"
import { useGame, THEME_COLORS, BANNER_PRESETS, getRank, getNextRank } from "@/lib/game-store"
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
  Flame
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface ProfileTabProps {
  onUpgradeClick: () => void
}

export function ProfileTab({ onUpgradeClick }: ProfileTabProps) {
  const { 
    playerName, 
    playerClass, 
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
    avatarUrl,
    setAvatarUrl
  } = useGame()
  const { logout } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(playerName)
  const [tempClass, setTempClass] = useState(playerClass)

  const currentRank = getRank(level)
  const nextRank = getNextRank(level)
  const xpToNext = nextRank ? nextRank.minLevel * 200 : level * 200
  const progress = (xp % 200) / 200 * 100

  const handleSave = () => {
    setPlayerName(tempName)
    setPlayerClass(tempClass)
    setIsEditing(false)
  }

  const activeBanner = BANNER_PRESETS.find(b => b.id === bannerPresetId) || BANNER_PRESETS[0]

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Banner & Avatar Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <div 
          className="absolute inset-0 transition-all duration-500" 
          style={{ background: activeBanner.gradient }}
        />
        <div className="absolute inset-0 bg-black/20" />
        
        <button className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-md hover:bg-black/60">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <div className="relative -mt-16 px-6">
        <div className="flex items-end justify-between">
          <div className="relative">
            <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-[#0a0a0f] bg-white/10 shadow-2xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={playerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                  <User className="h-16 w-16 text-white/20" />
                </div>
              )}
            </div>
            <button 
              onClick={() => setAvatarUrl(`https://picsum.photos/seed/${Date.now()}/400/400`)}
              className="absolute -bottom-2 -right-2 rounded-xl bg-neon-blue p-2 text-black shadow-lg shadow-neon-blue/20"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 flex gap-2">
            {!isPremium && (
              <button 
                onClick={onUpgradeClick}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-500/20"
              >
                <Crown className="h-3 w-3" />
                Upgrade
              </button>
            )}
            <button 
              onClick={logout}
              className="rounded-xl bg-white/5 p-2 text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Name & Class */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <input 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-lg font-black text-white focus:border-neon-blue focus:outline-none"
                />
                <input 
                  value={tempClass}
                  onChange={(e) => setTempClass(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground focus:border-neon-blue focus:outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="rounded-lg bg-neon-blue px-4 py-1 text-xs font-bold text-black">Salvar</button>
                  <button onClick={() => setIsEditing(false)} className="rounded-lg bg-white/5 px-4 py-1 text-xs font-bold text-white">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-3xl font-black tracking-tight text-white">{playerName}</h2>
                  {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                </div>
                <p className="font-bold text-neon-blue/80">{playerClass}</p>
              </div>
            )}
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-white">
                <Edit3 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Level Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Level</p>
            <p className="mt-1 text-xl font-black text-white">{level}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ofensiva</p>
            <div className="mt-1 flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <p className="text-xl font-black text-white">{streak}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rank</p>
            <p className={cn(
              "mt-1 text-xl font-black",
              currentRank.color === "blue" ? "text-neon-blue" : currentRank.color === "gold" ? "text-yellow-500" : "text-rose-500"
            )}>
              {currentRank.icon}
            </p>
          </div>
        </div>

        {/* Customization Sections */}
        <div className="mt-10 space-y-8">
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
