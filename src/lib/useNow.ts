import { useEffect, useState } from 'react'
import { DEMO_DATE, IS_DEMO } from './demo'

/** Şu anki zaman; uygulama gün boyu açık kalsa da dakikada bir ve ekrana dönüldüğünde tazelenir. */
export function useNow() {
  const [now, setNow] = useState(() => (IS_DEMO ? DEMO_DATE : new Date()))

  useEffect(() => {
    if (IS_DEMO) return
    const refresh = () => setNow(new Date())
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return now
}
