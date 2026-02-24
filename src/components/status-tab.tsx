"use client"

import { useGame, getRank, getNextRank, THEME_COLORS } from "@/lib/game-store"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"
import { Shield, Zap, Flame, Crown, Swords, Coins, Target, Lock } from "lucide-react"

export function StatusTab({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const {
    playerName,
    playerClass,
    level,
    xp,
    hp,
    maxHp,
    mp,
    maxMp,
    attributes,
    streak,
    gold,
    dailyTasks,
    sideQuests,
    dailyRewardClaimed,
    isPremium,
    themeColor,
  } = useGame()

  // Determine accent color based on premium theme
  const activeTheme = THEME_COLORS.find((t) => t.id === themeColor) ?? THEME_COLORS[0]
  const accentHex = isPremium ? activeTheme.hex : "#00E5FF"

  const xpForCurrentLevel = (level - 1) * 200
  const xpForNextLevel = level * 200
  const xpProgress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100

  const currentRank = getRank(level)
  const nextRank = getNextRank(level)

  const radarData = [
    { stat: "FOR", value: attributes.FOR },
    { stat: "AGI", value: attributes.AGI },
    { stat: "VIT", value: attributes.VIT },
    { stat: "INT", value: attributes.INT },
    { stat: "PER", value: attributes.PER },
  ]

  const rankColorMap = {
    blue: { text: "text-neon-blue", neon: "neon-text-blue", border: "neon-border-blue", bg: "bg-neon-blue/10" },
    red: { text: "text-neon-red", neon: "neon-text-red", border: "neon-border-red", bg: "bg-neon-red/10" },
    gold: { text: "text-neon-gold", neon: "neon-text-gold", border: "neon-border-gold", bg: "bg-neon-gold/10" },
  }
  const rc = rankColorMap[currentRank.color]

  const dailyDone = (dailyTasks || []).filter((t) => t.completed).length
  const sideDone = (sideQuests || []).filter((q) => q.completed).length

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28 animate-slide-up">
      {/* Player Card */}
      <div className={`glass-panel rounded-2xl p-5 border ${rc.border}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="flex h-18 w-18 items-center justify-center rounded-2xl border-2"
              style={{
                borderColor: accentHex,
                background: `${accentHex}10`,
              }}
            >
              <span className="font-display text-4xl font-black" style={{ color: accentHex }}>
                {(playerName || "J").charAt(0).toUpperCase()}
              </span>
            </div>
            <div
              className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: accentHex }}
            >
              <span className="font-mono text-xs font-bold text-[#050505]">
                {level}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h1 className="font-display text-xl font-black text-foreground truncate">
              {playerName}
            </h1>
            <span className="font-mono text-xs" style={{ color: `${accentHex}B3` }}>
              {isPremium ? playerClass : "Novato"}
            </span>
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1 self-start rounded-lg px-2 py-0.5 ${rc.bg}`}>
                <Crown className={`h-3 w-3 ${rc.text}`} />
                <span className={`font-mono text-[10px] font-bold ${rc.text}`}>
                  {currentRank.title}
                </span>
              </div>
              {isPremium && (
                <div
                  className="inline-flex items-center gap-1 self-start rounded-lg px-2 py-0.5"
                  style={{ background: "rgba(255,215,0,0.1)" }}
                >
                  <Crown className="h-2.5 w-2.5 text-neon-gold" />
                  <span className="font-mono text-[9px] font-bold text-neon-gold">PREMIUM</span>
                </div>
              )}
            </div>
          </div>
          {streak > 0 && (
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <Flame className="h-6 w-6 text-neon-gold" />
              <span className="font-mono text-sm font-bold neon-text-gold">{streak}</span>
              <span className="font-mono text-[8px] text-neon-gold/50 uppercase">Dias</span>
            </div>
          )}
        </div>

        {/* Free user upgrade hint */}
        {!isPremium && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-2 transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255, 215, 0, 0.04)",
              border: "1px solid rgba(255, 215, 0, 0.12)",
            }}
          >
            <Lock className="h-3 w-3" style={{ color: "#7a7a82" }} />
            <span className="font-mono text-[10px] font-bold" style={{ color: "#7a7a82" }}>
              Desbloqueie cores e titulos com o Rank S
            </span>
            <Crown className="h-3 w-3 text-neon-gold/50" />
          </button>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="flex gap-2.5">
        <div className="glass-panel flex-1 rounded-2xl p-3 flex flex-col items-center gap-1">
          <Coins className="h-4 w-4 text-neon-gold" />
          <span className="font-mono text-lg font-bold text-foreground">{gold}</span>
          <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Gold</span>
        </div>
        <div className="glass-panel flex-1 rounded-2xl p-3 flex flex-col items-center gap-1">
          <Swords className="h-4 w-4 text-neon-red" />
          <span className="font-mono text-lg font-bold text-foreground">{dailyDone}/{(dailyTasks || []).length}</span>
          <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Diarias</span>
        </div>
        <div className="glass-panel flex-1 rounded-2xl p-3 flex flex-col items-center gap-1">
          <Target className="h-4 w-4 text-neon-blue" />
          <span className="font-mono text-lg font-bold text-foreground">{sideDone}/{(sideQuests || []).length}</span>
          <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">Missoes</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Experiencia</span>
          <span className="font-mono text-xs neon-text-blue">
            {xp - xpForCurrentLevel} / {xpForNextLevel - xpForCurrentLevel} XP
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(xpProgress, 100)}%`,
              background: "linear-gradient(90deg, #00B8D4, #00E5FF)",
              boxShadow: "0 0 12px rgba(0, 229, 255, 0.5)",
            }}
          />
        </div>
        {nextRank && (
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[10px] text-muted-foreground">
              LVL {level}
            </span>
            <span className="font-mono text-[10px] text-neon-gold/60">
              Proximo Rank: LVL {nextRank.minLevel}
            </span>
          </div>
        )}
      </div>

      {/* HP and MP Bars */}
      <div className="flex gap-2.5">
        <div className="glass-panel flex-1 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Shield className="h-4 w-4 text-neon-red" />
            <span className="font-mono text-xs font-bold text-neon-red">HP</span>
            <span className="font-mono text-[10px] text-muted-foreground ml-auto">
              {hp}/{maxHp}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(hp / maxHp) * 100}%`,
                background: "linear-gradient(90deg, #CC0029, #FF0033)",
                boxShadow: "0 0 8px rgba(255, 0, 51, 0.5)",
              }}
            />
          </div>
        </div>
        <div className="glass-panel flex-1 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="h-4 w-4 text-neon-blue" />
            <span className="font-mono text-xs font-bold text-neon-blue">MP</span>
            <span className="font-mono text-[10px] text-muted-foreground ml-auto">
              {mp}/{maxMp}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(mp / maxMp) * 100}%`,
                background: "linear-gradient(90deg, #0091EA, #00B0FF)",
                boxShadow: "0 0 8px rgba(0, 176, 255, 0.5)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="glass-panel rounded-2xl p-5 border neon-border-blue">
        <h2 className="mb-1 text-center font-mono text-xs font-bold uppercase tracking-[0.15em] neon-text-blue">
          Atributos do Cacador
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
            <PolarGrid stroke="rgba(0,229,255,0.12)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: "#00E5FF", fontSize: 11, fontFamily: "monospace" }}
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="#00E5FF"
              fill="rgba(0,229,255,0.12)"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-1">
          {radarData.map((d) => (
            <div key={d.stat} className="flex flex-col items-center">
              <span className="font-mono text-lg font-bold text-foreground">{d.value}</span>
              <span className="font-mono text-[9px] text-neon-blue/60 uppercase">{d.stat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
