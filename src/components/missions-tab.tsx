"use client"

import { useGame } from "@/lib/game-store"
import { useState, useEffect } from "react"
import {
  AlertTriangle,
  Swords,
  Sparkles,
  Flame,
  HeartPulse,
  Brain,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { AdBanner } from "@/components/ad-banner"

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
        .toString()
        .padStart(2, "0")
      const m = Math.floor((diff % 3600000) / 60000)
        .toString()
        .padStart(2, "0")
      const s = Math.floor((diff % 60000) / 1000)
        .toString()
        .padStart(2, "0")
      setTimeLeft(`${h}:${m}:${s}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1">
      {timeLeft.split(":").map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-md bg-neon-red/10 px-2 py-1 font-mono text-xl font-bold neon-text-red min-w-[2.5rem] text-center">
            {seg}
          </span>
          {i < 2 && <span className="font-mono text-sm text-neon-red/40">:</span>}
        </div>
      ))}
    </div>
  )
}

const CATEGORY_ICONS = {
  saude: HeartPulse,
  mente: Brain,
  estetica: Eye,
}

const CATEGORY_LABELS: Record<string, string> = {
  saude: "Saude",
  mente: "Mente",
  estetica: "Estetica",
}

const CATEGORY_COLORS: Record<string, { active: string; icon: string }> = {
  saude: { active: "bg-neon-red/15 text-neon-red neon-border-red border", icon: "text-neon-red" },
  mente: { active: "bg-neon-blue/15 text-neon-blue neon-border-blue border", icon: "text-neon-blue" },
  estetica: { active: "bg-neon-gold/15 text-neon-gold neon-border-gold border", icon: "text-neon-gold" },
}

export function MissionsTab({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const {
    dailyTasks,
    sideQuests,
    systemMissions,
    toggleDailyTask,
    completeSideQuest,
    completeSystemMission,
    dailyRewardClaimed,
    allDailyDone,
    allSideQuestsDone,
    streak,
  } = useGame()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showDailyDetails, setShowDailyDetails] = useState<string | null>(null)

  const completedCount = (dailyTasks || []).filter((t) => t.completed).length
  const totalCount = (dailyTasks || []).length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const completedSideQuests = (sideQuests || []).filter((q) => q.completed).length

  const categories = ["saude", "mente", "estetica"]
  const filteredQuests = selectedCategory
    ? (sideQuests || []).filter((q) => q.category === selectedCategory)
    : (sideQuests || [])

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black text-foreground uppercase tracking-tight">Missoes</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-neon-gold/10 px-3 py-1.5 border border-neon-gold/20">
            <Flame className="h-4 w-4 text-neon-gold" />
            <span className="font-mono text-xs font-bold neon-text-gold">{streak} dias</span>
          </div>
        )}
      </div>

      {/* Timer / Completed state */}
      {!allDailyDone ? (
        <div className="glass-panel rounded-2xl border neon-border-red p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-neon-red" />
            <span className="font-mono text-xs font-bold animate-pulse-glow text-neon-red uppercase tracking-wider">
              Tempo para Falha
            </span>
          </div>
          <div className="flex justify-center">
            <CountdownTimer />
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border neon-border-gold p-5">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-neon-gold" />
              <span className="font-mono text-sm font-bold neon-text-gold">
                Despertar Completo!
              </span>
              <Sparkles className="h-5 w-5 text-neon-gold" />
            </div>
            {streak > 0 && (
              <span className="font-mono text-xs text-neon-gold/60">
                Ofensiva de {streak} {streak === 1 ? "dia" : "dias"} mantida
              </span>
            )}
          </div>
        </div>
      )}

      {/* Daily Quests */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-neon-red" />
            <h2 className="font-mono text-sm font-bold text-neon-red">
              Missoes Obrigatorias
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            +100 XP +50 Gold
          </span>
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          {(dailyTasks || []).map((task) => (
            <div key={task.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => !dailyRewardClaimed && toggleDailyTask(task.id)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !dailyRewardClaimed) {
                    e.preventDefault()
                    toggleDailyTask(task.id)
                  }
                }}
                aria-disabled={dailyRewardClaimed}
                className={`flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-all hover:bg-secondary/60 w-full text-left active:scale-[0.98] ${dailyRewardClaimed ? "cursor-default" : "cursor-pointer"}`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                    task.completed
                      ? "border-neon-red bg-neon-red"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {task.completed && (
                    <Check className="h-3.5 w-3.5 text-[#050505]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-mono text-sm font-semibold block transition-all ${
                      task.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {task.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDailyDetails(showDailyDetails === task.id ? null : task.id)
                  }}
                  className="shrink-0 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Detalhes"
                >
                  {showDailyDetails === task.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              {showDailyDetails === task.id && (
                <div className="ml-9 mt-1 mb-1 px-3 py-2 rounded-lg bg-secondary/20 animate-slide-up">
                  <span className="font-sans text-xs text-muted-foreground leading-relaxed">
                    {task.description}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Progresso
            </span>
            <span className="font-mono text-xs text-neon-red/80">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #CC0029, #FF0033)",
                boxShadow: "0 0 10px rgba(255, 0, 51, 0.4)",
              }}
            />
          </div>
        </div>

        {dailyRewardClaimed && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-neon-red/5 border border-neon-red/20 p-2.5">
            <Check className="h-4 w-4 text-neon-red" />
            <span className="font-mono text-xs text-neon-red">
              Recompensa coletada!
            </span>
          </div>
        )}
      </div>

      {/* System Missions */}
      {systemMissions && systemMissions.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border neon-border-gold">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-gold" />
              <h2 className="font-mono text-sm font-bold text-neon-gold">
                Missões do Sistema
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {systemMissions.map((quest) => (
              <div
                key={quest.id}
                className={`glass-panel rounded-2xl p-4 transition-all ${
                  quest.completed ? "opacity-35" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    quest.completed ? "bg-secondary/50" : "bg-neon-gold/10"
                  }`}>
                    <Sparkles className={`h-5 w-5 ${quest.completed ? "text-muted-foreground" : "text-neon-gold"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-mono text-sm font-semibold block ${
                        quest.completed ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {quest.title}
                    </span>
                    <span className="font-sans text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                      {quest.description}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-neon-blue/70">+{quest.reward_xp} XP</span>
                      <span className="font-mono text-[10px] text-neon-gold/70">+{quest.reward_gold} Gold</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => completeSystemMission(quest.id)}
                    disabled={quest.completed}
                    className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      quest.completed
                        ? "bg-secondary/30 cursor-default"
                        : "bg-neon-gold/10 hover:bg-neon-gold/20 active:scale-90"
                    }`}
                    style={
                      !quest.completed
                        ? { boxShadow: "0 0 10px rgba(255, 215, 0, 0.1)" }
                        : undefined
                    }
                    aria-label={quest.completed ? "Concluido" : "Concluir missao"}
                  >
                    <Check className={`h-5 w-5 ${quest.completed ? "text-muted-foreground/40" : "text-neon-gold"}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side Quests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-sm font-bold text-foreground">
            Missoes do Dia
          </h2>
          <span className="font-mono text-[10px] text-muted-foreground">
            {completedSideQuests}/{(sideQuests || []).length}
          </span>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all ${
              selectedCategory === null
                ? "bg-foreground/10 text-foreground border border-foreground/20"
                : "bg-secondary/30 text-muted-foreground"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]
            const doneCount = (sideQuests || []).filter((q) => q.category === cat && q.completed).length
            const totalCat = (sideQuests || []).filter((q) => q.category === cat).length
            if (totalCat === 0) return null
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? CATEGORY_COLORS[cat].active
                    : "bg-secondary/30 text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {CATEGORY_LABELS[cat]}
                <span className="opacity-50">{doneCount}/{totalCat}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredQuests.map((quest) => {
            const CatIcon = CATEGORY_ICONS[quest.category as keyof typeof CATEGORY_ICONS]
            const catColor = CATEGORY_COLORS[quest.category]
            return (
              <div
                key={quest.id}
                className={`glass-panel rounded-2xl p-4 transition-all ${
                  quest.completed ? "opacity-35" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    quest.completed ? "bg-secondary/50" : "bg-secondary/60"
                  }`}>
                    <CatIcon className={`h-5 w-5 ${quest.completed ? "text-muted-foreground" : catColor.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-mono text-sm font-semibold block ${
                        quest.completed ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {quest.label}
                    </span>
                    <span className="font-sans text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                      {quest.description}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-neon-blue/70">+{quest.xp} XP</span>
                      <span className="font-mono text-[10px] text-neon-gold/70">+{quest.gold} Gold</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => completeSideQuest(quest.id)}
                    disabled={quest.completed}
                    className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      quest.completed
                        ? "bg-secondary/30 cursor-default"
                        : "bg-neon-blue/10 hover:bg-neon-blue/20 active:scale-90"
                    }`}
                    style={
                      !quest.completed
                        ? { boxShadow: "0 0 10px rgba(0,229,255,0.1)" }
                        : undefined
                    }
                    aria-label={quest.completed ? "Concluido" : "Concluir missao"}
                  >
                    <Check className={`h-5 w-5 ${quest.completed ? "text-muted-foreground/40" : "text-neon-blue"}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {allSideQuestsDone && (
          <div className="mt-4 glass-panel rounded-2xl border neon-border-blue p-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-blue" />
              <span className="font-mono text-sm font-bold neon-text-blue">
                Todas as missoes do dia concluidas!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ad Banner for Free users */}
      <AdBanner onUpgradeClick={onUpgradeClick} />
    </div>
  )
}
