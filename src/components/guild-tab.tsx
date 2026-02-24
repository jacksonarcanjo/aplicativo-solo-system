"use client"

import { useState } from "react"
import { useGame, getRank } from "@/lib/game-store"
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Search, 
  Shield, 
  Flame, 
  Star,
  ChevronRight,
  Crown
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

const MOCK_RANKING = [
  { name: "JinWoo_Solo", level: 85, streak: 120, xp: 17000, isMe: false, rank: "S" },
  { name: "ShadowLord", level: 72, streak: 95, xp: 14500, isMe: false, rank: "S" },
  { name: "NeonHunter", level: 64, streak: 82, xp: 12900, isMe: false, rank: "A" },
  { name: "VoidWalker", level: 58, streak: 70, xp: 11700, isMe: false, rank: "A" },
  { name: "AuraMaster", level: 45, streak: 55, xp: 9100, isMe: false, rank: "B" },
]

export function GuildTab() {
  const { playerName, level, xp, streak, themeColor } = useGame()
  const [activeSubTab, setActiveSubTab] = useState<"ranking" | "friends">("ranking")
  const [searchQuery, setSearchQuery] = useState("")

  const myRank = getRank(level)
  
  const fullRanking = [
    ...MOCK_RANKING,
    { name: playerName, level, streak, xp, isMe: true, rank: myRank.icon }
  ].sort((a, b) => b.xp - a.xp)

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-blue/20 text-neon-blue shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
              Guilda Global
            </h1>
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Competição e Cooperação
            </p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setActiveSubTab("ranking")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all",
              activeSubTab === "ranking" 
                ? "bg-white text-black shadow-lg" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </button>
          <button
            onClick={() => setActiveSubTab("friends")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all",
              activeSubTab === "friends" 
                ? "bg-white text-black shadow-lg" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <UserPlus className="h-4 w-4" />
            Amigos
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {activeSubTab === "ranking" ? (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {fullRanking.map((user, index) => (
                <div
                  key={user.name}
                  className={cn(
                    "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition-all",
                    user.isMe 
                      ? "border-neon-blue/50 bg-neon-blue/10 shadow-[0_0_20px_rgba(0,229,255,0.1)]" 
                      : "border-white/5 bg-white/5 hover:bg-white/10"
                  )}
                >
                  {/* Rank Number */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-lg font-black italic text-muted-foreground">
                    {index + 1}
                  </div>

                  {/* Avatar Placeholder */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white/20">
                      {user.rank}
                    </div>
                    {index === 0 && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-yellow-500 p-1 shadow-lg">
                        <Crown className="h-3 w-3 text-black" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-bold",
                        user.isMe ? "text-neon-blue" : "text-white"
                      )}>
                        {user.name}
                      </h3>
                      {user.isMe && (
                        <span className="rounded-full bg-neon-blue/20 px-2 py-0.5 text-[8px] font-black uppercase text-neon-blue">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star className="h-3 w-3 text-neon-blue" />
                        <span>LVL {user.level}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Flame className="h-3 w-3 text-orange-500" />
                        <span>{user.streak} Ofensiva</span>
                      </div>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-white">
                      {user.xp.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      XP Total
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Search Friends */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar caçadores..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue"
                />
              </div>

              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-white/5 p-6 text-muted-foreground">
                  <UserPlus className="h-12 w-12" />
                </div>
                <h3 className="mt-4 font-bold text-white">Nenhum amigo ainda</h3>
                <p className="text-sm text-muted-foreground">Adicione outros caçadores para comparar seu progresso.</p>
                <button className="mt-6 rounded-xl bg-neon-blue px-6 py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-neon-blue/20 transition-all hover:scale-105 active:scale-95">
                  Convidar Amigos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
