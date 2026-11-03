import { Sparkles } from 'lucide-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import { AuthProvider } from './lib/auth'
import { useAuth } from './lib/auth-context'
import { supabase } from './lib/supabase'
import Calendar from './pages/Calendar'
import Home from './pages/Home'
import Lists from './pages/Lists'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Tasks from './pages/Tasks'

export default function App() {
  if (!supabase) return <ConfigMissing />

  return (
    <AuthProvider>
      <BrowserRouter>
        <Gate />
      </BrowserRouter>
    </AuthProvider>
  )
}

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return <Splash />
  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="takvim" element={<Calendar />} />
        <Route path="gorevler" element={<Tasks />} />
        <Route path="listeler" element={<Lists />} />
        <Route path="profil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg text-accent">
      <Sparkles size={36} strokeWidth={1.6} className="animate-pulse motion-reduce:animate-none" aria-label="Yükleniyor" />
    </div>
  )
}

function ConfigMissing() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="card flex max-w-sm flex-col gap-2 p-6">
        <h1 className="font-display text-[22px] font-semibold">Supabase ayarları eksik</h1>
        <p className="text-[15px] text-muted">
          <code>.env.local</code> dosyasına <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> değerlerini ekleyip
          uygulamayı yeniden başlat.
        </p>
      </div>
    </div>
  )
}
