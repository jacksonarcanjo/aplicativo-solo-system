"use client"

import { useState, useEffect } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/lib/auth-context"
import { useGame, getRank } from "@/lib/game-store"
import { Flame, MapPin, Timer, Zap, Share2, Heart, MessageCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
}

interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userLevel: number
  type: "run" | "walk" | "workout" | "study"
  title: string
  distance?: number // in meters
  duration?: number // in seconds
  steps?: number
  xpGained: number
  timestamp: string
  likes: string[] // userIds
  comments: Comment[]
}

export function ActivityFeed() {
  const { user } = useAuth()
  const { playerName, level: playerLevel } = useGame()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [expandedComments, setExpandedComments] = useState<string[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const handlePost = async () => {
    if (!postContent.trim()) return
    try {
      await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          userName: playerName,
          userAvatar: user?.photoURL,
          userLevel: playerLevel,
          type: "workout",
          title: postContent,
          xpGained: 10
        })
      })
      setPostContent("")
      setShowPostModal(false)
    } catch (error) {
      console.error("Error posting activity:", error)
    }
  }

  const handleLike = async (activityId: string) => {
    if (!user) return
    try {
      await fetch(`/api/activities/${activityId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid })
      })
    } catch (error) {
      console.error("Error liking activity:", error)
    }
  }

  const handleComment = async (activityId: string) => {
    const content = commentInputs[activityId]
    if (!content?.trim() || !user) return
    try {
      await fetch(`/api/activities/${activityId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userName: playerName,
          content: content.trim()
        })
      })
      setCommentInputs(prev => ({ ...prev, [activityId]: "" }))
    } catch (error) {
      console.error("Error commenting on activity:", error)
    }
  }

  const toggleComments = (activityId: string) => {
    setExpandedComments(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId) 
        : [...prev, activityId]
    )
  }

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/activities")
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    const socket = io(window.location.origin)
    socket.on("new_activity", (activity: Activity) => {
      setActivities((prev) => [activity, ...prev])
    })

    socket.on("activity_updated", (updatedActivity: Activity) => {
      setActivities((prev) => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const formatDistance = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(2)} km`
    return `${m} m`
  }

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sincronizando Feed...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Post Button */}
      <button
        onClick={() => setShowPostModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neon-blue/20 bg-neon-blue/5 p-4 text-xs font-black uppercase tracking-widest text-neon-blue transition-all hover:bg-neon-blue/10 active:scale-[0.98]"
      >
        <Share2 className="h-4 w-4" />
        Postar Atualização de Treino
      </button>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl"
            >
              <h3 className="mb-4 text-lg font-black uppercase tracking-tight text-white">Nova Atualização</h3>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="O que você conquistou hoje, caçador?"
                className="mb-4 h-32 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 rounded-xl bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePost}
                  disabled={!postContent.trim()}
                  className="flex-1 rounded-xl bg-neon-blue py-3 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-neon-blue/20 disabled:opacity-50"
                >
                  Postar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <Share2 className="h-12 w-12 mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">Nenhuma atividade recente</p>
          <p className="text-[10px] text-muted-foreground mt-2">Seja o primeiro a despertar!</p>
        </div>
      ) : (
        activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/10 border border-white/5">
                {activity.userAvatar ? (
                  <img src={activity.userAvatar} alt={activity.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/20">
                    {getRank(activity.userLevel).icon}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">{activity.userName}</h4>
                  <span className="rounded-full bg-neon-blue/10 px-2 py-0.5 text-[8px] font-black uppercase text-neon-blue">
                    LVL {activity.userLevel}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Activity Content */}
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">{activity.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-neon-blue uppercase tracking-widest">
                    <Zap className="h-3 w-3" />
                    <span>+{activity.xpGained} XP</span>
                  </div>
                </div>
                <div className={cn(
                  "rounded-xl p-2",
                  activity.type === "run" ? "bg-orange-500/10 text-orange-500" :
                  activity.type === "walk" ? "bg-emerald-500/10 text-emerald-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {activity.type === "run" ? <Flame className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                {activity.distance !== undefined && (
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Distância</p>
                    <p className="font-mono text-sm font-black text-white">{formatDistance(activity.distance)}</p>
                  </div>
                )}
                {activity.duration !== undefined && (
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tempo</p>
                    <p className="font-mono text-sm font-black text-white">{formatDuration(activity.duration)}</p>
                  </div>
                )}
                {activity.steps !== undefined && (
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Passos</p>
                    <p className="font-mono text-sm font-black text-white">{activity.steps}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 p-4 pt-0">
              <button 
                onClick={() => handleLike(activity.id)}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  activity.likes?.includes(user?.uid || "") ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                )}
              >
                <Heart className={cn("h-4 w-4", activity.likes?.includes(user?.uid || "") && "fill-current")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{activity.likes?.length || 0}</span>
              </button>
              <button 
                onClick={() => toggleComments(activity.id)}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  expandedComments.includes(activity.id) ? "text-neon-blue" : "text-muted-foreground hover:text-neon-blue"
                )}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{activity.comments?.length || 0}</span>
              </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {expandedComments.includes(activity.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 bg-black/20"
                >
                  <div className="p-4 space-y-3">
                    {activity.comments?.map((comment) => (
                      <div key={comment.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-white">{comment.userName}</span>
                          <span className="text-[8px] text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[activity.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [activity.id]: e.target.value }))}
                        placeholder="Escreva um comentário..."
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleComment(activity.id)
                        }}
                      />
                      <button
                        onClick={() => handleComment(activity.id)}
                        disabled={!commentInputs[activity.id]?.trim()}
                        className="rounded-lg bg-neon-blue px-3 py-2 text-[10px] font-black uppercase text-black disabled:opacity-50"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  )
}
