import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import WeekStrip from '../components/WeekStrip'
import { formatFullDate } from '../lib/dates'
import { useNow } from '../lib/useNow'

const FILTERS = ['Tümü', 'İş', 'Okul'] as const

export default function Calendar() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Tümü')
  const today = useNow()

  return (
    <>
      <PageHeader title="Planlayıcı" subtitle="İş, okul ve hayatın tek planı" />

      <div role="tablist" aria-label="Filtre" className="card grid grid-cols-3 gap-1 p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-2xl py-2.5 text-[15px] font-medium ${
              filter === f ? 'bg-accent text-accent-fg' : 'text-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <WeekStrip today={today} />

      <section className="card flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-[19px] font-semibold">Bugünün Programı</h2>
          <span className="text-[13px] text-accent first-letter:uppercase">{formatFullDate(today)}</span>
        </div>
        <EmptyState>{filter === 'Tümü' ? 'Bugün için kayıt yok.' : `Bugün ${filter} kaydı yok.`}</EmptyState>
      </section>
    </>
  )
}
