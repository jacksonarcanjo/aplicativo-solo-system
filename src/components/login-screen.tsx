"use client"

import { useState, type FormEvent } from "react"
import { useAuth } from "@/lib/auth-context"
import { Mail, Lock, User, Eye, EyeOff, Loader2, Swords } from "lucide-react"

type AuthMode = "login" | "register"

export function LoginScreen() {
  const { login, register, loginWithGoogle, error, clearError, isLoading: authLoading } = useAuth()
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setIsSubmitting(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    clearError()
    setIsSubmitting(true)
    try {
      await loginWithGoogle()
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    clearError()
    setMode(mode === "login" ? "register" : "login")
    setPassword("")
    setName("")
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Background effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(0, 229, 255, 0.06) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 80%, rgba(0, 229, 255, 0.03) 0%, transparent 50%)",
        }}
      />

      {/* Logo / Title area */}
      <div className="relative z-10 flex flex-col items-center gap-5 mb-10">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-neon-blue/40 bg-neon-blue/5"
          style={{
            boxShadow: "0 0 30px rgba(0, 229, 255, 0.15), inset 0 0 20px rgba(0, 229, 255, 0.05)",
          }}
        >
          <Swords className="h-10 w-10 text-neon-blue" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="font-display text-3xl font-black tracking-tight neon-text-blue text-balance text-center">
            SOLO SYSTEM
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
            Gamified Productivity
          </p>
        </div>
      </div>

      {/* Glass Card */}
      <div
        className="relative z-10 w-full max-w-sm glass-panel rounded-2xl border border-neon-blue/20 p-6"
        style={{
          boxShadow: "0 0 40px rgba(0, 229, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        {/* Mode switcher */}
        <div className="flex rounded-xl overflow-hidden glass-panel mb-6">
          <button
            type="button"
            onClick={() => { if (mode !== "login") switchMode() }}
            className={`flex-1 py-2.5 font-mono text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-neon-blue/10 text-neon-blue"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Entrar
          </button>
          <div className="w-px bg-border" />
          <button
            type="button"
            onClick={() => { if (mode !== "register") switchMode() }}
            className={`flex-1 py-2.5 font-mono text-xs font-bold transition-all ${
              mode === "register"
                ? "bg-neon-blue/10 text-neon-blue"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name field - register only */}
          {mode === "register" && (
            <div className="flex flex-col gap-1.5 animate-slide-up">
              <label htmlFor="name" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Nome do Cacador
              </label>
              <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border/50 px-3.5 py-3 focus-within:border-neon-blue/40 transition-colors">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  maxLength={20}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 font-sans outline-none"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border/50 px-3.5 py-3 focus-within:border-neon-blue/40 transition-colors">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 font-sans outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Senha
            </label>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border/50 px-3.5 py-3 focus-within:border-neon-blue/40 transition-colors">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 font-sans outline-none"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-xl bg-neon-red/10 border border-neon-red/20 px-4 py-2.5 animate-slide-up">
              <span className="font-mono text-xs text-neon-red">{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || authLoading}
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(0, 229, 255, 0.25) 100%)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              color: "#00E5FF",
              boxShadow: "0 0 20px rgba(0, 229, 255, 0.1)",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>{mode === "login" ? "Entrar" : "Criar Conta"}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting || authLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-secondary/40 border border-border/50 py-3.5 font-mono text-sm font-semibold text-foreground transition-all hover:bg-secondary/60 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 font-mono text-[10px] text-muted-foreground/40 tracking-widest uppercase">
        Arise, Hunter
      </p>
    </div>
  )
}
