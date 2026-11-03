import { useState } from 'react'
import { addDays, DAY_SHORT, isSameDay, weekOf, weekRangeLabel } from '../lib/dates'
import HandIcon from './HandIcon'

const WEEK_LABEL: Record<number, string> = { [-1]: 'Geçen Hafta', 0: 'Bu Hafta', 1: 'Gelecek Hafta' }

/** Ana sayfadaki "Bu Hafta" şeridi; oklarla haftalar arasında gezilir. */
export default function WeekStrip({ today }: { today: Date }) {
  const [offset, setOffset] = useState(0)
  const days = weekOf(addDays(today, offset * 7))

  return (
    <section className="card flex items-center gap-0.5 py-2.5 pr-0.5 pl-0.5" aria-label="Hafta">
      <button type="button" onClick={() => setOffset(offset - 1)} aria-label="Önceki hafta" className="grid h-10 w-5 shrink-0 place-items-center">
        <HandIcon name="chevronLeft" size={20} />
      </button>
      <div className="flex w-[74px] shrink-0 flex-col leading-tight">
        <span className="text-[17px]">{WEEK_LABEL[offset] ?? 'Hafta'}</span>
        <span className="text-[13.5px] whitespace-nowrap text-fg/70">{weekRangeLabel(days)}</span>
      </div>
      <ol className="grid min-w-0 flex-1 grid-cols-7">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <li
              key={day.toISOString()}
              aria-current={isToday ? 'date' : undefined}
              className={`relative mx-px flex flex-col items-center rounded-[12px] pt-1 pb-2.5 text-[13.5px] leading-tight ${
                isToday ? 'bg-accent text-accent-fg shadow-[0_6px_14px_-8px_var(--accent)]' : 'text-fg/65'
              }`}
            >
              <span>{DAY_SHORT[i]}</span>
              <span className={`text-[17px] ${isToday ? '' : 'text-fg'}`}>{day.getDate()}</span>
              {isToday && <span className="absolute bottom-1 size-1 rounded-full bg-white" aria-hidden />}
            </li>
          )
        })}
      </ol>
      <button type="button" onClick={() => setOffset(offset + 1)} aria-label="Sonraki hafta" className="grid h-10 w-5 shrink-0 place-items-center">
        <HandIcon name="chevronRight" size={20} />
      </button>
    </section>
  )
}
