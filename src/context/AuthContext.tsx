import { createContext, useContext, useMemo, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** True only during async auth operations (sign-in, session restore) */
  isLoading: boolean
  /** Phase 1: sends magic link OTP. Phase 0: always returns error. */
  signIn: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Phase 0: stub — always unauthenticated, no-op methods
  // Phase 1: replace body with Supabase auth session management
  const value = useMemo<AuthContextValue>(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signIn: async (_email: string) => ({ error: 'auth_not_implemented' }),
    signOut: async () => {},
  }), [])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
