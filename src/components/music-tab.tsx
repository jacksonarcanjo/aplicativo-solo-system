"use client"

import { useState, useRef, useEffect } from "react"
import { useGame } from "@/lib/game-store"
import { PremiumOverlay } from "./premium-overlay"

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Music, 
  Radio, 
  ExternalLink,
  Search,
  MoreVertical,
  Heart,
  RotateCw
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

const INITIAL_PLAYLIST = [
  { id: 1, title: "Dark Aria", artist: "SawanoHiroyuki[nZk]:XAI", duration: "3:45", cover: "https://img.youtube.com/vi/ZGXOWPZ64DA/0.jpg", youtubeId: "ZGXOWPZ64DA" },
  { id: 2, title: "LEveL", artist: "SawanoHiroyuki[nZk]:TXT", duration: "3:30", cover: "https://img.youtube.com/vi/5Ff8Ou95l8Y/0.jpg", youtubeId: "5Ff8Ou95l8Y" },
  { id: 3, title: "Request", artist: "Krage", duration: "3:40", cover: "https://img.youtube.com/vi/46aI3_Shbak/0.jpg", youtubeId: "46aI3_Shbak" },
  { id: 4, title: "Everywhere", artist: "SawanoHiroyuki[nZk]:ReoNa", duration: "4:10", cover: "https://img.youtube.com/vi/853FzBp3O1A/0.jpg", youtubeId: "853FzBp3O1A" },
  { id: 5, title: "Dark Aria <LV2>", artist: "SawanoHiroyuki[nZk]:XAI", duration: "4:00", cover: "https://img.youtube.com/vi/EofsoI_VCIo/0.jpg", youtubeId: "EofsoI_VCIo" },
]

export function MusicTab({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const { musicPlaying, setMusicPlaying, currentTrack, setCurrentTrack, isPremium } = useGame()
  const [playlist, setPlaylist] = useState(INITIAL_PLAYLIST)
  const [ytUrl, setYtUrl] = useState("")
  const [showYtInput, setShowYtInput] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  
  // Use refs for state accessed inside YouTube callbacks to avoid stale closures
  const stateRefs = useRef({
    isRepeat,
    isShuffle,
    currentTrack,
    playlist,
    musicPlaying
  })

  useEffect(() => {
    stateRefs.current = { isRepeat, isShuffle, currentTrack, playlist, musicPlaying }
  }, [isRepeat, isShuffle, currentTrack, playlist, musicPlaying])

  const activeTrack = playlist[currentTrack] || playlist[0]

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const nextTrack = () => {
    const { isShuffle, currentTrack, playlist } = stateRefs.current
    let next = 0
    if (isShuffle) {
      next = Math.floor(Math.random() * playlist.length)
    } else {
      next = (currentTrack + 1) % playlist.length
    }
    setCurrentTrack(next)
    if (playerRef.current && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById({videoId: playlist[next].youtubeId})
      } catch (e) {
        console.error("Error loading next track:", e)
      }
    }
  }

  const prevTrack = () => {
    const { currentTrack, playlist } = stateRefs.current
    const prev = (currentTrack - 1 + playlist.length) % playlist.length
    setCurrentTrack(prev)
    if (playerRef.current && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById({videoId: playlist[prev].youtubeId})
      } catch (e) {
        console.error("Error loading prev track:", e)
      }
    }
  }

  const initPlayer = () => {
    if (playerRef.current || !playerContainerRef.current) return

    // Ensure window.YT is available
    if (!window.YT || !window.YT.Player) {
      console.log("YT API not ready for initPlayer")
      return
    }

    try {
      console.log("Initializing YouTube Player with ID:", activeTrack.youtubeId)
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: activeTrack.youtubeId,
        playerVars: {
          autoplay: musicPlaying ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          // Remove origin if it causes issues in some environments
          // origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
        events: {
          onReady: (event: any) => {
            console.log("YouTube Player Ready")
            setPlayerReady(true)
            event.target.setVolume(isMuted ? 0 : volume)
            if (stateRefs.current.musicPlaying) {
              try {
                event.target.playVideo()
              } catch (e) {
                console.error("Autoplay failed:", e)
              }
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data)
            // Error codes: 2 (invalid param), 5 (HTML5 error), 100 (not found), 101/150 (embed not allowed)
            if (event.data === 100 || event.data === 101 || event.data === 150) {
              console.log("Video unavailable, skipping...")
              nextTrack()
            }
          },
          onStateChange: (event: any) => {
            const state = event.data
            if (state === window.YT.PlayerState.PLAYING) {
              setMusicPlaying(true)
            } else if (state === window.YT.PlayerState.PAUSED) {
              setMusicPlaying(false)
            } else if (state === window.YT.PlayerState.ENDED) {
              if (stateRefs.current.isRepeat) {
                event.target.playVideo()
              } else {
                nextTrack()
              }
            }
          }
        }
      })
    } catch (e) {
      console.error("Error initializing player:", e)
    }
  }

  // Load YouTube API
  useEffect(() => {
    if (!isPremium) return

    let checkInterval: NodeJS.Timeout

    const loadYT = () => {
      if (!window.YT) {
        console.log("Loading YouTube IFrame API...")
        const tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName('script')[0]
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        } else {
          document.head.appendChild(tag)
        }
      } else if (window.YT.Player) {
        console.log("YouTube API already loaded, initializing...")
        initPlayer()
      }

      // Check periodically if YT is ready
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval)
          initPlayer()
        }
      }, 500)

      window.onYouTubeIframeAPIReady = () => {
        console.log("onYouTubeIframeAPIReady called")
        clearInterval(checkInterval)
        initPlayer()
      }
    }

    loadYT()

    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [isPremium])

  if (!isPremium) {
    return (
      <div className="flex h-dvh flex-col bg-[#050505]">
        <PremiumOverlay 
          title="Shadow Player" 
          description="Acesse o sistema de áudio de elite. Ouça trilhas épicas e músicas do YouTube enquanto sobe de nível."
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    )
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.error("Error destroying player on unmount:", e)
        }
      }
    }
  }, [])

  // Sync volume
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

  // Sync play/pause from external state
  useEffect(() => {
    if (playerRef.current && playerRef.current.getPlayerState) {
      const state = playerRef.current.getPlayerState()
      // Use try-catch for safety
      try {
        if (musicPlaying && state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
          playerRef.current.playVideo()
        } else if (!musicPlaying && state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo()
        }
      } catch (e) {
        console.error("Error syncing player state:", e)
      }
    }
  }, [musicPlaying])

  // Update progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        try {
          const current = playerRef.current.getCurrentTime()
          const duration = playerRef.current.getDuration()
          if (duration > 0) {
            setProgress((current / duration) * 100)
            setCurrentTime(formatTime(current))
          }
        } catch (e) {
          // Ignore errors during playback
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleAddYt = async () => {
    if (!ytUrl.trim()) return

    // Check if it's a YouTube URL
    const id = extractVideoId(ytUrl)
    if (id) {
      addTrackById(id)
      return
    }

    // Otherwise, treat as a search query
    const query = ytUrl.toLowerCase()
    
    // 1. Search within the current playlist first
    const foundIndex = playlist.findIndex(track => 
      track.title.toLowerCase().includes(query) || 
      track.artist.toLowerCase().includes(query)
    )

    if (foundIndex !== -1) {
      playTrackIndex(foundIndex)
      setYtUrl("")
      setShowYtInput(false)
      return
    }

    // 2. Search YouTube via public API (Invidious)
    try {
      setYtUrl("Pesquisando...")
      // Try multiple instances as fallbacks
      const instances = [
        'https://inv.tux.pizza',
        'https://invidious.io.lol',
        'https://iv.melmac.space',
        'https://invidious.projectsegfau.lt',
        'https://invidious.privacydev.net',
        'https://iv.ggtyler.dev'
      ]
      
      let searchData = null
      for (const instance of instances) {
        try {
          const response = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`)
          if (response.ok) {
            searchData = await response.json()
            if (searchData && searchData.length > 0) break
          }
        } catch (e) {
          continue
        }
      }

      if (searchData && searchData.length > 0) {
        const video = searchData[0]
        const newTrack = {
          id: Date.now(),
          title: video.title,
          artist: video.author,
          duration: formatTime(video.lengthSeconds),
          cover: video.videoThumbnails?.find((t: any) => t.quality === 'high')?.url || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
          youtubeId: video.videoId
        }
        
        setPlaylist(prev => [newTrack, ...prev])
        setCurrentTrack(0)
        setMusicPlaying(true)
        
        if (playerRef.current && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById({videoId: video.videoId})
        }
        
        setYtUrl("")
        setShowYtInput(false)
      } else {
        alert("Nenhuma música encontrada no YouTube.")
        setYtUrl(query)
      }
    } catch (error) {
      console.error("Search error:", error)
      alert("Erro ao pesquisar no YouTube. Tente um link direto.")
      setYtUrl(query)
    }
  }

  const addTrackById = (id: string) => {
    const newTrack = {
      id: Date.now(),
      title: "YouTube Track",
      artist: "YouTube",
      duration: "??:??",
      cover: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      youtubeId: id
    }
    setPlaylist(prev => [newTrack, ...prev])
    setCurrentTrack(0)
    setMusicPlaying(true)
    if (playerRef.current && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById({videoId: id})
      } catch (e) {
        console.error("Error loading YT track:", e)
      }
    }
    setYtUrl("")
    setShowYtInput(false)
  }

  const playTrackIndex = (index: number) => {
    setCurrentTrack(index)
    setMusicPlaying(true)
    if (playerRef.current && playerRef.current.loadVideoById) {
      try {
        playerRef.current.loadVideoById({videoId: playlist[index].youtubeId})
      } catch (e) {
        console.error("Error loading track:", e)
      }
    }
  }

  const togglePlay = () => {
    if (!playerRef.current) {
      initPlayer()
      setMusicPlaying(true)
      return
    }

    if (playerRef.current && playerRef.current.getPlayerState) {
      try {
        const state = playerRef.current.getPlayerState()
        if (state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo()
          setMusicPlaying(false)
        } else {
          playerRef.current.playVideo()
          setMusicPlaying(true)
        }
      } catch (e) {
        console.error("Error toggling play:", e)
        // Fallback
        setMusicPlaying(!musicPlaying)
      }
    } else {
      setMusicPlaying(!musicPlaying)
    }
  }

  const reloadPlayer = () => {
    if (playerRef.current && playerRef.current.destroy) {
      try {
        playerRef.current.destroy()
      } catch (e) {
        console.error("Error destroying player:", e)
      }
    }
    playerRef.current = null
    setPlayerReady(false)
    // Small delay to ensure DOM is ready
    setTimeout(initPlayer, 100)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#050505] pb-24 text-white selection:bg-neon-blue selection:text-black">
      {/* Immersive Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 blur-3xl transition-all duration-1000"
          style={{ backgroundImage: `url(${activeTrack.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-[#050505]" />
      </div>

      {/* Header */}
      <header className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-blue/10 text-neon-blue shadow-[0_0_20px_rgba(0,229,255,0.1)]">
              <Music className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tighter">
                Shadow Player
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-blue/60">
                Sistema de Áudio de Elite
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={reloadPlayer}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
              title="Recarregar Player"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowYtInput(!showYtInput)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                showYtInput ? "bg-neon-blue text-black" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
              title="Pesquisar Música"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showYtInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="mt-6 overflow-hidden"
            >
              <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
                <input 
                  type="text"
                  placeholder="Nome da música ou link do YouTube..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddYt()}
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/20"
                  autoFocus
                />
                <button 
                  onClick={handleAddYt}
                  className="rounded-xl bg-neon-blue px-6 py-2 text-xs font-black uppercase tracking-widest text-black transition-transform active:scale-95"
                >
                  Buscar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex flex-1 flex-col px-8">
        {/* Active Track Card */}
        <div className="group relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-black shadow-2xl transition-all duration-500 hover:border-neon-blue/30">
          <div className="h-full w-full">
            <div ref={playerContainerRef} className="h-full w-full" />
          </div>
          
          {/* Overlay when not playing or loading */}
          {(!musicPlaying || !playerReady) && (
            <div 
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl cursor-pointer"
              onClick={togglePlay}
            >
              <motion.div
                animate={musicPlaying ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative h-full w-full overflow-hidden"
              >
                <img 
                  src={activeTrack.cover.replace('0.jpg', 'hqdefault.jpg')} 
                  alt={activeTrack.title}
                  className="h-full w-full object-cover opacity-40 grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {!playerReady ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="h-16 w-16 animate-spin rounded-full border-2 border-neon-blue/20 border-t-neon-blue" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-8 w-8 animate-pulse rounded-full bg-neon-blue/20" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue animate-pulse">
                          Sincronizando
                        </p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            reloadPlayer();
                          }}
                          className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          Recarregar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20">
                        <Play className="h-10 w-10 fill-white" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Toque para Iniciar</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <motion.h2 
            key={activeTrack.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black tracking-tighter text-white"
          >
            {activeTrack.title}
          </motion.h2>
          <motion.p 
            key={activeTrack.artist}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm font-bold uppercase tracking-widest text-neon-blue"
          >
            {activeTrack.artist}
          </motion.p>
        </div>

        {/* Controls */}
        <div className="mt-10 space-y-8">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/5">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-neon-blue shadow-[0_0_15px_#00E5FF]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-white/10" />
            </div>
            <div className="flex justify-between font-mono text-[10px] font-bold tracking-widest text-white/30">
              <span>{currentTime}</span>
              <span>{activeTrack.duration}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                isShuffle ? "bg-neon-blue/10 text-neon-blue" : "text-white/20 hover:text-white/60"
              )}
            >
              <Shuffle className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-10">
              <button onClick={prevTrack} className="text-white/40 transition-all hover:scale-110 hover:text-white">
                <SkipBack className="h-10 w-10 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl shadow-white/10 transition-all hover:scale-105 active:scale-95"
              >
                {musicPlaying ? (
                  <Pause className="h-10 w-10 fill-current" />
                ) : (
                  <Play className="h-10 w-10 translate-x-1 fill-current" />
                )}
              </button>
              
              <button onClick={nextTrack} className="text-white/40 transition-all hover:scale-110 hover:text-white">
                <SkipForward className="h-10 w-10 fill-current" />
              </button>
            </div>

            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all",
                isRepeat ? "bg-neon-blue/10 text-neon-blue" : "text-white/20 hover:text-white/60"
              )}
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* Volume & Extra */}
          <div className="flex items-center gap-6 rounded-[2rem] border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-white/40 transition-colors hover:text-white"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </button>
            <div className="relative flex-1">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-neon-blue"
              />
            </div>
            <button 
              onClick={() => window.open(`https://www.youtube.com/watch?v=${activeTrack.youtubeId}`, '_blank')}
              className="text-white/20 transition-colors hover:text-neon-blue"
              title="Abrir no YouTube"
            >
              <ExternalLink className="h-6 w-6" />
            </button>
            <button className="text-white/20 transition-colors hover:text-rose-500">
              <Heart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="mt-12 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Próximas Faixas</h3>
            <div className="h-px flex-1 mx-6 bg-white/5" />
            <button className="text-[10px] font-black uppercase tracking-widest text-neon-blue hover:text-white transition-colors">Ver Tudo</button>
          </div>
          
          <div className="space-y-3">
            {playlist.map((track, i) => (
              <button
                key={track.id}
                onClick={() => playTrackIndex(i)}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl p-4 transition-all duration-300",
                  currentTrack === i 
                    ? "bg-neon-blue/10 border border-neon-blue/20" 
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
                  <img 
                    src={track.cover} 
                    alt="" 
                    className={cn(
                      "h-full w-full object-cover transition-all duration-500",
                      currentTrack === i ? "scale-110" : "grayscale group-hover:grayscale-0"
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                  {currentTrack === i && musicPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="flex items-end gap-1 h-4">
                        <div className="w-1 bg-neon-blue animate-music-bar-1 rounded-full" />
                        <div className="w-1 bg-neon-blue animate-music-bar-2 rounded-full" />
                        <div className="w-1 bg-neon-blue animate-music-bar-3 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={cn(
                    "text-sm font-bold transition-colors",
                    currentTrack === i ? "text-white" : "text-white/60 group-hover:text-white"
                  )}>
                    {track.title}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {track.artist}
                  </p>
                </div>
                <div className="text-[10px] font-mono font-bold text-white/20">
                  {track.duration}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
