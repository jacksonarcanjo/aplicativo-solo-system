"use client"

import { useState, useEffect } from "react"
import { useGame, getRank, type GameState } from "@/lib/game-store"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase-config"
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  where,
  doc,
  getDoc
} from "firebase/firestore"
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Search, 
  Shield, 
  Flame, 
  Star,
  ChevronRight,
  Crown,
  Check,
  X,
  UserMinus,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

export function GuildTab() {
  const { 
    playerName, 
    level, 
    xp, 
    streak, 
    friends, 
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend 
  } = useGame()
  const { user: currentUser } = useAuth()
  
  const [activeSubTab, setActiveSubTab] = useState<"ranking" | "friends">("ranking")
  const [searchQuery, setSearchQuery] = useState("")
  const [globalRanking, setGlobalRanking] = useState<any[]>([])
  const [friendDetails, setFriendDetails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  // Load Global Ranking
  useEffect(() => {
    let mounted = true
    const loadRanking = async () => {
      try {
        // Fallback to local user if permission denied
        setGlobalRanking([{
          id: currentUser?.uid || "local",
          playerName: playerName || "Jogador",
          level: level || 1,
          xp: xp || 0,
          streak: streak || 0
        }])
      } catch (error) {
        console.error("Error loading global ranking:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadRanking()

    return () => {
      mounted = false
    }
  }, [currentUser?.uid, playerName, level, xp, streak])

  // Load Friend Details
  useEffect(() => {
    if (!friends || friends.length === 0) {
      setFriendDetails([])
      return
    }

    const loadFriends = async () => {
      try {
        const details = await Promise.all(
          friends.map(async (friendId) => {
            try {
              const docRef = doc(db, "users", friendId)
              const docSnap = await getDoc(docRef)
              if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() }
              }
            } catch (err) {
              console.error(`Error loading friend ${friendId}:`, err)
            }
            return null
          })
        )
        setFriendDetails(details.filter(d => d !== null))
      } catch (error) {
        console.error("Error loading friends list:", error)
      }
    }

    loadFriends()
  }, [friends])

  const handleAddFriend = async () => {
    if (!searchQuery.trim()) return
    setIsAdding(true)
    await sendFriendRequest(searchQuery.trim())
    setSearchQuery("")
    setIsAdding(false)
  }

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
            <div className="relative">
              <UserPlus className="h-4 w-4" />
              {friendRequests.length > 0 && (
                <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_5px_#f43f5e]" />
              )}
            </div>
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
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Carregando Ranking...</p>
                </div>
              ) : (
                globalRanking.map((u, index) => {
                  const isMe = u.id === currentUser?.uid
                  const rank = getRank(u.level)
                  return (
                    <div
                      key={u.id}
                      className={cn(
                        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition-all",
                        isMe 
                          ? "border-neon-blue/50 bg-neon-blue/10 shadow-[0_0_20px_rgba(0,229,255,0.1)]" 
                          : "border-white/5 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-lg font-black italic text-muted-foreground">
                        {index + 1}
                      </div>

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10 border border-white/5">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.playerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white/20">
                            {rank.icon}
                          </div>
                        )}
                        {index === 0 && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-yellow-500 p-1 shadow-lg">
                            <Crown className="h-3 w-3 text-black" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={cn(
                            "font-bold truncate",
                            isMe ? "text-neon-blue" : "text-white"
                          )}>
                            {u.playerName}
                          </h3>
                          {isMe && (
                            <span className="rounded-full bg-neon-blue/20 px-2 py-0.5 text-[8px] font-black uppercase text-neon-blue">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Star className="h-3 w-3 text-neon-blue" />
                            <span>LVL {u.level}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{u.streak}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="font-mono text-sm font-bold text-white">
                            {(u.xp || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            XP
                          </p>
                        </div>
                        
                        {!isMe && !friends?.includes(u.id) && (
                          <button
                            onClick={() => sendFriendRequest(u.email)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-neon-blue/20 hover:text-neon-blue transition-all"
                            title="Adicionar Amigo"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
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
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="E-mail do caçador..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue"
                  />
                </div>
                <button 
                  onClick={handleAddFriend}
                  disabled={isAdding || !searchQuery.trim()}
                  className="rounded-2xl bg-neon-blue px-6 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-neon-blue/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </button>
              </div>

              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pedidos Pendentes</h3>
                  {friendRequests.map((req) => (
                    <div key={req.from} className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                          <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{req.fromName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Quer ser seu amigo</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => acceptFriendRequest(req.from)}
                          className="rounded-lg bg-emerald-500 p-2 text-black hover:bg-emerald-400 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => declineFriendRequest(req.from)}
                          className="rounded-lg bg-rose-500 p-2 text-white hover:bg-rose-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sua Guilda ({friendDetails.length})</h3>
                {friendDetails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-white/5 p-6 text-muted-foreground">
                      <Users className="h-10 w-10 opacity-20" />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Nenhum aliado ainda</p>
                  </div>
                ) : (
                  friendDetails.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-white/10 border border-white/5">
                          {f.avatarUrl ? (
                            <img src={f.avatarUrl} alt={f.playerName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-black text-white/20">
                              {getRank(f.level).icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{f.playerName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                            <Star className="h-3 w-3 text-neon-blue" />
                            <span>LVL {f.level}</span>
                            <span>•</span>
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{f.streak}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFriend(f.id)}
                        className="rounded-lg bg-white/5 p-2 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

