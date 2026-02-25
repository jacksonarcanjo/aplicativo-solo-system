"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase-config"
import { useAuth } from "./auth-context"

/* ── Types ── */
export interface DailyTask {
  id: string
  label: string
  description: string
  completed: boolean
}

export interface SideQuest {
  id: string
  label: string
  description: string
  xp: number
  gold: number
  completed: boolean
  category: "saude" | "mente" | "estetica"
}

export interface CharismaMission {
  id: string
  label: string
  description: string
  charisma: number
  xp: number
  gold: number
  completed: boolean
}

export interface InventoryItem {
  id: string
  name: string
  icon: string
  description: string
  purchasedAt: string
  used: boolean
}

export interface InvestmentDef {
  id: string
  name: string
  cost: number
  incomePerDay: number
  icon: string
  description: string
}

export interface OwnedInvestment {
  id: string
  purchasedAt: string
}

export interface DiaryData {
  princeChapters: number
  animeFocusMinutes: number
  geoHighScore: number
  groomingChecklist: boolean[]
  evolutionPhotos: string[]
}

export interface ShadowBoss {
  id: string
  label: string
  description: string
  requirement: string
  extracted: boolean
}

export interface Rank {
  title: string
  minLevel: number
  color: "blue" | "red" | "gold"
  icon: string
}

export const RANKS: Rank[] = [
  { title: "Rank-E: Aprendiz", minLevel: 1, color: "blue", icon: "E" },
  { title: "Rank-D: Guerreiro", minLevel: 5, color: "blue", icon: "D" },
  { title: "Rank-C: Assassino", minLevel: 10, color: "blue", icon: "C" },
  { title: "Rank-B: Cavaleiro", minLevel: 18, color: "gold", icon: "B" },
  { title: "Rank-A: Mestre de Masmorra", minLevel: 28, color: "gold", icon: "A" },
  { title: "Rank-S: General das Sombras", minLevel: 40, color: "red", icon: "S" },
  { title: "Monarca Nacional", minLevel: 55, color: "red", icon: "MN" },
  { title: "Monarca das Sombras", minLevel: 75, color: "red", icon: "MS" },
]

export function getRank(level: number): Rank {
  let current = RANKS[0]
  for (const r of RANKS) {
    if (level >= r.minLevel) current = r
  }
  return current
}

export function getNextRank(level: number): Rank | null {
  for (const r of RANKS) {
    if (level < r.minLevel) return r
  }
  return null
}

/* ── Mission Pools ── */
const DAILY_TASKS_POOL: Omit<DailyTask, "completed">[] = [
  { id: "d_agua", label: "Pocao de Purificacao", description: "Beber 3 a 4 litros de agua no dia" },
  { id: "d_gelo", label: "Crioterapia Matinal", description: "Passar gelo no rosto ou lavar com agua gelada por 2 min" },
  { id: "d_treino", label: "Treino de Resistencia", description: "30 min de exercicio — corda, corrida, calistenia ou musculacao" },
  { id: "d_foco", label: "Foco Blindado", description: "Estudar 1 hora (adm, matematica ou financas) sem celular" },
]

const SIDE_QUESTS_POOL: Omit<SideQuest, "completed">[] = [
  { id: "sq_sodio", label: "Jejum de Sodio Noturno", description: "Cortar salgados e ultraprocessados apos as 18h", xp: 30, gold: 15, category: "saude" },
  { id: "sq_acucar", label: "Escudo Contra Acucar", description: "Dia inteiro sem acucar refinado", xp: 40, gold: 20, category: "saude" },
  { id: "sq_sono", label: "Recuperacao de MP", description: "Dormir 8h seguidas, telas off 30 min antes", xp: 50, gold: 25, category: "saude" },
  { id: "sq_fruta", label: "Recarga Nutricional", description: "Comer pelo menos 2 frutas durante o dia", xp: 20, gold: 10, category: "saude" },
  { id: "sq_along", label: "Reset Muscular", description: "Fazer 10 min de alongamento ou yoga", xp: 20, gold: 10, category: "saude" },
  { id: "sq_camin", label: "Patrulha Territorial", description: "Caminhar 5000 passos durante o dia", xp: 35, gold: 15, category: "saude" },
  { id: "sq_livro", label: "Expansao de Sabedoria", description: "Ler 1 capitulo de livro (qualquer genero)", xp: 25, gold: 10, category: "mente" },
  { id: "sq_mental", label: "Consciencia e Equilibrio", description: "20 min de meditacao ou organizar pensamentos", xp: 30, gold: 15, category: "mente" },
  { id: "sq_geo", label: "Treinamento Espacial", description: "3 rodadas de GeoGuessr ou quiz de conhecimento", xp: 15, gold: 10, category: "mente" },
  { id: "sq_diario", label: "Registro do Cacador", description: "Escrever no diario sobre o dia", xp: 30, gold: 20, category: "mente" },
  { id: "sq_novo", label: "Habilidade Nova", description: "Aprender algo novo (video, artigo, tutorial)", xp: 45, gold: 25, category: "mente" },
  { id: "sq_redes", label: "Bloqueio Mental", description: "Sem redes sociais por 2h seguidas", xp: 40, gold: 20, category: "mente" },
  { id: "sq_pente", label: "Upgrade de Armadura", description: "Cuidar da aparencia — cabelo, skincare, estilo", xp: 20, gold: 10, category: "estetica" },
  { id: "sq_quarto", label: "Fortaleza Limpa", description: "Arrumar e organizar o quarto inteiro", xp: 25, gold: 15, category: "estetica" },
  { id: "sq_roupa", label: "Inventario do Avatar", description: "Separar e organizar roupas para a semana", xp: 20, gold: 10, category: "estetica" },
  { id: "sq_agenda", label: "Mapa Tatico", description: "Organizar agenda e tarefas do dia seguinte", xp: 20, gold: 15, category: "estetica" },
]

const CHARISMA_MISSIONS_POOL: Omit<CharismaMission, "completed">[] = [
  { id: "cm_mae", label: "Tempo com a Mae", description: "Passar tempo de qualidade com a mae", charisma: 20, xp: 40, gold: 20 },
  { id: "cm_amigo", label: "Ajudar Amigo da Guilda", description: "Ajudar um amigo com algo significativo", charisma: 15, xp: 30, gold: 15 },
  { id: "cm_conversa", label: "Conversa Profunda", description: "Ter uma conversa significativa com alguem", charisma: 25, xp: 50, gold: 25 },
  { id: "cm_gentileza", label: "Ato de Gentileza", description: "Fazer algo gentil por um desconhecido", charisma: 10, xp: 20, gold: 10 },
  { id: "cm_familia", label: "Momento em Familia", description: "Jantar ou atividade com a familia", charisma: 20, xp: 35, gold: 20 },
  { id: "cm_elogio", label: "Elogiar Alguem", description: "Fazer um elogio sincero para alguem", charisma: 8, xp: 15, gold: 5 },
]

/* ── Investments ── */
export const INVESTMENTS: InvestmentDef[] = [
  { id: "rota_logistica", name: "Rota de Logistica", cost: 500, incomePerDay: 10, icon: "truck", description: "Uma rota comercial que gera renda diaria" },
  { id: "startup_adm", name: "Startup de Administracao", cost: 1200, incomePerDay: 25, icon: "building", description: "Startup na area de gestao empresarial" },
  { id: "mina_gold", name: "Mina de Gold", cost: 2000, incomePerDay: 50, icon: "pickaxe", description: "Uma mina que extrai Gold automaticamente" },
  { id: "rede_comercio", name: "Rede de Comercio", cost: 3500, incomePerDay: 80, icon: "network", description: "Rede interligada de comercio e logistica" },
]

/* ── Shadow Bosses ── */
export const SHADOW_BOSSES_DEF: Omit<ShadowBoss, "extracted">[] = [
  { id: "sem_acucar", label: "Semana Zero Acucar", description: "O monstro da tentacao do doce", requirement: "Completar 7 missoes 'Escudo Contra Acucar'" },
  { id: "maratona_treino", label: "Maratona de Treino", description: "O gigante da resistencia fisica", requirement: "Completar 30 treinos diarios" },
  { id: "mestre_foco", label: "Mestre do Foco", description: "O espectro da distracao", requirement: "Completar 20 sessoes de foco" },
  { id: "senhor_streaks", label: "Senhor das Ofensivas", description: "O guardiao da consistencia", requirement: "Alcancar 30 dias de ofensiva" },
  { id: "rei_gold", label: "Rei do Gold", description: "O dragao da avareza", requirement: "Acumular 10.000 Gold" },
]

/* ── Grooming Labels ── */
export const GROOMING_LABELS = [
  "Penteado para Rosto Oval",
  "Limpeza Facial",
  "Hidratacao",
  "Protetor Solar",
]

/* ── Day-based rotation ── */
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const copy = [...arr]
  let s = seed
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function getTodaysDailyTasks(): DailyTask[] {
  return DAILY_TASKS_POOL.map((t) => ({ ...t, completed: false }))
}

export function getTodaysSideQuests(): SideQuest[] {
  const day = getDayOfYear()
  const shuffled = shuffleWithSeed(SIDE_QUESTS_POOL, day)
  const selected = shuffled.slice(0, 6)
  return selected.map((q) => ({ ...q, completed: false }))
}

export function getTodaysCharismaMissions(): CharismaMission[] {
  const day = getDayOfYear()
  const shuffled = shuffleWithSeed(CHARISMA_MISSIONS_POOL, day + 999)
  return shuffled.slice(0, 3).map((m) => ({ ...m, completed: false }))
}

/* ── Store Items ── */
export interface StoreItemDef {
  id: string
  name: string
  cost: number
  description: string
  iconId: string
}

export const STORE_ITEMS: StoreItemDef[] = [
  { id: "r_anime", name: "Sessao de Imersao", cost: 150, description: "Assistir 2 episodios de anime sem culpa", iconId: "tv" },
  { id: "r_estetica", name: "Equipamento Estetico", cost: 600, description: "Pomada, perfume ou produto de skincare", iconId: "sparkles" },
  { id: "r_cheat", name: "Cheat Meal", cost: 1000, description: "Refeicao livre — hamburguer, pizza etc.", iconId: "utensils" },
  { id: "r_explore", name: "Passe de Exploracao", cost: 200, description: "1h30 de jogos livremente", iconId: "gamepad" },
  { id: "r_doce", name: "Doce Extra", cost: 80, description: "Um docinho fora da dieta", iconId: "candy" },
  { id: "r_ifood", name: "Ifood na Sexta", cost: 300, description: "Peca o que quiser no iFood", iconId: "truck" },
  { id: "r_descanso", name: "Dia de Descanso", cost: 400, description: "Um dia inteiro sem obrigacoes", iconId: "bed" },
  { id: "r_saida", name: "Saida com Amigos", cost: 500, description: "Role com os amigos sem culpa", iconId: "users" },
]

/* ── Theme Colors ── */
export type ThemeColor = "blue" | "purple" | "gold" | "green"

export const THEME_COLORS: { id: ThemeColor; label: string; hex: string; premium: boolean }[] = [
  { id: "blue", label: "Neon Azul", hex: "#00E5FF", premium: false },
  { id: "purple", label: "Aura Sombria", hex: "#b026ff", premium: true },
  { id: "gold", label: "Dourado Real", hex: "#FFD700", premium: true },
  { id: "green", label: "Verde Toxico", hex: "#39FF14", premium: true },
]

export const PREMIUM_TITLES = [
  "Monarca das Sombras",
  "Cacador de Elite",
  "Lorde das Trevas",
  "Destruidor",
  "Assassino Fantasma",
  "General Supremo",
]

/* ── Premium Banner Presets ── */
export interface BannerPreset {
  id: string
  label: string
  gradient: string
  premium: boolean
}

export const BANNER_PRESETS: BannerPreset[] = [
  { id: "none", label: "Sem Banner", gradient: "linear-gradient(135deg, #0a0a0f 0%, #111118 100%)", premium: false },
  { id: "shadow_monarch", label: "Monarca das Sombras", gradient: "linear-gradient(135deg, #1a0033 0%, #0d001a 30%, #3300ff 100%)", premium: true },
  { id: "neon_hunter", label: "Cacador Neon", gradient: "linear-gradient(135deg, #001a1a 0%, #003333 50%, #00E5FF 100%)", premium: true },
  { id: "blood_moon", label: "Lua de Sangue", gradient: "linear-gradient(135deg, #1a0000 0%, #330000 50%, #FF0033 100%)", premium: true },
  { id: "golden_throne", label: "Trono Dourado", gradient: "linear-gradient(135deg, #1a1400 0%, #332800 50%, #FFD700 100%)", premium: true },
  { id: "toxic_aura", label: "Aura Toxica", gradient: "linear-gradient(135deg, #001a00 0%, #003300 50%, #39FF14 100%)", premium: true },
  { id: "void_rift", label: "Fenda do Vazio", gradient: "linear-gradient(135deg, #0a001a 0%, #1a0033 40%, #b026ff 100%)", premium: true },
]

/* ── State ── */
interface GameState {
  playerName: string
  playerClass: string
  playerTitle: string
  gold: number
  xp: number
  level: number
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attributes: {
    FOR: number
    AGI: number
    VIT: number
    INT: number
    PER: number
    CAR: number
  }
  dailyTasks: DailyTask[]
  sideQuests: SideQuest[]
  charismaMissions: CharismaMission[]
  dailyRewardClaimed: boolean
  lastResetDate: string
  inventory: InventoryItem[]
  streak: number
  lastStreakDate: string
  longestStreak: number
  totalDaysCompleted: number
  musicPlaying: boolean
  currentTrack: number
  isPremium: boolean
  themeColor: ThemeColor
  avatarUrl: string
  bannerUrl: string
  bannerPresetId: string
  /* Cat Mascot */
  catHp: number
  /* Investments */
  ownedInvestments: OwnedInvestment[]
  lastPassiveCollect: string
  /* Charisma */
  charisma: number
  /* Diary */
  diaryData: DiaryData
  /* Shadow Army */
  shadowArmy: string[]
}

interface GameContextType extends GameState {
  addGold: (amount: number) => void
  spendGold: (amount: number) => boolean
  addXp: (amount: number) => void
  toggleDailyTask: (id: string) => void
  completeSideQuest: (id: string) => void
  completeCharismaMission: (id: string) => void
  addToInventory: (item: Omit<InventoryItem, "purchasedAt" | "used">) => void
  useInventoryItem: (id: string) => void
  setPlayerName: (name: string) => void
  setPlayerClass: (cls: string) => void
  setPlayerTitle: (title: string) => void
  setMusicPlaying: (playing: boolean) => void
  setCurrentTrack: (track: number) => void
  setIsPremium: (premium: boolean) => void
  setThemeColor: (color: ThemeColor) => void
  setAvatarUrl: (url: string) => void
  setBannerUrl: (url: string) => void
  setBannerPresetId: (id: string) => void
  healCat: () => boolean
  buyInvestment: (id: string) => boolean
  collectPassiveIncome: () => number
  updateDiary: (data: Partial<DiaryData>) => void
  addShadow: (id: string) => void
  passiveIncome: number
  charismaLevel: number
  charismaDiscount: number
  allDailyDone: boolean
  allSideQuestsDone: boolean
  punishPlayer: (reason: string, hpLoss: number, goldLoss: number) => void
  notification: { message: string; type: "success" | "error" } | null
  clearNotification: () => void
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 200) + 1
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]
}

function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

function getDefaultState(): GameState {
  return {
    playerName: "Jogador",
    playerClass: "Guerreiro",
    playerTitle: "",
    gold: 0,
    xp: 0,
    level: 1,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attributes: { FOR: 5, AGI: 4, VIT: 6, INT: 7, PER: 3, CAR: 0 },
    dailyTasks: getTodaysDailyTasks(),
    sideQuests: getTodaysSideQuests(),
    charismaMissions: getTodaysCharismaMissions(),
    dailyRewardClaimed: false,
    lastResetDate: getTodayString(),
    inventory: [],
    streak: 0,
    lastStreakDate: "",
    longestStreak: 0,
    totalDaysCompleted: 0,
    musicPlaying: false,
    currentTrack: 0,
    isPremium: false,
    themeColor: "blue" as ThemeColor,
    avatarUrl: "",
    bannerUrl: "",
    bannerPresetId: "none",
    catHp: 100,
    ownedInvestments: [],
    lastPassiveCollect: getTodayString(),
    charisma: 0,
    diaryData: {
      princeChapters: 0,
      animeFocusMinutes: 0,
      geoHighScore: 0,
      groomingChecklist: [false, false, false, false],
      evolutionPhotos: [],
    },
    shadowArmy: [],
  }
}

function migrateState(data: any): GameState {
  const today = getTodayString()
  const parsed = { ...data }

  if (parsed.lastResetDate !== today) {
    const yesterday = getYesterdayString()
    if (parsed.lastStreakDate !== yesterday && parsed.lastStreakDate !== today) {
      parsed.streak = 0
    }

    // Damage cat if dailies were not completed
    const allDailyWereDone = parsed.dailyTasks?.every((t: any) => t.completed)
    if (!allDailyWereDone && parsed.catHp !== undefined) {
      parsed.catHp = Math.max(0, (parsed.catHp ?? 100) - 20)
    }

    // Collect passive income
    const passiveIncome = (parsed.ownedInvestments ?? []).reduce((sum: number, inv: any) => {
      const def = INVESTMENTS.find((d) => d.id === inv.id)
      return sum + (def?.incomePerDay ?? 0)
    }, 0)
    if (passiveIncome > 0) {
      parsed.gold = (parsed.gold ?? 0) + passiveIncome
    }

    // Reset missions with today's rotation
    parsed.dailyTasks = getTodaysDailyTasks()
    parsed.sideQuests = getTodaysSideQuests()
    parsed.charismaMissions = getTodaysCharismaMissions()
    parsed.dailyRewardClaimed = false
    parsed.lastResetDate = today
    parsed.lastPassiveCollect = today
  }

  if (parsed.xp === undefined) parsed.xp = 0
  parsed.level = calculateLevel(parsed.xp)

  // Ensure new fields exist (migration)
  if (parsed.playerName === undefined) parsed.playerName = "Jogador"
  if (parsed.playerClass === undefined) parsed.playerClass = "Guerreiro"
  if (parsed.playerTitle === undefined) parsed.playerTitle = ""
  if (parsed.gold === undefined) parsed.gold = 0
  if (parsed.hp === undefined) parsed.hp = 100
  if (parsed.maxHp === undefined) parsed.maxHp = 100
  if (parsed.mp === undefined) parsed.mp = 50
  if (parsed.maxMp === undefined) parsed.maxMp = 50
  if (parsed.musicPlaying === undefined) parsed.musicPlaying = false
  if (parsed.currentTrack === undefined) parsed.currentTrack = 0
  if (parsed.isPremium === undefined) parsed.isPremium = false
  if (parsed.themeColor === undefined) parsed.themeColor = "blue"
  if (parsed.avatarUrl === undefined) parsed.avatarUrl = ""
  if (parsed.bannerUrl === undefined) parsed.bannerUrl = ""
  if (parsed.bannerPresetId === undefined) parsed.bannerPresetId = "none"
  if (parsed.catHp === undefined) parsed.catHp = 100
  if (parsed.ownedInvestments === undefined) parsed.ownedInvestments = []
  if (parsed.lastPassiveCollect === undefined) parsed.lastPassiveCollect = today
  if (parsed.charisma === undefined) parsed.charisma = 0
  if (parsed.charismaMissions === undefined) parsed.charismaMissions = getTodaysCharismaMissions()
  if (parsed.attributes === undefined) {
    parsed.attributes = getDefaultState().attributes;
  } else {
    // Ensure all attributes have default values if missing
    const defaultAttributes = getDefaultState().attributes;
    for (const key in defaultAttributes) {
      if (parsed.attributes[key as keyof typeof defaultAttributes] === undefined) {
        parsed.attributes[key as keyof typeof defaultAttributes] = defaultAttributes[key as keyof typeof defaultAttributes];
      }
    }
  }

  if (parsed.diaryData === undefined) {
    parsed.diaryData = {
      princeChapters: 0,
      animeFocusMinutes: 0,
      geoHighScore: 0,
      groomingChecklist: [false, false, false, false],
      evolutionPhotos: [],
    }
  }
  if (parsed.shadowArmy === undefined) parsed.shadowArmy = []

  return parsed as GameState
}

function loadState(): GameState {
  if (typeof window === "undefined") return getDefaultState()
  try {
    const raw = localStorage.getItem("solo-system-state-v3")
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw)
    return migrateState(parsed)
  } catch {
    return getDefaultState()
  }
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<GameState>(getDefaultState)
  const [hydrated, setHydrated] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  // Load state from Firestore or LocalStorage
  useEffect(() => {
    if (!user) {
      setState(loadState())
      setHydrated(true)
      return
    }

    const userDocRef = doc(db, "users", user.uid)
    
    // Initial load
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setState(migrateState(data))
      } else {
        // If no remote state, use local or default
        const local = loadState()
        setState(local)
        // Save initial state to Firestore
        setDoc(userDocRef, local)
      }
      setHydrated(true)
    })

    // Listen for remote changes (sync across devices)
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data()
        const migrated = migrateState(remoteData)
        setState(prev => {
          // Only update if remote is different to avoid loops
          if (JSON.stringify(prev) !== JSON.stringify(migrated)) {
            return migrated
          }
          return prev
        })
      }
    })

    return () => unsubscribe()
  }, [user])

  // Save state to Firestore or LocalStorage
  useEffect(() => {
    if (hydrated) {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        setDoc(userDocRef, state)
      } else {
        localStorage.setItem("solo-system-state-v3", JSON.stringify(state))
      }
    }
  }, [state, hydrated, user])

  const clearNotification = useCallback(() => setNotification(null), [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const addGold = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, gold: prev.gold + amount }))
  }, [])

  const spendGold = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.gold >= amount) {
        success = true
        return { ...prev, gold: prev.gold - amount }
      }
      return prev
    })
    return success
  }, [])

  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount
      const newLevel = calculateLevel(newXp)
      const leveledUp = newLevel > prev.level
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        maxHp: 100 + (newLevel - 1) * 10,
        hp: leveledUp ? 100 + (newLevel - 1) * 10 : prev.hp,
        maxMp: 50 + (newLevel - 1) * 5,
        mp: leveledUp ? 50 + (newLevel - 1) * 5 : prev.mp,
        attributes: leveledUp
          ? {
              FOR: prev.attributes.FOR + 1,
              AGI: prev.attributes.AGI + 1,
              VIT: prev.attributes.VIT + 1,
              INT: prev.attributes.INT + 1,
              PER: prev.attributes.PER + 1,
              CAR: prev.attributes.CAR,
            }
          : prev.attributes,
      }
    })
  }, [])

  const toggleDailyTask = useCallback(
    (id: string) => {
      setState((prev) => {
        const updatedTasks = (prev.dailyTasks || []).map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
        const allDone = updatedTasks.every((t) => t.completed)
        const wasDone = prev.dailyRewardClaimed

        if (allDone && !wasDone) {
          setNotification({ message: "+100 XP | +50 Gold | Ofensiva +1!", type: "success" })
          const newXp = prev.xp + 100
          const newLevel = calculateLevel(newXp)
          const today = getTodayString()
          const newStreak = prev.streak + 1
          const newLongest = Math.max(prev.longestStreak, newStreak)
          return {
            ...prev,
            dailyTasks: updatedTasks,
            dailyRewardClaimed: true,
            xp: newXp,
            gold: prev.gold + 50,
            level: newLevel,
            maxHp: 100 + (newLevel - 1) * 10,
            maxMp: 50 + (newLevel - 1) * 5,
            streak: newStreak,
            lastStreakDate: today,
            longestStreak: newLongest,
            totalDaysCompleted: prev.totalDaysCompleted + 1,
          }
        }

        return { ...prev, dailyTasks: updatedTasks }
      })
    },
    []
  )

  const completeSideQuest = useCallback(
    (id: string) => {
      setState((prev) => {
        const quest = (prev.sideQuests || []).find((q) => q.id === id)
        if (!quest || quest.completed) return prev

        setNotification({
          message: `+${quest.xp} XP | +${quest.gold} Gold`,
          type: "success",
        })

        const newXp = prev.xp + quest.xp
        const newLevel = calculateLevel(newXp)
        return {
          ...prev,
          xp: newXp,
          gold: prev.gold + quest.gold,
          level: newLevel,
          maxHp: 100 + (newLevel - 1) * 10,
          maxMp: 50 + (newLevel - 1) * 5,
          sideQuests: (prev.sideQuests || []).map((q) =>
            q.id === id ? { ...q, completed: true } : q
          ),
        }
      })
    },
    []
  )

  const completeCharismaMission = useCallback(
    (id: string) => {
      setState((prev) => {
        const mission = (prev.charismaMissions || []).find((m) => m.id === id)
        if (!mission || mission.completed) return prev

        setNotification({
          message: `+${mission.charisma} Carisma | +${mission.xp} XP | +${mission.gold} Gold`,
          type: "success",
        })

        const newXp = prev.xp + mission.xp
        const newLevel = calculateLevel(newXp)
        const newCharisma = prev.charisma + mission.charisma
        const newCarAttr = Math.floor(newCharisma / 50) + (prev.attributes?.CAR || 0)
        return {
          ...prev,
          xp: newXp,
          gold: prev.gold + mission.gold,
          level: newLevel,
          charisma: newCharisma,
          attributes: { ...prev.attributes, CAR: Math.max((prev.attributes?.CAR || 0), Math.floor(newCharisma / 50)) },
          charismaMissions: (prev.charismaMissions || []).map((m) =>
            m.id === id ? { ...m, completed: true } : m
          ),
        }
      })
    },
    []
  )

  const addToInventory = useCallback(
    (item: Omit<InventoryItem, "purchasedAt" | "used">) => {
      setState((prev) => ({
        ...prev,
        inventory: [
          ...(prev.inventory || []),
          { ...item, purchasedAt: new Date().toLocaleDateString("pt-BR"), used: false },
        ],
      }))
    },
    []
  )

  const useInventoryItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      inventory: (prev.inventory || []).map((i) =>
        i.id === id ? { ...i, used: true } : i
      ),
    }))
  }, [])

  const setPlayerName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, playerName: name }))
  }, [])

  const setPlayerClass = useCallback((cls: string) => {
    setState((prev) => ({ ...prev, playerClass: cls }))
  }, [])

  const setPlayerTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, playerTitle: title }))
  }, [])

  const setMusicPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({ ...prev, musicPlaying: playing }))
  }, [])

  const setCurrentTrack = useCallback((track: number) => {
    setState((prev) => ({ ...prev, currentTrack: track }))
  }, [])

  const setIsPremium = useCallback((premium: boolean) => {
    setState((prev) => ({ ...prev, isPremium: premium }))
  }, [])

  const setThemeColor = useCallback((color: ThemeColor) => {
    setState((prev) => ({ ...prev, themeColor: color }))
  }, [])

  const setAvatarUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, avatarUrl: url }))
  }, [])

  const setBannerUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, bannerUrl: url }))
  }, [])

  const setBannerPresetId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, bannerPresetId: id }))
  }, [])

  const healCat = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      if (prev.gold >= 50 && prev.catHp < 100) {
        success = true
        setNotification({ message: "Gato curado! -50 Gold", type: "success" })
        return { ...prev, gold: prev.gold - 50, catHp: 100 }
      }
      if (prev.gold < 50) {
        setNotification({ message: "Gold insuficiente!", type: "error" })
      }
      return prev
    })
    return success
  }, [])

  const buyInvestment = useCallback((id: string): boolean => {
    let success = false
    setState((prev) => {
      const def = INVESTMENTS.find((d) => d.id === id)
      if (!def) return prev
      // Apply charisma discount
      const charismaLvl = Math.floor(prev.charisma / 100)
      const discount = Math.min(charismaLvl * 5, 25) / 100
      const finalCost = Math.floor(def.cost * (1 - discount))
      if (prev.gold >= finalCost) {
        success = true
        setNotification({ message: `${def.name} adquirido! +${def.incomePerDay} Gold/dia`, type: "success" })
        return {
          ...prev,
          gold: prev.gold - finalCost,
          ownedInvestments: [...prev.ownedInvestments, { id, purchasedAt: new Date().toLocaleDateString("pt-BR") }],
        }
      }
      setNotification({ message: "Gold insuficiente!", type: "error" })
      return prev
    })
    return success
  }, [])

  const collectPassiveIncome = useCallback((): number => {
    let collected = 0
    setState((prev) => {
      const today = getTodayString()
      if (prev.lastPassiveCollect === today) return prev
      const income = (prev.ownedInvestments || []).reduce((sum, inv) => {
        const def = INVESTMENTS.find((d) => d.id === inv.id)
        return sum + (def?.incomePerDay ?? 0)
      }, 0)
      if (income > 0) {
        collected = income
        setNotification({ message: `Renda passiva coletada: +${income} Gold`, type: "success" })
        return { ...prev, gold: prev.gold + income, lastPassiveCollect: today }
      }
      return prev
    })
    return collected
  }, [])

  const updateDiary = useCallback((data: Partial<DiaryData>) => {
    setState((prev) => ({
      ...prev,
      diaryData: { ...prev.diaryData, ...data },
    }))
  }, [])

  const addShadow = useCallback((id: string) => {
    setState((prev) => {
      if (prev.shadowArmy.includes(id)) return prev
      setNotification({ message: "Sombra Extraida!", type: "success" })
      return { ...prev, shadowArmy: [...prev.shadowArmy, id] }
    })
  }, [])

  const punishPlayer = useCallback((reason: string, hpLoss: number, goldLoss: number) => {
    setState((prev) => {
      setNotification({ message: `PUNIÇÃO: ${reason} (-${hpLoss} HP, -${goldLoss} Gold)`, type: "error" })
      return {
        ...prev,
        hp: Math.max(0, prev.hp - hpLoss),
        gold: Math.max(0, prev.gold - goldLoss),
      }
    })
  }, [])

  const passiveIncome = (state.ownedInvestments || []).reduce((sum, inv) => {
    const def = INVESTMENTS.find((d) => d.id === inv.id)
    return sum + (def?.incomePerDay ?? 0)
  }, 0)

  const charismaLevel = Math.floor(state.charisma / 100)
  const charismaDiscount = Math.min(charismaLevel * 5, 25)

  const allDailyDone = (state.dailyTasks || []).every((t) => t.completed)
  const allSideQuestsDone = (state.sideQuests || []).every((q) => q.completed)

  return (
    <GameContext.Provider
      value={{
        ...state,
        addGold,
        spendGold,
        addXp,
        toggleDailyTask,
        completeSideQuest,
        completeCharismaMission,
        addToInventory,
        useInventoryItem,
        setPlayerName,
        setPlayerClass,
        setPlayerTitle,
        setMusicPlaying,
        setCurrentTrack,
        setIsPremium,
        setThemeColor,
        setAvatarUrl,
        setBannerUrl,
        setBannerPresetId,
        healCat,
        buyInvestment,
        collectPassiveIncome,
        updateDiary,
        addShadow,
        punishPlayer,
        passiveIncome,
        charismaLevel,
        charismaDiscount,
        allDailyDone,
        allSideQuestsDone,
        notification,
        clearNotification,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextType {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("useGame must be used within GameProvider")
  return ctx
}
