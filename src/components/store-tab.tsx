"use client"

import { useState } from "react"
import { useGame, STORE_ITEMS, type StoreItemDef } from "@/lib/game-store"
import { 
  Coins, 
  Package, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Clock,
  Search
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface StoreTabProps {
  onUpgradeClick: () => void
}

export function StoreTab({ onUpgradeClick }: StoreTabProps) {
  const { gold, inventory, spendGold, addToInventory, isPremium } = useGame()
  const [activeSubTab, setActiveSubTab] = useState<"buy" | "inventory">("buy")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = STORE_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePurchase = (item: StoreItemDef) => {
    if (spendGold(item.cost)) {
      addToInventory({
        id: `${item.id}_${Date.now()}`,
        name: item.name,
        icon: item.iconId,
        description: item.description
      })
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black uppercase tracking-tight text-white">
              Loja do Sistema
            </h1>
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Troque seu esforço por recompensas
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-mono text-sm font-bold text-white">{gold.toLocaleString()}</span>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setActiveSubTab("buy")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all",
              activeSubTab === "buy" 
                ? "bg-white text-black shadow-lg" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Comprar
          </button>
          <button
            onClick={() => setActiveSubTab("inventory")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all",
              activeSubTab === "inventory" 
                ? "bg-white text-black shadow-lg" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <Package className="h-4 w-4" />
            Inventário ({(inventory || []).length})
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {activeSubTab === "buy" ? (
            <motion.div
              key="buy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar itens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue"
                />
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 gap-4">
                {(filteredItems || []).map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neon-blue transition-transform group-hover:scale-110">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={gold < item.cost}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                          gold >= item.cost 
                            ? "bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30" 
                            : "bg-white/5 text-muted-foreground opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span className="text-xs font-black uppercase tracking-tighter">Comprar</span>
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-yellow-500" />
                          <span className="font-mono text-xs font-bold">{item.cost}</span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!isPremium && (
                <button
                  onClick={onUpgradeClick}
                  className="group relative w-full overflow-hidden rounded-2xl border border-neon-blue/30 bg-neon-blue/10 p-6 text-left transition-all hover:bg-neon-blue/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black uppercase tracking-tighter text-neon-blue">
                        Upgrade Premium
                      </h4>
                      <p className="text-xs text-neon-blue/70">
                        Desbloqueie itens exclusivos e remova anúncios
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-neon-blue transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {(inventory || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="rounded-full bg-white/5 p-6 text-muted-foreground">
                    <Package className="h-12 w-12" />
                  </div>
                  <h3 className="mt-4 font-bold text-white">Inventário Vazio</h3>
                  <p className="text-sm text-muted-foreground">Você ainda não adquiriu nenhuma recompensa.</p>
                  <button
                    onClick={() => setActiveSubTab("buy")}
                    className="mt-6 text-xs font-black uppercase tracking-widest text-neon-blue hover:underline"
                  >
                    Ir para a loja
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(inventory || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-emerald-400">
                        <Check className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Adquirido em {item.purchasedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
