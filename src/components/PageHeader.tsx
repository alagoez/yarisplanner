import { Heart, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = { title: string; subtitle?: ReactNode }

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="flex flex-col gap-4 pb-2">
      <div className="flex items-center gap-2 text-accent">
        <Sparkles size={24} strokeWidth={1.6} aria-hidden />
        <span className="font-display text-[22px] font-medium text-fg">Asistanım</span>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-display text-[34px] leading-tight font-semibold">
          {title}
          <Heart size={24} strokeWidth={1.4} className="shrink-0 text-accent/60" aria-hidden />
        </h1>
        {subtitle && <p className="text-[15px] text-muted">{subtitle}</p>}
      </div>
    </header>
  )
}
