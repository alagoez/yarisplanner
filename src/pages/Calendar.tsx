import { useState, type ReactNode } from 'react'
import HandIcon, { type IconName } from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { Art, CardHeading, CheckBox, Muted, Twinkle } from '../components/ui'
import { addDays, DAY_SHORT, formatDayTitle, formatMonthYear, isSameDay, weekOf } from '../lib/dates'
import { useAppData, type CheckItem, type Tag } from '../lib/demo'
import { useNow } from '../lib/useNow'

type Filter = 'tumu' | Tag

const FILTERS: { key: Filter; label: string; icon: IconName }[] = [
  { key: 'tumu', label: 'Tümü', icon: 'layers' },
  { key: 'is', label: 'İş', icon: 'laptop' },
  { key: 'okul', label: 'Okul', icon: 'gradCap' },
]

export default function Calendar() {
  const data = useAppData()
  const today = useNow()
  const [filter, setFilter] = useState<Filter>('tumu')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected, setSelected] = useState<Date | null>(null)
  const [homework, setHomework] = useState(data.homework)
  const [projects, setProjects] = useState(data.projects)
  const [workTasks, setWorkTasks] = useState(data.workTasks)

  const day = selected ?? today
  const days = weekOf(addDays(today, weekOffset * 7))
  const schedule = isSameDay(day, today) ? data.schedule.filter((item) => filter === 'tumu' || item.tag === filter) : []
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
        unread={data.summary.reminders > 0}
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
          <button type="button" onClick={() => setWeekOffset(weekOffset - 1)} aria-label="Önceki hafta" className="grid size-8 place-items-center">
            <HandIcon name="chevronLeft" size={20} />
          </button>
          <span className="flex flex-1 items-center justify-center gap-1 text-[21px] first-letter:uppercase">
            {formatMonthYear(days[3])}
            <HandIcon name="chevronDown" size={18} />
          </span>
          <button type="button" onClick={() => setWeekOffset(weekOffset + 1)} aria-label="Sonraki hafta" className="grid size-8 place-items-center">
            <HandIcon name="chevronRight" size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              setWeekOffset(0)
              setSelected(null)
            }}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1 text-[15px] text-accent-strong"
          >
            <HandIcon name="calendar" size={18} />
            Bugün
          </button>
        </div>
        <ol className="grid grid-cols-7">
          {days.map((d, i) => {
            const active = isSameDay(d, day)
            const dots = isSameDay(weekOf(d)[0], weekOf(today)[0]) ? data.weekDots[i] : 0
            return (
              <li key={d.toISOString()} className="flex flex-col items-center gap-1">
                <span className="text-[14px] text-fg/65">{DAY_SHORT[i]}</span>
                <button
                  type="button"
                  onClick={() => setSelected(d)}
                  aria-pressed={active}
                  aria-label={formatDayTitle(d)}
                  className={`flex h-[48px] w-[42px] flex-col items-center justify-center rounded-[13px] text-[19px] ${
                    active ? 'bg-accent text-accent-fg shadow-[0_8px_16px_-10px_var(--accent)]' : ''
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
              <li key={item.start} className="relative flex items-center gap-2 pl-5">
                <span className="absolute left-0 size-[10px] rounded-full border-[1.5px] border-fg/70 bg-accent" aria-hidden />
                <div className={`flex min-w-0 flex-1 items-center gap-2 py-2 ${i < schedule.length - 1 ? 'border-b border-dashed border-line' : ''}`}>
                  <span className="w-[86px] shrink-0 text-[15.5px]">
                    {item.start} – {item.end}
                  </span>
                  {item.tag && <TagChip tag={item.tag} />}
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[16px]">{item.title}</span>
                    {item.detail && <span className="truncate text-[13.5px] text-fg/65">{item.detail}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Muted>Bu gün için plan yok.</Muted>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        {showSchool && (
          <Panel icon="gradCap" title="Yaklaşan Sınavlar" subtitle={`${data.exams.length} sınav`} art="books-cap" artClass="w-[46%] -right-3">
            {data.exams.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {data.exams.map((exam) => (
                  <li key={exam.title} className="flex items-start gap-2 leading-tight">
                    <HandIcon name="calendar" size={20} className="shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[15px]">{exam.title}</span>
                      <span className="text-[13.5px] text-fg/65">{exam.when}</span>
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
          <Panel icon="clipboard" title="Ödevler" subtitle={`${homework.length} ödev`} art="laptop" artClass="w-[46%] -right-4">
            <Checklist items={homework} onChange={setHomework} empty="Ödev yok." />
          </Panel>
        )}

        <Panel icon="target" title="Projeler" subtitle={`${projects.length} aktif proje`} art="sprout" artClass="w-[26%]">
          {projects.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {projects
                .filter((p) => filter === 'tumu' || p.tag === filter)
                .map((p) => (
                  <li key={p.title} className="flex items-start gap-2 leading-tight">
                    <CheckBox
                      checked={!!p.done}
                      label={p.title}
                      onToggle={() => setProjects(projects.map((x) => (x === p ? { ...x, done: !x.done } : x)))}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[15px]">{p.title}</span>
                      <span className="text-[13px] text-fg/65">{p.detail}</span>
                      <div className="flex items-center gap-2">
                        <span className="h-[7px] flex-1 overflow-hidden rounded-full border border-fg/25 bg-surface-2">
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${p.progress}%` }} />
                        </span>
                        <span className="text-[13px] text-fg/70">%{p.progress}</span>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <Muted>Aktif proje yok.</Muted>
          )}
        </Panel>

        {showWork && (
          <Panel icon="briefcase" title="İş Takibi" subtitle={`${workTasks.length} görev`} art="coffee" artClass="w-[34%] -top-1 bottom-auto">
            <Checklist items={workTasks} onChange={setWorkTasks} empty="İş görevi yok." />
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

function Panel({ icon, title, subtitle, art, artClass, children }: { icon: IconName; title: string; subtitle: string; art: string; artClass: string; children: ReactNode }) {
  return (
    <section className="card relative isolate flex flex-col gap-2.5 overflow-hidden p-3">
      <Art name={art} className={`absolute right-0 bottom-0 -z-10 opacity-90 ${artClass}`} />
      <CardHeading icon={icon} title={title} subtitle={subtitle} />
      {children}
    </section>
  )
}

function Checklist({ items, onChange, empty }: { items: CheckItem[]; onChange: (items: CheckItem[]) => void; empty: string }) {
  if (items.length === 0) return <Muted>{empty}</Muted>
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={item.title} className="flex items-start gap-2 leading-tight">
          <CheckBox
            checked={!!item.done}
            label={item.title}
            onToggle={() => onChange(items.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
          />
          <div className="flex flex-col">
            <span className={`text-[15px] ${item.done ? 'text-muted line-through' : ''}`}>{item.title}</span>
            {item.note && <span className="text-[13px] text-fg/65">{item.note}</span>}
          </div>
        </li>
      ))}
    </ul>
  )
}
