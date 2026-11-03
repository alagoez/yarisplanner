import { useState, type FormEvent } from 'react'
import { LogoMark } from '../components/HandIcon'
import { Art } from '../components/ui'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

/** Şifre yenileme bağlantısından gelindiğinde yeni şifre belirleme ekranı. */
export default function NewPassword() {
  const { endRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password !== again) {
      setError('İki şifre aynı değil.')
      return
    }
    setBusy(true)
    setError('')
    const { error } = await supabase!.auth.updateUser({ password })
    if (error) {
      setError(/should be different/i.test(error.message) ? 'Yeni şifre eskisinden farklı olmalı.' : 'Şifre değiştirilemedi. Bağlantının süresi dolmuş olabilir; yeniden iste.')
      setBusy(false)
      return
    }
    endRecovery()
  }

  const inputClass =
    'w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[18px] text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none'

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-bg px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Art name="notebook" className="w-[55%] max-w-[220px]" />
          <h1 className="flex items-center gap-2 font-display text-[44px] leading-none font-bold">
            <LogoMark size={34} />
            Yeni şifre
          </h1>
          <p className="text-[17px] text-muted">Hesabın için yeni bir şifre belirle.</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            id="new-password"
            type="password"
            className={inputClass}
            placeholder="Yeni şifre (en az 8 karakter)"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            id="new-password-again"
            type="password"
            className={inputClass}
            placeholder="Yeni şifre tekrar"
            autoComplete="new-password"
            minLength={8}
            value={again}
            onChange={(e) => setAgain(e.target.value)}
            required
          />
          {error && (
            <p role="alert" className="px-1 text-[16px] text-danger">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="mt-1 rounded-2xl bg-accent py-3 text-[20px] text-accent-fg disabled:opacity-60">
            {busy ? 'Kaydediliyor…' : 'Şifreyi kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
