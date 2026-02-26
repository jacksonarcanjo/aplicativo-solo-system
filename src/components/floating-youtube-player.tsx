"use client"

import { useState, useRef, useEffect } from "react"
import { useGame } from "@/lib/game-store"
import { 
  Youtube, 
  X, 
  Minimize2, 
  Maximize2, 
  Play, 
  Pause, 
  ExternalLink,
  Move,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { cn } from "@/lib/utils"

interface FloatingYoutubePlayerProps {
  onUpgradeClick: () => void
}

export function FloatingYoutubePlayer({ onUpgradeClick }: FloatingYoutubePlayerProps) {
  const { isPremium, setMusicPlaying } = useGame()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [url, setUrl] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleLoad = () => {
    const id = extractVideoId(url)
    if (id) {
      setVideoId(id)
      setIsMinimized(false)
      setMusicPlaying(false)
    }
  }

  if (!isOpen && !videoId) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/20 transition-all hover:scale-110 active:scale-95"
      >
        <Youtube className="h-6 w-6" />
      </button>
    )
  }

  return (
    <AnimatePresence>
      {(isOpen || videoId) && (
        <motion.div
          drag
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            width: isMinimized ? 180 : (isPremium ? 320 : 280),
            height: isMinimized ? 48 : (isPremium ? 220 : 180)
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            "fixed bottom-24 right-6 z-[60] overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl transition-all duration-300",
            isDragging && "cursor-grabbing"
          )}
        >
          {/* Header/Drag Handle */}
          <div className="flex h-12 items-center justify-between bg-white/5 px-3">
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {isMinimized ? "YouTube" : "Player Flutuante"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-white"
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false)
                  setVideoId(null)
                  setUrl("")
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={cn("p-3", isMinimized && "hidden")}>
            {!videoId ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Cole o link do YouTube..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white placeholder:text-muted-foreground focus:border-rose-500 focus:outline-none"
                />
                <button
                  onClick={handleLoad}
                  className="w-full rounded-lg bg-rose-600 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-600/20"
                >
                  Carregar Vídeo
                </button>
                {!isPremium && (
                  <p className="text-center text-[8px] text-muted-foreground">
                    Upgrade para player maior e sem anúncios
                  </p>
                )}
              </div>
            ) : (
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video"
                />
              </div>
            )}
          </div>

          {/* Premium Badge */}
          {isPremium && !isMinimized && (
            <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-yellow-500 backdrop-blur-md">
              Premium
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
