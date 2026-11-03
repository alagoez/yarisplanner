import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { CheckBox, Muted, Twinkle } from '../components/ui'
import { useAppData } from '../lib/demo'

const VIEWS = [
  { key: 'bugun', label: 'Bugün', empty: 'Bugün için görev yok.' },
  { key: 'yaklasan', label: 'Yaklaşan', empty: 'Yaklaşan görev yok.' },
  { key: 'geciken', label: 'Geciken', empty: 'Geciken görev yok.' },
  { key: 'tamamlanan', label: 'Bitti', empty: 'Henüz tamamlanan görev yok.' },
]

export default function Tasks() {
  const data = useAppData()
  const [view, setView] = useState(VIEWS[0])
  const [tasks, setTasks] = useState([...data.tasks, ...data.workTasks])
  const shown = view.key === 'tamamlanan' ? tasks.filter((t) => t.done) : view.key === 'bugun' ? tasks.filter((t) => !t.done) : []

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
        unread={data.summary.reminders > 0}
      />

      <div role="tablist" aria-label="Görünüm" className="card grid grid-cols-4 gap-1 p-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view.key === v.key}
            onClick={() => setView(v)}
            className={`rounded-[14px] py-2 text-[17px] ${view.key === v.key ? 'bg-accent text-accent-fg' : 'text-fg/75'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <section className="card flex flex-col gap-2.5 p-3.5">
        {shown.length > 0 ? (
          shown.map((task) => (
            <div key={task.title} className="flex items-center gap-2.5 text-[17px]">
              <CheckBox
                checked={!!task.done}
                label={task.title}
                onToggle={() => setTasks(tasks.map((t) => (t === task ? { ...t, done: !t.done } : t)))}
              />
              <span className={task.done ? 'text-muted line-through' : ''}>{task.title}</span>
            </div>
          ))
        ) : (
          <Muted>{view.empty}</Muted>
        )}
      </section>
    </>
  )
}
