import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

const VIEWS = [
  { key: 'bugun', label: 'Bugün', empty: 'Bugün için görev yok.' },
  { key: 'yaklasan', label: 'Yaklaşan', empty: 'Yaklaşan görev yok.' },
  { key: 'geciken', label: 'Geciken', empty: 'Geciken görev yok.' },
  { key: 'tamamlanan', label: 'Bitti', empty: 'Henüz tamamlanan görev yok.' },
]

export default function Tasks() {
  const [view, setView] = useState(VIEWS[0])

  return (
    <>
      <PageHeader title="Görevler" subtitle="Yapılacakların, gecikenler ve bitenler" />

      <div role="tablist" aria-label="Görünüm" className="card grid grid-cols-4 gap-1 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view.key === v.key}
            onClick={() => setView(v)}
            className={`rounded-2xl py-2.5 text-[14px] font-medium ${
              view.key === v.key ? 'bg-accent text-accent-fg' : 'text-muted'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <section className="card p-4">
        <EmptyState>{view.empty}</EmptyState>
      </section>
    </>
  )
}
