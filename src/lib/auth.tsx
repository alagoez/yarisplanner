import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState } from './auth-context'
import { IS_DEMO } from './demo'
import { supabase } from './supabase'

// Tasarım önizlemesi (yalnızca geliştirmede ?demo) giriş yapmadan açılır.
const DEMO_SESSION = { user: { id: 'demo', email: 'yaren@ornek.com', user_metadata: { full_name: 'Yaren' } } } as unknown as Session

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(IS_DEMO ? { session: DEMO_SESSION, loading: false } : { session: null, loading: true })

  useEffect(() => {
    if (!supabase || IS_DEMO) return
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session, loading: false }))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setState({ session, loading: false }))
    return () => data.subscription.unsubscribe()
  }, [])

  return <AuthContext value={state}>{children}</AuthContext>
}
