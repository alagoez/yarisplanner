import { LogOut } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { session } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const fullName = (session?.user.user_metadata?.full_name as string | undefined) ?? ''
  const email = session?.user.email ?? ''

  async function signOut() {
    setSigningOut(true)
    await supabase?.auth.signOut()
  }

  return (
    <>
      <PageHeader title="Profil" />

      <section className="card flex items-center gap-4 p-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent font-display text-[24px] font-semibold text-accent-fg">
          {(fullName || email).charAt(0).toLocaleUpperCase('tr-TR')}
        </span>
        <div className="flex min-w-0 flex-col">
          {fullName && <span className="font-display text-[20px] font-semibold">{fullName}</span>}
          <span className="truncate text-[14px] text-muted">{email}</span>
        </div>
      </section>

      <section className="card flex flex-col divide-y divide-line">
        <Row label="Görünüm" value="Telefonun temasına uyar" />
        <Row label="Sürüm" value="0.1 · ilk kurulum" />
      </section>

      <button
        onClick={signOut}
        disabled={signingOut}
        className="card flex items-center justify-center gap-2 py-3.5 text-[15px] font-medium text-danger disabled:opacity-60"
      >
        <LogOut size={18} aria-hidden />
        {signingOut ? 'Çıkış yapılıyor…' : 'Çıkış yap'}
      </button>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 text-[15px]">
      <span>{label}</span>
      <span className="text-right text-muted">{value}</span>
    </div>
  )
}
