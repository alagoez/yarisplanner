import {
  Briefcase,
  CalendarDays,
  CircleCheck,
  Flower2,
  GraduationCap,
  Plane,
  ShoppingCart,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import WeekStrip from '../components/WeekStrip'
import { firstName, useAuth } from '../lib/auth-context'
import { greeting } from '../lib/dates'
import { useNow } from '../lib/useNow'

const MODULES: { title: string; icon: LucideIcon }[] = [
  { title: 'İş', icon: Briefcase },
  { title: 'Okul', icon: GraduationCap },
  { title: 'Akşam Yemeği', icon: UtensilsCrossed },
  { title: 'Alışveriş', icon: ShoppingCart },
  { title: 'Kişisel Bakım', icon: Flower2 },
  { title: 'Seyahat', icon: Plane },
]

export default function Home() {
  const { session } = useAuth()
  const now = useNow()
  const name = firstName(session)

  return (
    <>
      <PageHeader
        title={name ? `${greeting(now)} ${name}` : greeting(now)}
        subtitle="Yeni bir gün, yeni hedefler"
      />

      <section className="card flex items-center gap-4 px-4 py-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-accent">
          <CalendarDays size={24} strokeWidth={1.6} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="text-[15px] font-semibold">Bugünün Özeti</h2>
          <p className="text-[14px] text-muted tabular-nums">0 etkinlik · 0 görev · 0 hatırlatma</p>
        </div>
      </section>

      <WeekStrip today={now} />

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
        <section className="card flex flex-col gap-3 p-4">
          <CardTitle icon={CalendarDays} title="Bugün" subtitle="Bugünkü programın" />
          <EmptyState>Bugün için kayıt yok.</EmptyState>
        </section>
        <section className="card flex flex-col gap-3 p-4">
          <CardTitle icon={CircleCheck} title="Görevler" subtitle="Yaklaşan görevlerin" />
          <EmptyState>Yaklaşan görev yok.</EmptyState>
        </section>
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {MODULES.map(({ title, icon: Icon }) => (
          <li key={title} className="card flex items-center gap-3 p-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
              <Icon size={20} strokeWidth={1.6} aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-display text-[17px] font-semibold">{title}</span>
              <span className="text-[13px] text-muted">Kayıt yok</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function CardTitle({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
        <Icon size={20} strokeWidth={1.6} aria-hidden />
      </span>
      <div className="flex flex-col">
        <h2 className="font-display text-[19px] leading-tight font-semibold">{title}</h2>
        <span className="text-[13px] text-muted">{subtitle}</span>
      </div>
    </div>
  )
}
