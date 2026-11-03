import { useState, type FormEvent } from 'react'
import { LogoMark } from '../components/HandIcon'
import { Art } from '../components/ui'
import { supabase } from '../lib/supabase'

type Mode = 'giris' | 'kayit' | 'sifre'

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
    } else if (mode === 'sifre') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      if (error) setError(toTurkish(error.message))
      else setNotice(`Bu e-postayla bir hesap varsa ${email} adresine şifre yenileme bağlantısı gönderdik. Bağlantıya dokunup yeni şifreni belirle.`)
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
    'w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[18px] text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none'

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-bg px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Art name="home-hero" className="w-[78%] max-w-[300px]" />
          <h1 className="flex items-center gap-2 font-display text-[48px] leading-none font-bold">
            <LogoMark size={38} />
            Asistanım
          </h1>
          <p className="text-[17px] text-muted">Görevlerin, takvimin ve listelerin tek yerde</p>
        </div>

        {mode === 'sifre' ? (
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-[24px]">Şifreni mi unuttun?</h2>
            <p className="text-[16px] text-muted">E-postanı yaz, yeni şifre belirlemen için bir bağlantı gönderelim.</p>
          </div>
        ) : (
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
              className={`rounded-2xl py-2.5 text-[18px] ${mode === m ? 'bg-accent text-accent-fg' : 'text-muted'}`}
            >
              {m === 'giris' ? 'Giriş yap' : 'Hesap oluştur'}
            </button>
          ))}
        </div>
        )}

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
          {mode !== 'sifre' && (
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
          )}

          {error && <p role="alert" className="px-1 text-[16px] text-danger">{error}</p>}
          {notice && <p role="status" className="rounded-2xl bg-surface-2 px-4 py-3 text-[16px]">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-2xl bg-accent py-3 text-[20px] text-accent-fg disabled:opacity-60"
          >
            {busy ? 'Bekle…' : mode === 'giris' ? 'Giriş yap' : mode === 'kayit' ? 'Hesap oluştur' : 'Bağlantıyı gönder'}
          </button>

          {mode !== 'kayit' && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'sifre' ? 'giris' : 'sifre')
                setError('')
                setNotice('')
              }}
              className="self-center py-1 text-[16px] text-accent-strong"
            >
              {mode === 'sifre' ? 'Girişe dön' : 'Şifremi unuttum'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
