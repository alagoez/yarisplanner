import { useState } from 'react'
import HandIcon from '../components/HandIcon'
import NotificationCard from '../components/NotificationCard'
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
      <PageHeader title="Profil" art="sprout" />

      <section className="card flex items-center gap-4 p-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-fg/60 bg-[var(--icon-fill)] font-display text-[30px] font-bold">
          {(fullName || email).charAt(0).toLocaleUpperCase('tr-TR')}
        </span>
        <div className="flex min-w-0 flex-col">
          {fullName && <span className="text-[22px] leading-tight">{fullName}</span>}
          <span className="truncate text-[15px] text-muted">{email}</span>
        </div>
      </section>

      <NotificationCard />

      <section className="card flex flex-col divide-y divide-dashed divide-line">
        <Row label="Sürüm" value="0.3" />
      </section>

      <button
        onClick={signOut}
        disabled={signingOut}
        className="card flex items-center justify-center gap-2 py-3.5 text-[18px] text-danger disabled:opacity-60"
      >
        <HandIcon name="logOut" size={22} />
        {signingOut ? 'Çıkış yapılıyor…' : 'Çıkış yap'}
      </button>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 text-[17px]">
      <span>{label}</span>
      <span className="text-right text-muted">{value}</span>
    </div>
  )
}
