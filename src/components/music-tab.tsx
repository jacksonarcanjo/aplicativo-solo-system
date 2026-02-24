"use client"

import { useState, useRef, useEffect } from "react"
import { useGame } from "@/lib/game-store"

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
  Plus,
  MoreVertical,
  Heart
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

export function MusicTab() {
  const { musicPlaying, setMusicPlaying, currentTrack, setCurrentTrack } = useGame()
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
      playerRef.current.loadVideoById(playlist[next].youtubeId)
      if (stateRefs.current.musicPlaying) playerRef.current.playVideo()
    }
  }

  const prevTrack = () => {
    const { currentTrack, playlist } = stateRefs.current
    const prev = (currentTrack - 1 + playlist.length) % playlist.length
    setCurrentTrack(prev)
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(playlist[prev].youtubeId)
      if (stateRefs.current.musicPlaying) playerRef.current.playVideo()
    }
  }

  // Load YouTube API
  useEffect(() => {
    let checkInterval: NodeJS.Timeout

    const loadYT = () => {
      if (!window.YT) {
        const tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      // Check periodically if YT is ready
      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval)
          initPlayer()
        }
      }, 500)

      window.onYouTubeIframeAPIReady = () => {
        clearInterval(checkInterval)
        initPlayer()
      }
    }

    loadYT()

    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [])

  const initPlayer = () => {
    if (playerRef.current || !document.getElementById('youtube-player')) return

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: activeTrack.youtubeId,
      playerVars: {
        autoplay: musicPlaying ? 1 : 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event: any) => {
          setPlayerReady(true)
          event.target.setVolume(isMuted ? 0 : volume)
          if (stateRefs.current.musicPlaying) event.target.playVideo()
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setMusicPlaying(true)
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setMusicPlaying(false)
          } else if (event.data === window.YT.PlayerState.ENDED) {
            if (stateRefs.current.isRepeat) {
              event.target.playVideo()
            } else {
              nextTrack()
            }
          }
        }
      }
    })
  }

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
      if (musicPlaying && state !== window.YT.PlayerState.PLAYING) {
        playerRef.current.playVideo()
      } else if (!musicPlaying && state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo()
      }
    }
  }, [musicPlaying])

  // Update progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const current = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()
        if (duration > 0) {
          setProgress((current / duration) * 100)
          setCurrentTime(formatTime(current))
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

  const handleAddYt = () => {
    const id = extractVideoId(ytUrl)
    if (id) {
      const newTrack = {
        id: Date.now(),
        title: "YouTube Track",
        artist: "YouTube",
        duration: "??:??",
        cover: `https://img.youtube.com/vi/${id}/0.jpg`,
        youtubeId: id
      }
      setPlaylist(prev => [newTrack, ...prev])
      setCurrentTrack(0)
      setMusicPlaying(true)
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(id)
        playerRef.current.playVideo()
      }
      setYtUrl("")
      setShowYtInput(false)
    }
  }

  const togglePlay = () => {
    if (playerRef.current && playerRef.current.getPlayerState) {
      const state = playerRef.current.getPlayerState()
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo()
        setMusicPlaying(false)
      } else {
        playerRef.current.playVideo()
        setMusicPlaying(true)
      }
    } else {
      setMusicPlaying(!musicPlaying)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/20 text-neon-blue">
              <Music className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              Player do Sistema
            </h1>
          </div>
          <button 
            onClick={() => setShowYtInput(!showYtInput)}
            className="rounded-full bg-white/5 p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {showYtInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 flex gap-2 overflow-hidden"
            >
              <input 
                type="text"
                placeholder="Link do YouTube..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-neon-blue"
              />
              <button 
                onClick={handleAddYt}
                className="rounded-lg bg-neon-blue px-4 py-2 text-[10px] font-black uppercase text-black"
              >
                Adicionar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex flex-1 flex-col px-6">
        {/* Active Track Card */}
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
          <div id="youtube-player" className={cn("h-full w-full", !playerReady && "opacity-0 pointer-events-none absolute inset-0")} />
          
          {/* Overlay when not playing or loading */}
          {(!musicPlaying || !playerReady) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
              <motion.div
                animate={musicPlaying ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative h-full w-full overflow-hidden"
              >
                <img 
                  src={activeTrack.cover} 
                  alt={activeTrack.title}
                  className="h-full w-full object-cover opacity-50"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {!playerReady ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
                      <p className="text-[10px] uppercase tracking-widest text-neon-blue animate-pulse">
                        Sincronizando...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Music className="h-12 w-12 text-white/50" />
                      <p className="text-xs font-bold uppercase tracking-widest text-white/50">Pausado</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-black tracking-tight text-white">{activeTrack.title}</h2>
          <p className="mt-1 font-bold text-neon-blue/80">{activeTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="mt-8 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-neon-blue shadow-[0_0_10px_#00E5FF]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] font-bold text-muted-foreground">
              <span>{currentTime}</span>
              <span>{activeTrack.duration}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={cn("transition-colors", isShuffle ? "text-neon-blue" : "text-muted-foreground")}
            >
              <Shuffle className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-8">
              <button onClick={prevTrack} className="text-white hover:text-neon-blue transition-colors">
                <SkipBack className="h-8 w-8 fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-xl shadow-white/10 transition-transform hover:scale-105 active:scale-95"
              >
                {musicPlaying ? (
                  <Pause className="h-8 w-8 fill-current" />
                ) : (
                  <Play className="h-8 w-8 translate-x-0.5 fill-current" />
                )}
              </button>
              
              <button onClick={nextTrack} className="text-white hover:text-neon-blue transition-colors">
                <SkipForward className="h-8 w-8 fill-current" />
              </button>
            </div>

            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={cn("transition-colors", isRepeat ? "text-neon-blue" : "text-muted-foreground")}
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* Volume & Extra */}
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
            <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-neon-blue"
            />
            <button className="text-muted-foreground">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="mt-10 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Próximas Faixas</h3>
            <button className="text-[10px] font-bold uppercase text-neon-blue">Ver Tudo</button>
          </div>
          
          <div className="space-y-2">
            {playlist.map((track, i) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrack(i)
                  setMusicPlaying(true)
                  if (playerRef.current && playerRef.current.loadVideoById) {
                    playerRef.current.loadVideoById(track.youtubeId)
                    playerRef.current.playVideo()
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl p-3 transition-all",
                  currentTrack === i ? "bg-neon-blue/10 border border-neon-blue/20" : "hover:bg-white/5"
                )}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <img src={track.cover} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  {currentTrack === i && musicPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-neon-blue animate-music-bar-1" />
                        <div className="w-0.5 bg-neon-blue animate-music-bar-2" />
                        <div className="w-0.5 bg-neon-blue animate-music-bar-3" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("text-sm font-bold", currentTrack === i ? "text-neon-blue" : "text-white")}>
                    {track.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{track.artist}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{track.duration}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
