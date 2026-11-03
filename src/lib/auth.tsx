import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { IS_DEMO } from './demo'
import { supabase } from './supabase'

// Tasarım önizlemesi (yalnızca geliştirmede ?demo) giriş yapmadan açılır.
const DEMO_SESSION = { user: { id: 'demo', email: 'yaren@ornek.com', user_metadata: { full_name: 'Yaren' } } } as unknown as Session

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(IS_DEMO ? DEMO_SESSION : null)
  const [loading, setLoading] = useState(!IS_DEMO)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!supabase || IS_DEMO) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return <AuthContext value={{ session, loading, recovery, endRecovery: () => setRecovery(false) }}>{children}</AuthContext>
}
