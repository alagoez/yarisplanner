import {
  Cake,
  Film,
  Flower2,
  Plane,
  ShoppingCart,
  Target,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'

const LISTS: { title: string; subtitle: string; icon: LucideIcon }[] = [
  { title: 'Kişisel Bakım', subtitle: 'Bakım ve randevuların', icon: Flower2 },
  { title: 'Seyahat', subtitle: 'Geçmiş ve yaklaşan seyahatlerin', icon: Plane },
  { title: 'Alınacaklar', subtitle: 'Market, ev ve diğer alışverişler', icon: ShoppingCart },
  { title: 'Akşam Yemeği', subtitle: 'Haftalık menü planın', icon: UtensilsCrossed },
  { title: 'Filmler ve Kitaplar', subtitle: 'İzlenecek ve okunacaklar', icon: Film },
  { title: 'Hedefler', subtitle: 'Hedefler ve alışkanlıklar', icon: Target },
  { title: 'Özel Günler', subtitle: 'Doğum günleri ve etkinlikler', icon: Cake },
  { title: 'Bütçe', subtitle: 'Hedefler, abonelikler, ödemeler', icon: Wallet },
]

export default function Lists() {
  return (
    <>
      <PageHeader title="Listelerim" subtitle="Kişisel bakımın, seyahatlerin ve yaşam listelerin tek yerde" />

      <ul className="flex flex-col gap-3">
        {LISTS.map(({ title, subtitle, icon: Icon }) => (
          <li key={title} className="card flex items-center gap-4 px-4 py-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-accent">
              <Icon size={24} strokeWidth={1.6} aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-display text-[19px] leading-tight font-semibold">{title}</span>
              <span className="truncate text-[14px] text-muted">{subtitle}</span>
            </div>
            <span className="shrink-0 text-[13px] text-muted tabular-nums">0</span>
          </li>
        ))}
      </ul>
    </>
  )
}
