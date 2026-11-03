import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthState = { session: Session | null; loading: boolean }

export const AuthContext = createContext<AuthState>({ session: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

export function firstName(session: Session | null) {
  const full = session?.user.user_metadata?.full_name as string | undefined
  return full?.trim().split(/\s+/)[0] ?? ''
}
