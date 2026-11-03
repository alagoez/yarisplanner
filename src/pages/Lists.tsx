import { Link } from 'react-router'
import HandIcon, { type IconName } from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { Art, CardHeading, Muted, SeeAll, Timeline, TimelineRow, Twinkle } from '../components/ui'
import { useAppData } from '../lib/demo'
import { LISTS } from '../lib/lists'

export default function Lists() {
  const data = useAppData()
  const counts: Record<string, string> = {
    alinacaklar: data.shoppingCount > 0 ? `${data.shoppingCount} ürün` : 'Liste boş',
    filmler: data.movies > 0 ? `İzlenecekler listesi · ${data.movies} film` : 'İzlenecekler listesi',
    hedefler: data.goals > 0 ? `Bu ay için · ${data.goals} hedef` : 'Bu ay için hedef yok',
  }

  return (
    <>
      <PageHeader
        title="Listelerim"
        subtitle={
          <>
            Kişisel bakımın, seyahatlerin ve yaşam listelerin tek yerde
            <Twinkle />
          </>
        }
        art="lists-hero"
        unread={data.summary.reminders > 0}
      />

      <section className="card relative isolate flex flex-col gap-2 overflow-hidden p-3.5">
        <Art name="care" className="absolute -top-1 -right-2 -z-10 w-[40%] max-w-[170px]" />
        <CardHeading icon="lotus" title="Kişisel Bakım" subtitle="Yaklaşan bakım ve randevuların" />
        {data.care.length > 0 ? (
          <Timeline>
            {data.care.map((item, i) => (
              <TimelineRow key={item.when} last={i === data.care.length - 1}>
                <span className="w-[132px] shrink-0 text-[16px]">{item.when}</span>
                <span className="truncate text-[16px] text-fg/85">{item.title}</span>
              </TimelineRow>
            ))}
          </Timeline>
        ) : (
          <Muted>Yaklaşan bakım ya da randevu yok.</Muted>
        )}
        <SeeAll to="/listeler/kisisel-bakim">Tüm Bakım Görevleri</SeeAll>
      </section>

      <section className="card relative isolate flex flex-col gap-2.5 overflow-hidden p-3.5">
        <Art name="plane" className="absolute -top-2 -right-3 -z-10 w-[46%] max-w-[200px]" />
        <CardHeading icon="plane" title="Seyahat" subtitle="Yaklaşan seyahatin" />
        {data.trip ? (
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-[19px]">
                <HandIcon name="plane" size={22} />
                {data.trip.from} → {data.trip.to}
              </span>
              <span className="flex items-center gap-2 text-[16px] text-fg/80">
                <HandIcon name="calendar" size={22} />
                {data.trip.when}
              </span>
            </div>
            {data.trip.reminder && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-white/70 px-3 py-1 text-[15px] text-accent-strong">
                <HandIcon name="bell" size={18} />
                Hatırlatma var
              </span>
            )}
          </div>
        ) : (
          <Muted>Planlanmış seyahat yok.</Muted>
        )}
      </section>

      <ul className="flex flex-col gap-3">
        {LISTS.filter((l) => l.slug !== 'kisisel-bakim' && l.slug !== 'seyahat').map((list) => (
          <ListRow key={list.slug} to={`/listeler/${list.slug}`} icon={list.icon} title={list.title} subtitle={counts[list.slug] ?? list.subtitle} art={list.art} />
        ))}
      </ul>
    </>
  )
}

function ListRow({ to, icon, title, subtitle, art }: { to: string; icon: IconName; title: string; subtitle: string; art?: string }) {
  return (
    <li>
      <Link to={to} className="card relative isolate flex min-h-[84px] items-center gap-3 overflow-hidden px-3.5 py-3">
        {art && <Art name={art} className="absolute right-8 bottom-0 -z-10 h-[92%] w-auto" />}
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-surface-2">
          <HandIcon name={icon} size={30} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[21px] leading-tight">{title}</span>
          <span className="truncate text-[15px] text-fg/70">{subtitle}</span>
        </div>
        <HandIcon name="chevronRight" size={20} />
      </Link>
    </li>
  )
}
