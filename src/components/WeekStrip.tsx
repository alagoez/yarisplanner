import { DAY_SHORT, isSameDay, weekOf, weekRangeLabel } from '../lib/dates'

export default function WeekStrip({ today }: { today: Date }) {
  const days = weekOf(today)

  return (
    <section className="card flex items-center gap-3 px-4 py-3" aria-label="Bu hafta">
      <div className="flex shrink-0 flex-col">
        <span className="text-[15px] font-semibold">Bu Hafta</span>
        <span className="text-[13px] text-muted">{weekRangeLabel(days)}</span>
      </div>
      <ol className="grid flex-1 grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <li
              key={day.toISOString()}
              aria-current={isToday ? 'date' : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[13px] tabular-nums ${
                isToday ? 'bg-accent text-accent-fg shadow-sm' : 'text-muted'
              }`}
            >
              <span>{DAY_SHORT[i]}</span>
              <span className={`text-[15px] ${isToday ? 'font-semibold' : 'text-fg'}`}>{day.getDate()}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
