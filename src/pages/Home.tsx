import type { ReactNode } from 'react'
import { Link } from 'react-router'
import HandIcon, { type IconName } from '../components/HandIcon'
import NotificationCard from '../components/NotificationCard'
import PageHeader from '../components/PageHeader'
import { Art, CardHeading, CheckBox, EditTitle, IconChip, Muted, SeeAll, Timeline, TimelineRow, Twinkle } from '../components/ui'
import WeekStrip from '../components/WeekStrip'
import { firstName, useAuth } from '../lib/auth-context'
import { greeting } from '../lib/dates'
import { useExtras } from '../lib/demo'
import { formatLong, formatTime, hasTime, isDone, isTask, onDay, openTasks, splitRoute, upcoming, useItems, type Item } from '../lib/items'
import { useNow } from '../lib/useNow'

export default function Home() {
  const { session } = useAuth()
  const extras = useExtras()
  const { items, toggleDone } = useItems()
  const now = useNow()
  const name = firstName(session)

  const today = onDay(items, now)
  const schedule = today.filter((i) => !isTask(i) && hasTime(i))
  const tasks = openTasks(items, now).filter((i) => i.module !== 'bakim' && i.module !== 'is').slice(0, 3)
  const care = today.filter((i) => i.module === 'bakim' && isTask(i))
  const next = upcoming(items, now)
  const trip = next.find((i) => i.kind === 'seyahat')
  const events = schedule.length
  const taskCount = today.filter((i) => isTask(i) && !isDone(i)).length
  const reminders = today.reduce((n, i) => n + (isDone(i) ? 0 : i.reminders.length), 0)
  const countIn = (module: Item['module']) => next.filter((i) => i.module === module).length

  return (
    <>
      <PageHeader
        title={name ? `${greeting(now)} ${name}` : greeting(now)}
        subtitle={
          <>
            Yeni bir gün, yeni hedefler
            <Twinkle />
          </>
        }
        art="home-hero"
      />

      <section className="card relative flex items-center gap-3 px-3.5 py-3">
        <IconChip icon="calendar" />
        <h2 className="w-[64px] shrink-0 text-[17px] leading-tight">Bugünün Özeti</h2>
        <span className="h-10 w-px shrink-0 bg-line" aria-hidden />
        <div className="flex min-w-0 flex-col leading-snug">
          <span className="text-[16px]">
            {events} etkinlik · {taskCount} görev · {reminders} hatırlatma
          </span>
          <span className="text-[14.5px] text-fg/70">
            {events + taskCount > 0 ? 'Yoğun ama planlı bir gün seni bekliyor.' : 'Bugün için plan yok, kendine vakit ayır.'}
            <HandIcon name="heart" size={16} className="ml-1 inline-block -translate-y-px align-middle text-fg/70" />
          </span>
        </div>
      </section>

      <NotificationCard compact />

      <WeekStrip today={now} />

      <div className="grid grid-cols-2 gap-3">
        <section className="card flex flex-col gap-2 p-3">
          <CardHeading icon="calendar" title="Bugün" subtitle="Bugünkü programın" />
          {schedule.length > 0 ? (
            <Timeline>
              {schedule.slice(0, 3).map((item, i) => (
                <TimelineRow key={item.id} last={i === Math.min(schedule.length, 3) - 1}>
                  <span className="w-[36px] shrink-0 text-[14.5px]">{formatTime(item)}</span>
                  <EditTitle item={item} className="text-[14.5px] leading-tight" />
                </TimelineRow>
              ))}
            </Timeline>
          ) : (
            <Muted>Bugün için plan yok.</Muted>
          )}
          <div className="mt-auto pt-1">
            <SeeAll to="/takvim">Tümünü Gör</SeeAll>
          </div>
        </section>

        <section className="card flex flex-col gap-2 p-3">
          <CardHeading icon="check" title="Görevler" subtitle="Yaklaşan görevlerin" />
          {tasks.length > 0 ? (
            <ul className="flex flex-col gap-2 pt-1">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2 text-[15px] leading-tight">
                  <CheckBox checked={isDone(task)} label={task.title} onToggle={() => toggleDone(task.id)} />
                  <EditTitle item={task} className={isDone(task) ? 'text-muted line-through' : ''} />
                </li>
              ))}
            </ul>
          ) : (
            <Muted>Yaklaşan görev yok.</Muted>
          )}
          <div className="mt-auto pt-1">
            <SeeAll to="/gorevler">Tüm Görevler</SeeAll>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile to="/takvim" icon="laptop" title="İş" subtitle={count(countIn('is'), 'kayıt')} art="laptop" artHeight={58} />
        <Tile to="/takvim" icon="gradCap" title="Okul" subtitle={count(countIn('okul'), 'kayıt')} art="books-cap" artHeight={58} tone="lavender" />

        <Tile to="/listeler/aksam-yemegi" icon="utensils" title="Akşam Yemeği" subtitle="Bugünün menüsü" art="plate" artHeight={62}>
          <p className="mt-2 text-[15px] leading-snug text-fg">{extras.dinnerToday ?? 'Henüz menü eklenmedi.'}</p>
        </Tile>
        <Tile
          to="/listeler/alinacaklar"
          icon="cart"
          title="Alışveriş"
          subtitle={extras.shoppingCount > 0 ? `${extras.shoppingCount} ürün` : 'Liste boş'}
          art="bag"
          artHeight={96}
        />

        <Tile to="/listeler/kisisel-bakim" icon="lotus" title="Kişisel Bakım" subtitle="Günlük bakım planın" art="care" artHeight={64}>
          {care.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1.5">
              {care.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-[15px] text-fg">
                  <CheckBox checked={isDone(item)} label={item.title} onToggle={() => toggleDone(item.id)} />
                  <EditTitle item={item} className={isDone(item) ? 'text-muted line-through' : ''} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[15px] text-muted">Bugün için plan yok.</p>
          )}
        </Tile>
        <Tile to="/listeler/seyahat" icon="plane" title="Seyahat" subtitle="Yaklaşan seyahatin" art="plane" artHeight={60}>
          {trip ? (
            <EditTitle item={trip} className="mt-3 flex w-full items-center gap-2 rounded-[14px] border border-line bg-white/80 px-2.5 py-2">
              <HandIcon name="plane" size={22} />
              <span className="flex flex-col leading-tight text-fg">
                <span className="text-[16px]">{splitRoute(trip.title).to ? `${splitRoute(trip.title).from} → ${splitRoute(trip.title).to}` : trip.title}</span>
                <span className="text-[13.5px] text-fg/70">{formatLong(trip)}</span>
              </span>
            </EditTitle>
          ) : (
            <p className="mt-2 text-[15px] text-muted">Planlanmış seyahat yok.</p>
          )}
        </Tile>
      </div>
    </>
  )
}

function count(n: number, noun: string) {
  return n > 0 ? `${n} ${noun}` : `${noun[0].toLocaleUpperCase('tr-TR')}${noun.slice(1)} yok`
}

type TileProps = {
  to: string
  icon: IconName
  title: string
  subtitle: string
  art: string
  artHeight: number
  tone?: 'rose' | 'lavender'
  children?: ReactNode
}

/** Modül kartı: tamamı bağlantı, içindeki onay kutuları yine tıklanabilir. */
function Tile({ to, icon, title, subtitle, art, artHeight, tone = 'rose', children }: TileProps) {
  return (
    <section className={`card relative flex flex-col p-3 ${tone === 'lavender' ? '!bg-lavender' : ''}`}>
      <div className="flex items-center gap-2.5">
        <IconChip icon={icon} size={40} tone={tone} />
        <div className="flex min-w-0 flex-col">
          <h2 className="text-[20px] leading-tight">
            <Link to={to} className="after:absolute after:inset-0 after:content-['']">
              {title}
            </Link>
          </h2>
          <span className="text-[14.5px] leading-tight text-fg/70">{subtitle}</span>
        </div>
      </div>
      {children && <div className="[&_button]:relative [&_button]:z-[1]">{children}</div>}
      <Art name={art} className="mt-auto -mr-1 -mb-1 self-end pt-1" style={{ height: artHeight }} />
    </section>
  )
}
