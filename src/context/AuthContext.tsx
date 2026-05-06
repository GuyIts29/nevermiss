import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

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
  /** Sends a magic link OTP to the given email. Returns { error } on failure. */
  signIn: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapUser(u: User): AuthUser {
  return {
    id: u.id,
    email: u.email ?? null,
    name: (u.user_metadata?.name as string | undefined) ?? null,
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // isLoading starts true — auth state is unknown until onAuthStateChange fires
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount from the persisted
    // localStorage session — no network round-trip needed, resolves quickly.
    // All subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED) flow
    // through the same handler, keeping user state always in sync.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut()
    // onAuthStateChange fires SIGNED_OUT — setUser(null) handled there
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    signIn,
    signOut,
  }), [user, isLoading, signIn, signOut])

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
