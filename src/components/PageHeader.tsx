import type { ReactNode } from 'react'
import { Link } from 'react-router'
import HandIcon, { LogoMark } from './HandIcon'
import { isDone, onDay, useItems } from '../lib/items'
import { useNow } from '../lib/useNow'
import { Art } from './ui'

type Props = {
  title: ReactNode
  subtitle?: ReactNode
  brand?: string
  /** public/art altındaki başlık çizimi */
  art?: string
}

export default function PageHeader({ title, subtitle, brand = 'Asistanım', art }: Props) {
  const { items } = useItems()
  const now = useNow()
  // Bugün henüz bitmemiş, hatırlatmalı kayıt varsa zilde kırmızı nokta
  const unread = onDay(items, now).some((i) => !isDone(i) && i.reminders.length > 0)
  return (
    <header className="relative flex min-h-[200px] flex-col gap-4 pb-3">
      {art && <Art name={art} className="absolute top-9 -right-3 w-[58%] max-w-[270px]" />}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={32} />
          <span className="font-display text-[34px] leading-none font-bold">{brand}</span>
        </div>
        <Link
          to="/profil"
          aria-label={unread ? 'Bildirimler, okunmamış var' : 'Bildirimler'}
          className="relative grid size-11 place-items-center rounded-full bg-white/85 text-fg shadow-[0_6px_16px_-8px_var(--shadow)]"
        >
          <HandIcon name="bell" size={24} />
          {unread && <span className="absolute top-2 right-2.5 size-2 rounded-full bg-[#e0475b] ring-2 ring-white" aria-hidden />}
        </Link>
      </div>

      <div className="relative flex max-w-[60%] flex-col gap-1">
        <h1 className="font-display text-[42px] leading-[0.95] font-bold">
          {title}
          <HandIcon name="heart" size={28} fill="var(--icon-fill)" strokeWidth={1.4} className="ml-1.5 inline-block -translate-y-1 align-middle text-accent" />
        </h1>
        {subtitle && <p className="text-[16px] leading-snug text-fg/75">{subtitle}</p>}
      </div>
    </header>
  )
}
