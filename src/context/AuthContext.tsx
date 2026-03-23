'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  badge: 'member' | 'honorary' | 'benefactor' | 'honor'
  bio: string | null
  created_at: string
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  requireAuth: (callback: () => void) => void
}

// Global state for auth modal
let showAuthModalCallback: (() => void) | null = null
export function setAuthModalCallback(cb: () => void) {
  showAuthModalCallback = cb
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode
  initialSession: Session | null
}) {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data ?? null)
    },
    [supabase]
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    if (initialSession?.user) {
      fetchProfile(initialSession.user.id).then(() => setLoading(false))
    } else {
      setLoading(false)
    }

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email ou mot de passe incorrect.' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Veuillez confirmer votre email avant de vous connecter.' }
      }
      return { error: error.message }
    }
    return { error: null }
  }

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback()
    } else if (showAuthModalCallback) {
      showAuthModalCallback()
    }
  }

  const signUp = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<{ error: string | null }> => {
    // Pass username and display_name via user_metadata
    // The database trigger will use these to create the profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Erreur lors de la création du compte.' }

    // Profile is created automatically by the database trigger
    // No need to insert/upsert here - it would fail due to RLS anyway

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signIn, signInWithGoogle, signUp, signOut, refreshProfile, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
