"use client"

import { useGame, type Achievement } from "@/lib/game-store"
import { 
  Trophy, 
  X, 
  CheckCircle2, 
  Lock, 
  Star, 
  Flame, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Footprints,
  Gift
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_ICONS: Record<string, any> = {
  progression: TrendingUp,
  consistency: Flame,
  social: Users,
  combat: ShoppingCart,
}

const REQ_ICONS: Record<string, any> = {
  level: TrendingUp,
  streak: Flame,
  tasks: CheckCircle2,
  gold_spent: ShoppingCart,
  friends: Users,
}

export function AchievementsModal({ isOpen, onClose }: AchievementsModalProps) {
  const { achievements, claimAchievementReward, level, streak, totalDaysCompleted, totalGoldSpent, friends } = useGame()

  const sortedAchievements = [...(achievements || [])].sort((a, b) => {
    // Unlocked but not claimed first
    if (a.unlockedAt && !a.claimed && (!b.unlockedAt || b.claimed)) return -1
    if (b.unlockedAt && !b.claimed && (!a.unlockedAt || a.claimed)) return 1
    // Locked last
    if (a.unlockedAt && !b.unlockedAt) return -1
    if (!a.unlockedAt && b.unlockedAt) return 1
    return 0
  })

  const stats = {
    level,
    streak,
    tasks: totalDaysCompleted,
    gold_spent: totalGoldSpent,
    friends: (friends || []).length
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl"
          >
            {/* Header */}
            <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 p-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">Conquistas</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neon-blue">Sua evolução como caçador</p>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded-full bg-black/40 p-2 text-white/60 hover:bg-black/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-neon-gold" />
                  <span className="text-xs font-black text-white">
                    {achievements?.filter(a => a.unlockedAt).length}/{achievements?.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {sortedAchievements.map((ach) => {
                const Icon = CATEGORY_ICONS[ach.category] || Trophy
                const isUnlocked = !!ach.unlockedAt
                const isClaimed = ach.claimed
                const canClaim = isUnlocked && !isClaimed

                return (
                  <div 
                    key={ach.id}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                      isUnlocked 
                        ? "border-neon-blue/20 bg-neon-blue/5" 
                        : "border-white/5 bg-white/5 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all",
                        isUnlocked ? "bg-neon-blue/20 text-neon-blue" : "bg-white/5 text-white/20"
                      )}>
                        {ach.iconId === "footprints" ? <Footprints className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold text-sm text-white">{ach.title}</h3>
                          {isClaimed && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">{ach.description}</p>
                        
                        {!isUnlocked && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className="h-full bg-neon-blue/40 transition-all" 
                                style={{ width: `${Math.min(100, (stats[ach.requirement.type as keyof typeof stats] / ach.requirement.value) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-muted-foreground">
                              {stats[ach.requirement.type as keyof typeof stats]}/{ach.requirement.value}
                            </span>
                          </div>
                        )}
                      </div>

                      {canClaim ? (
                        <button
                          onClick={() => claimAchievementReward(ach.id)}
                          className="shrink-0 flex items-center gap-1 rounded-lg bg-neon-gold px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-black animate-pulse shadow-lg shadow-neon-gold/20"
                        >
                          <Gift className="h-3 w-3" />
                          Coletar
                        </button>
                      ) : isUnlocked ? (
                        <div className="shrink-0 text-neon-blue/40">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="shrink-0 text-white/10">
                          <Lock className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {/* Reward Preview */}
                    {!isClaimed && (
                      <div className="border-t border-white/5 bg-black/20 px-4 py-2 flex items-center gap-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Recompensa:</span>
                        <div className="flex gap-2">
                          {ach.reward.xp && (
                            <span className="text-[9px] font-bold text-neon-blue">+{ach.reward.xp} XP</span>
                          )}
                          {ach.reward.gold && (
                            <span className="text-[9px] font-bold text-neon-gold">+{ach.reward.gold} Gold</span>
                          )}
                          {ach.reward.title && (
                            <span className="text-[9px] font-bold text-purple-400">Título: {ach.reward.title}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-4 bg-black/40">
              <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                Continue evoluindo para desbloquear mais
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
