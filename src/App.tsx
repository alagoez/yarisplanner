import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppShell from './components/AppShell'
import { HandFilters, LogoMark } from './components/HandIcon'
import { AuthProvider } from './lib/auth'
import { useAuth } from './lib/auth-context'
import { supabase } from './lib/supabase'
import Calendar from './pages/Calendar'
import Dinner from './pages/Dinner'
import Home from './pages/Home'
import ListDetail from './pages/ListDetail'
import Lists from './pages/Lists'
import Login from './pages/Login'
import NewPassword from './pages/NewPassword'
import Profile from './pages/Profile'
import Tasks from './pages/Tasks'

export default function App() {
  if (!supabase) return <ConfigMissing />

  return (
    <AuthProvider>
      <HandFilters />
      <BrowserRouter>
        <Gate />
      </BrowserRouter>
    </AuthProvider>
  )
}

function Gate() {
  const { session, loading, recovery } = useAuth()
  if (loading) return <Splash />
  if (recovery && session) return <NewPassword />
  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="takvim" element={<Calendar />} />
        <Route path="gorevler" element={<Tasks />} />
        <Route path="listeler" element={<Lists />} />
        <Route path="listeler/aksam-yemegi" element={<Dinner />} />
        <Route path="listeler/:slug" element={<ListDetail />} />
        <Route path="profil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg" role="status" aria-label="Yükleniyor">
      <span className="animate-pulse motion-reduce:animate-none">
        <LogoMark size={48} />
      </span>
    </div>
  )
}

function ConfigMissing() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div className="card flex max-w-sm flex-col gap-2 p-6">
        <h1 className="font-display text-[30px] font-bold">Supabase ayarları eksik</h1>
        <p className="text-[15px] text-muted">
          <code>.env.local</code> dosyasına <code>VITE_SUPABASE_URL</code> ve <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> değerlerini ekleyip
          uygulamayı yeniden başlat.
        </p>
      </div>
    </div>
  )
}
