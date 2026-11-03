import { Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'giris' | 'kayit'

const ERRORS: [RegExp, string][] = [
  [/invalid login credentials/i, 'E-posta ya da şifre hatalı.'],
  [/email not confirmed/i, 'Önce e-postana gelen onay bağlantısına dokun.'],
  [/already registered/i, 'Bu e-postayla zaten bir hesap var. Giriş yap sekmesini kullan.'],
  [/password should be at least/i, 'Şifre en az 8 karakter olmalı.'],
  [/signups not allowed/i, 'Yeni kayıtlar kapalı.'],
  [/rate limit/i, 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar dene.'],
]

function toTurkish(message: string) {
  return ERRORS.find(([pattern]) => pattern.test(message))?.[1] ?? 'Bir sorun oldu. Bağlantını kontrol edip tekrar dene.'
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('giris')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    setNotice('')

    if (mode === 'giris') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(toTurkish(error.message))
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin },
      })
      if (error) setError(toTurkish(error.message))
      else if (!data.session) setNotice(`${email} adresine bir onay bağlantısı gönderdik. Bağlantıya dokunduktan sonra giriş yapabilirsin.`)
    }
    setBusy(false)
  }

  const inputClass =
    'w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[16px] text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none'

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-bg px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-16 place-items-center rounded-[20px] bg-accent text-accent-fg shadow-sm">
            <Sparkles size={32} strokeWidth={1.6} aria-hidden />
          </span>
          <h1 className="font-display text-[34px] font-semibold">Asistanım</h1>
          <p className="text-[15px] text-muted">Görevlerin, takvimin ve listelerin tek yerde</p>
        </div>

        <div role="tablist" aria-label="Giriş türü" className="card grid grid-cols-2 gap-1 p-1">
          {(['giris', 'kayit'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setError('')
                setNotice('')
              }}
              className={`rounded-2xl py-2.5 text-[15px] font-medium ${mode === m ? 'bg-accent text-accent-fg' : 'text-muted'}`}
            >
              {m === 'giris' ? 'Giriş yap' : 'Hesap oluştur'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'kayit' && (
            <input
              id="name"
              className={inputClass}
              placeholder="Adın"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            id="email"
            type="email"
            className={inputClass}
            placeholder="E-posta"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            id="password"
            type="password"
            className={inputClass}
            placeholder="Şifre"
            autoComplete={mode === 'giris' ? 'current-password' : 'new-password'}
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p role="alert" className="px-1 text-[14px] text-danger">{error}</p>}
          {notice && <p role="status" className="rounded-2xl bg-surface-2 px-4 py-3 text-[14px]">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-2xl bg-accent py-3.5 text-[16px] font-semibold text-accent-fg disabled:opacity-60"
          >
            {busy ? 'Bekle…' : mode === 'giris' ? 'Giriş yap' : 'Hesap oluştur'}
          </button>
        </form>
      </div>
    </div>
  )
}
