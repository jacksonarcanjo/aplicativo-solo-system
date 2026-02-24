"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth"
import { auth, googleProvider } from "./firebase-config"

export interface AuthUser {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapFirebaseUser = (firebaseUser: FirebaseUser): AuthUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "Caçador",
    photoURL: firebaseUser.photoURL,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser))
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError("Email ou senha incorretos.")
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    setError(null)
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(firebaseUser, { displayName: name })
      setUser(mapFirebaseUser({ ...firebaseUser, displayName: name } as FirebaseUser))
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Este email já está cadastrado.")
      } else {
        setError("Erro ao criar conta. Tente novamente.")
      }
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err: any) {
      console.error("Erro Google Auth:", err)
      if (err.code === 'auth/popup-blocked') {
        setError("O pop-up foi bloqueado pelo navegador. Por favor, permita pop-ups para este site.")
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("O login foi cancelado.")
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("A janela de login foi fechada antes de completar.")
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("O login com Google não está ativado no Firebase Console.")
      } else {
        setError(`Erro ao entrar com Google: ${err.message || 'Erro desconhecido'}`)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])


  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
