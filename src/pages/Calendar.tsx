import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import HandIcon, { type IconName } from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { Art, CardHeading, CheckBox, EditTitle, Muted, Twinkle } from '../components/ui'
import { addDays, addMonths, DAY_SHORT, formatDayTitle, formatMonthYear, isSameDay, monthGrid, weekOf } from '../lib/dates'
import type { Tag } from '../lib/demo'
import { useEditor, type EditorPreset } from '../lib/editor'
import { formatLong, formatTime, hasTime, isDone, onDay, upcoming, useItems, type Item } from '../lib/items'
import { itemsOf, useLists } from '../lib/lists'
import { useNow } from '../lib/useNow'

type Filter = 'tumu' | Tag

const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
  { key: 'tumu', label: 'Tümü', icon: 'layers' },
  { key: 'is', label: 'İş', icon: 'laptop' },
  { key: 'okul', label: 'Okul', icon: 'gradCap' },
]

const timeOf = (iso: string) => new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

export default function Calendar() {
  const { items, toggleDone } = useItems()
  const { listItems, toggleListItem } = useLists()
  const { open } = useEditor()
  const today = useNow()
  const [filter, setFilter] = useState<Filter>('tumu')
  const [view, setView] = useState<'hafta' | 'ay'>('hafta')
  const [cursor, setCursor] = useState<Date | null>(null)
  const [selected, setSelected] = useState<Date | null>(null)

  const day = selected ?? today
  const base = cursor ?? day
  const days = view === 'hafta' ? weekOf(base) : monthGrid(base)
  const step = (dir: number) => setCursor(view === 'hafta' ? addDays(base, dir * 7) : addMonths(base, dir))
  const projects = itemsOf(listItems, 'projeler').filter((p) => !p.done_at || today.getTime() - new Date(p.done_at).getTime() < 7 * 864e5)
  const matches = (i: Item) => filter === 'tumu' || i.module === filter
  const schedule = onDay(items, day).filter((i) => hasTime(i) && matches(i))
  const next = upcoming(items, today)
  const exams = next.filter((i) => i.kind === 'sinav')
  const recentlyDone = (i: Item) => isDone(i) && today.getTime() - new Date(i.done_at!).getTime() < 7 * 864e5
  const homework = items.filter((i) => i.kind === 'odev' && (!isDone(i) || recentlyDone(i)))
  // İş bölümündeki her şey (görev, toplantı, geri dönüş…) burada; tarihlisi önce
  const workTasks = items
    .filter((i) => i.module === 'is' && (!isDone(i) || recentlyDone(i)))
    .sort((a, b) => (a.starts_at ?? '9').localeCompare(b.starts_at ?? '9'))
  const add = (preset: EditorPreset) => (
    <button type="button" onClick={() => open(undefined, preset)} aria-label="Ekle" className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-white/80 text-accent-strong">
      <HandIcon name="plus" size={18} fill={false} />
    </button>
  )
  const showSchool = filter !== 'is'
  const showWork = filter !== 'okul'

  return (
    <>
      <PageHeader
        brand="Planlayıcı"
        title="İş, Okul ve Hayatın Tek Planı"
        subtitle={
          <>
            Toplantılar, teslimler, sınavlar ve projeler tek yerde, düzenli ve kontrollü.
            <Twinkle />
          </>
        }
        art="planner-hero"
      />

      <div role="tablist" aria-label="Filtre" className="grid grid-cols-3 gap-2 rounded-[20px] bg-white/40 p-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center justify-center gap-2 rounded-[16px] py-2.5 text-[19px] ${
              filter === f.key ? 'bg-accent text-accent-fg shadow-[0_8px_16px_-10px_var(--accent)]' : 'bg-surface-2/70 text-fg'
            }`}
          >
            <HandIcon name={f.icon} size={24} fill={filter === f.key ? 'rgb(255 255 255 / 0.35)' : undefined} />
            {f.label}
          </button>
        ))}
      </div>

      <section className="card flex flex-col gap-2 px-3 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label={view === 'hafta' ? 'Önceki hafta' : 'Önceki ay'} className="grid size-8 place-items-center">
            <HandIcon name="chevronLeft" size={20} />
          </button>
          <button
            type="button"
            onClick={() => setView(view === 'hafta' ? 'ay' : 'hafta')}
            aria-label={view === 'hafta' ? 'Aylık görünüme geç' : 'Haftalık görünüme geç'}
            className="flex flex-1 items-center justify-center gap-1 text-[21px] first-letter:uppercase"
          >
            {formatMonthYear(view === 'hafta' ? days[3] : base)}
            <HandIcon name="chevronDown" size={18} className={view === 'ay' ? 'rotate-180' : ''} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label={view === 'hafta' ? 'Sonraki hafta' : 'Sonraki ay'} className="grid size-8 place-items-center">
            <HandIcon name="chevronRight" size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              setCursor(null)
              setSelected(null)
            }}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-[15px] text-accent-strong"
          >
            <HandIcon name="calendar" size={18} />
            Bugün
          </button>
        </div>
        <div className="grid grid-cols-7">
          {DAY_SHORT.map((name) => (
            <span key={name} className="text-center text-[14px] text-fg/65">
              {name}
            </span>
          ))}
        </div>
        <ol className={`grid grid-cols-7 ${view === 'ay' ? 'gap-y-0.5' : ''}`}>
          {days.map((d) => {
            const active = isSameDay(d, day)
            const isToday = isSameDay(d, today)
            const outside = view === 'ay' && d.getMonth() !== base.getMonth()
            const dots = onDay(items, d).filter(matches).length
            return (
              <li key={d.toISOString()} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  aria-pressed={active}
                  aria-label={formatDayTitle(d)}
                  className={`flex ${view === 'ay' ? 'h-[42px] w-[40px] text-[17px]' : 'h-[48px] w-[42px] text-[19px]'} flex-col items-center justify-center rounded-[13px] ${
                    active ? 'bg-accent text-accent-fg shadow-[0_8px_16px_-10px_var(--accent)]' : isToday ? 'border border-accent text-accent-strong' : outside ? 'text-fg/30' : ''
                  }`}
                >
                  {d.getDate()}
                  <span className="flex h-1.5 gap-0.5" aria-hidden>
                    {Array.from({ length: Math.min(dots, 3) }, (_, k) => (
                      <span key={k} className={`size-1.5 rounded-full ${active ? 'bg-white' : 'bg-accent'}`} />
                    ))}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="card flex flex-col gap-1 p-3">
        <div className="flex items-center gap-2 pb-1">
          <HandIcon name="calendar" size={26} />
          <h2 className="text-[21px]">Günün Programı</h2>
          <span className="ml-auto text-[15px] text-accent-strong first-letter:uppercase">{formatDayTitle(day)}</span>
        </div>
        {schedule.length > 0 ? (
          <ol className="relative flex flex-col before:absolute before:top-5 before:bottom-5 before:left-[4px] before:w-[1.5px] before:bg-accent/45">
            {schedule.map((item, i) => (
              <li key={item.id} className="relative flex items-center gap-2 pl-5">
                <span className="absolute left-0 size-[10px] rounded-full border-[1.5px] border-fg/70 bg-accent" aria-hidden />
                <div className={`flex min-w-0 flex-1 items-center gap-2 py-2 ${i < schedule.length - 1 ? 'border-b border-dashed border-line' : ''}`}>
                  <span className="w-[86px] shrink-0 text-[15.5px]">
                    {formatTime(item)}
                    {item.ends_at && ` – ${timeOf(item.ends_at)}`}
                  </span>
                  {(item.module === 'is' || item.module === 'okul') && <TagChip tag={item.module} />}
                  <div className="flex min-w-0 flex-col leading-tight">
                    <EditTitle item={item} className={`truncate text-[16px] ${isDone(item) ? 'text-muted line-through' : ''}`} />
                    {item.notes && <span className="truncate text-[13.5px] text-fg/65">{item.notes}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Muted>Bu gün için plan yok. Sağ alttaki + ile ekleyebilirsin.</Muted>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        {showSchool && (
          <Panel icon="gradCap" title="Yaklaşan Sınavlar" subtitle={`${exams.length} sınav`} art="books-cap" artClass="w-[46%] -right-3" action={add({ module: 'okul', kind: 'sinav', reminders: [1440] })}>
            {exams.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {exams.map((exam) => (
                  <li key={exam.id} className="flex items-start gap-2 leading-tight">
                    <HandIcon name="calendar" size={20} className="shrink-0" />
                    <div className="flex flex-col">
                      <EditTitle item={exam} className="text-[15px]" />
                      <span className="text-[13.5px] text-fg/65">{formatLong(exam)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Muted>Yaklaşan sınav yok.</Muted>
            )}
          </Panel>
        )}

        {showSchool && (
          <Panel icon="clipboard" title="Ödevler" subtitle={`${homework.length} ödev`} art="laptop" artClass="w-[46%] -right-4" action={add({ module: 'okul', kind: 'odev', reminders: [1440] })}>
            <Checklist
              items={homework}
              onToggle={toggleDone}
              note={(i) => (isDone(i) ? 'Teslim edildi' : i.starts_at ? `Son teslim: ${formatLong(i).split(',')[0]}` : '')}
              empty="Ödev yok."
            />
          </Panel>
        )}

        <Panel
          icon="target"
          title="Projeler"
          subtitle={`${projects.filter((p) => !p.done_at).length} aktif proje`}
          art="sprout"
          artClass="w-[26%]"
          action={
            <Link to="/listeler/projeler" aria-label="Proje ekle" className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-white/80 text-accent-strong">
              <HandIcon name="plus" size={18} fill={false} />
            </Link>
          }
        >
          {projects.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {projects.map((p) => (
                <li key={p.id} className="flex items-start gap-2 leading-tight">
                  <CheckBox checked={!!p.done_at} label={p.title} onToggle={() => toggleListItem(p.id)} />
                  <span className={`text-[15px] ${p.done_at ? 'text-muted line-through' : ''}`}>{p.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Muted>Aktif proje yok.</Muted>
          )}
        </Panel>

        {showWork && (
          <Panel
            icon="briefcase"
            title="İş Takibi"
            subtitle={`${workTasks.filter((i) => !isDone(i)).length} kayıt`}
            art="coffee"
            artClass="w-[34%] -top-1 bottom-auto"
            action={add({ module: 'is', kind: 'gorev', reminders: [0] })}
          >
            <Checklist items={workTasks} onToggle={toggleDone} note={(i) => (i.starts_at ? formatLong(i) : '')} empty="İş kaydı yok. İş bölümüne eklediğin görev ve toplantılar burada görünür." />
          </Panel>
        )}
      </div>
    </>
  )
}

function TagChip({ tag }: { tag: Tag }) {
  const isWork = tag === 'is'
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-[10px] px-2 py-0.5 text-[14px] ${isWork ? 'bg-surface-2 text-accent-strong' : 'bg-lavender text-lavender-fg'}`}
    >
      <HandIcon name={isWork ? 'laptop' : 'gradCap'} size={18} fill={isWork ? undefined : '#d8cbec'} />
      {isWork ? 'İş' : 'Okul'}
    </span>
  )
}

function Panel({ icon, title, subtitle, art, artClass, action, children }: { icon: IconName; title: string; subtitle: string; art: string; artClass: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card relative isolate flex flex-col gap-2.5 overflow-hidden p-3">
      <Art name={art} className={`absolute right-0 bottom-0 -z-10 opacity-90 ${artClass}`} />
      <div className="flex items-start justify-between gap-1">
        <CardHeading icon={icon} title={title} subtitle={subtitle} />
        {action}
      </div>
      {children}
    </section>
  )
}

function Checklist({ items, onToggle, note, empty }: { items: Item[]; onToggle: (id: string) => void; note?: (item: Item) => string; empty: string }) {
  if (items.length === 0) return <Muted>{empty}</Muted>
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2 leading-tight">
          <CheckBox checked={isDone(item)} label={item.title} onToggle={() => onToggle(item.id)} />
          <div className="flex flex-col">
            <EditTitle item={item} className={`text-[15px] ${isDone(item) ? 'text-muted line-through' : ''}`} />
            {note?.(item) && <span className="text-[13px] text-fg/65">{note(item)}</span>}
          </div>
        </li>
      ))}
    </ul>
  )
}
