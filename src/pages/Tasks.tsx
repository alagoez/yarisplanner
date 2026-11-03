import { useState } from 'react'
import HandIcon from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { CheckBox, Muted, Twinkle } from '../components/ui'
import { useEditor } from '../lib/editor'
import { addDays } from '../lib/dates'
import { formatShort, isDone, startOf, useItems, type Item } from '../lib/items'
import { useNow } from '../lib/useNow'

type View = 'bugun' | 'yaklasan' | 'geciken' | 'tamamlanan'

const VIEWS: { key: View; label: string; empty: string }[] = [
  { key: 'bugun', label: 'Bugün', empty: 'Bugün için kayıt yok. Sağ alttaki + ile ekleyebilirsin.' },
  { key: 'yaklasan', label: 'Yaklaşan', empty: 'Yaklaşan kayıt yok.' },
  { key: 'geciken', label: 'Geciken', empty: 'Geciken kayıt yok.' },
  { key: 'tamamlanan', label: 'Bitti', empty: 'Henüz tamamlanan kayıt yok.' },
]

const REPEAT_LABEL = { gunluk: 'her gün', haftalik: 'her hafta', aylik: 'her ay', yillik: 'her yıl' }

export default function Tasks() {
  const { items, toggleDone } = useItems()
  const { open } = useEditor()
  const now = useNow()
  const [view, setView] = useState<View>('bugun')

  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startTomorrow = addDays(startToday, 1)
  const inView = (i: Item) => {
    const d = startOf(i)
    if (view === 'tamamlanan') return isDone(i)
    if (isDone(i)) return false
    if (view === 'bugun') return !d || (d >= startToday && d < startTomorrow)
    if (view === 'yaklasan') return !!d && d >= startTomorrow
    return !!d && d < startToday
  }
  const shown = items
    .filter(inView)
    .sort((a, b) => (view === 'tamamlanan' ? (b.done_at ?? '').localeCompare(a.done_at ?? '') : (a.starts_at ?? '9').localeCompare(b.starts_at ?? '9')))

  return (
    <>
      <PageHeader
        title="Görevler"
        subtitle={
          <>
            Yapılacakların, gecikenler ve bitenler
            <Twinkle />
          </>
        }
        art="notebook"
      />

      <div role="tablist" aria-label="Görünüm" className="card grid grid-cols-4 gap-1 p-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view === v.key}
            onClick={() => setView(v.key)}
            className={`rounded-[14px] py-2 text-[17px] ${view === v.key ? 'bg-accent text-accent-fg' : 'text-fg/75'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <section className="card flex flex-col p-1.5">
        {shown.length > 0 ? (
          <ul className="flex flex-col divide-y divide-dashed divide-line">
            {shown.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-2 py-2.5">
                <CheckBox checked={isDone(item)} label={item.title} onToggle={() => toggleDone(item.id)} />
                <button type="button" onClick={() => open(item)} className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                  <span className={`text-[17px] ${isDone(item) ? 'text-muted line-through' : ''}`}>{item.title}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-[14px] text-fg/65">
                    {formatShort(item)}
                    {item.repeat && <span>· {REPEAT_LABEL[item.repeat]}</span>}
                    {item.reminders.length > 0 && !isDone(item) && <HandIcon name="bell" size={15} className="text-accent-strong" />}
                  </span>
                </button>
                <button type="button" onClick={() => open(item)} aria-label={`${item.title} kaydını düzenle`} className="shrink-0 p-1 text-fg/55">
                  <HandIcon name="pencil" size={20} fill={false} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-2">
            <Muted>{VIEWS.find((v) => v.key === view)!.empty}</Muted>
          </div>
        )}
      </section>
    </>
  )
}
