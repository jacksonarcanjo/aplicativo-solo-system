"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Target, Brain, Heart, Briefcase, GraduationCap, ArrowRight, MapPin, ShieldAlert } from "lucide-react"
import { useGame } from "@/lib/game-store"
import { cn } from "@/lib/utils"

const OBJECTIVES = [
  { id: "health", label: "Saúde & Fitness", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "career", label: "Carreira & Profissional", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "studies", label: "Estudos & Conhecimento", icon: GraduationCap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "mindset", label: "Mentalidade & Foco", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "discipline", label: "Disciplina & Hábitos", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
]

export function OnboardingScreen() {
  const { completeOnboarding, playerName } = useGame()
  const [selected, setSelected] = useState<string[]>([])
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (step === 3 && "geolocation" in navigator) {
      // Request location permission when step 3 is shown
      navigator.geolocation.getCurrentPosition(
        () => {
          console.log("Location permission granted");
        },
        (error) => {
          console.warn("Location permission denied or error:", error);
        }
      );
    }
  }, [step]);

  const toggleObjective = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleFinish = () => {
    completeOnboarding(selected)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-12">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center"
          >
            <div className="space-y-2">
              <h1 className="font-display text-4xl font-black tracking-tight text-white">
                BEM-VINDO, <span className="text-neon-blue uppercase">{playerName}</span>
              </h1>
              <p className="text-muted-foreground">
                O Sistema está pronto para iniciar sua evolução. Primeiro, precisamos definir seus focos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => toggleObjective(obj.id)}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300",
                    selected.includes(obj.id)
                      ? "border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                      : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className={cn("rounded-xl p-2 transition-colors", obj.bg, obj.color)}>
                    <obj.icon className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "font-bold transition-colors",
                    selected.includes(obj.id) ? "text-white" : "text-muted-foreground group-hover:text-white/80"
                  )}>
                    {obj.label}
                  </span>
                  {selected.includes(obj.id) && (
                    <motion.div
                      layoutId="check"
                      className="ml-auto rounded-full bg-neon-blue p-1 text-black"
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <button
              disabled={selected.length === 0}
              onClick={() => setStep(2)}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-neon-blue py-4 font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              Continuar
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neon-blue/20 text-neon-blue">
                <Target className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-black tracking-tight text-white">
                  DIRETRIZES DEFINIDAS
                </h2>
                <p className="text-muted-foreground">
                  O Sistema irá priorizar missões de {selected.map(id => OBJECTIVES.find(o => o.id === id)?.label).join(", ")}.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-left">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-neon-blue">Aviso do Sistema</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-neon-blue">•</span>
                  Sua evolução será monitorada em tempo real.
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue">•</span>
                  Falhas em missões diárias resultarão em penalidades de HP.
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue">•</span>
                  Consistência é a chave para o Rank S.
                </li>
              </ul>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full rounded-2xl bg-gradient-to-r from-neon-blue to-blue-600 py-4 font-black uppercase tracking-widest text-black shadow-lg shadow-neon-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              CONTINUAR
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-black tracking-tight text-white">
                  TERMOS DO SISTEMA
                </h2>
                <p className="text-muted-foreground text-sm">
                  Para missões de movimento (ex: correr 5km), o Sistema precisará acessar sua <strong className="text-neon-blue">Localização (GPS)</strong>.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-left">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Tolerância Zero
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-rose-500">•</span>
                  Você pode recusar o acesso ao GPS, mas missões de movimento não contarão XP para o Ranking.
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500">•</span>
                  <strong className="text-white">NÃO TOLERAMOS ROUBOS E TRAPAÇAS.</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-500">•</span>
                  Qualquer tentativa de burlar o sistema resultará em punições severas no seu HP e Gold.
                </li>
              </ul>
            </div>

            <button
              onClick={handleFinish}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 py-4 font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              ACEITAR E INICIAR DESPERTAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
