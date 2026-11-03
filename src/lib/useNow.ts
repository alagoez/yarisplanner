import { useEffect, useState } from 'react'

/** Şu anki zaman; uygulama gün boyu açık kalsa da dakikada bir ve ekrana dönüldüğünde tazelenir. */
export function useNow() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
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
