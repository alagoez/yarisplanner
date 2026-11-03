import { useState } from 'react'
import HandIcon from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { Art, CheckBox, IconChip, Muted, Twinkle } from '../components/ui'
import { dayIndex, DAY_SHORT, weekOf, weekRangeLabel } from '../lib/dates'
import { useExtras } from '../lib/demo'
import { useNow } from '../lib/useNow'

export default function Dinner() {
  const data = useExtras()
  const today = useNow()
  const [shopping, setShopping] = useState(data.shopping)
  const todayIndex = dayIndex(today)

  return (
    <>
      <PageHeader
        title="Akşam Yemeği"
        subtitle={
          <>
            Haftalık menü planı ve alışveriş listen
            <Twinkle />
          </>
        }
        art="dinner-hero"
      />

      <div className="card grid grid-cols-2 gap-1 p-1.5">
        <a href="#menu" className="flex items-center gap-2.5 rounded-[14px] bg-surface-2/80 px-2.5 py-2">
          <IconChip icon="calendar" size={38} />
          <span className="flex flex-col leading-tight">
            <span className="text-[17px]">Haftalık Menü</span>
            <span className="text-[13.5px] text-fg/65">Akşam yemekleri</span>
          </span>
        </a>
        <a href="#alisveris" className="flex items-center gap-2.5 rounded-[14px] px-2.5 py-2">
          <HandIcon name="cart" size={30} className="shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-[17px]">Alışveriş Listesi</span>
            <span className="text-[13.5px] text-fg/65">Gerekli malzemeler</span>
          </span>
        </a>
      </div>

      <section id="menu" className="card flex scroll-mt-4 flex-col gap-1 p-3">
        <div className="flex items-center gap-2 pb-1">
          <HandIcon name="calendar" size={26} />
          <h2 className="text-[19px] leading-tight">Bu Haftanın Akşam Yemeği Planı</h2>
          <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[14px] text-fg/75">
            {weekRangeLabel(weekOf(today))}
            <HandIcon name="chevronDown" size={16} />
          </span>
        </div>
        <ul className="flex flex-col">
          {DAY_SHORT.map((day, i) => {
            const meal = data.meals.find((m) => m.day === i)?.meal
            const isToday = i === todayIndex
            return (
              <li
                key={day}
                className={`flex items-center gap-3 rounded-[12px] px-1.5 py-1.5 ${isToday ? 'bg-surface-2/80' : 'border-b border-dashed border-line last:border-0'}`}
              >
                <span
                  className={`w-[46px] shrink-0 rounded-[9px] py-0.5 text-center text-[15px] ${isToday ? 'bg-accent text-accent-fg' : 'bg-surface-2/70'}`}
                >
                  {day}
                </span>
                <span className={`flex-1 truncate text-[16px] ${meal ? '' : 'text-muted'}`}>{meal ?? 'Henüz yemek seçilmedi'}</span>
                <HandIcon name="chevronRight" size={18} className="text-fg/60" />
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <section id="alisveris" className="card flex scroll-mt-4 flex-col gap-2.5 p-3">
          <div className="flex items-center gap-2">
            <HandIcon name="cart" size={30} className="shrink-0" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-[19px]">Alışveriş Listesi</h2>
              <span className="text-[13.5px] text-fg/65">İhtiyacın olan malzemeler</span>
            </div>
          </div>
          <p className="flex items-start gap-1.5 rounded-[12px] bg-[#fbe6e0] px-2 py-1.5 text-[13.5px] leading-snug text-accent-strong">
            <HandIcon name="pencil" size={18} className="shrink-0" />
            Bu listeyi kendin dolduruyorsun.
          </p>
          {shopping.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {shopping.map((item, i) => (
                <li key={item.title} className="flex items-center gap-2 text-[15px] leading-tight">
                  <CheckBox
                    checked={!!item.done}
                    label={item.title}
                    onToggle={() => setShopping(shopping.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                  />
                  <span className={item.done ? 'text-muted line-through' : ''}>{item.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Muted>Liste boş.</Muted>
          )}
        </section>

        <section className="card flex flex-col gap-2 p-3">
          <div className="flex items-center gap-2">
            <HandIcon name="sparkles" size={28} fill="var(--butter)" className="shrink-0" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-[19px]">Menü Fikirleri</h2>
              <span className="text-[13.5px] text-fg/65">Bu hafta için fikirler</span>
            </div>
          </div>
          <div className="grid place-items-center rounded-[14px] bg-surface-2/60 py-1">
            <Art name="plate" className="w-[78%]" />
          </div>
          {data.mealIdeas.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {data.mealIdeas.map((idea) => (
                <li key={idea} className="flex items-center gap-1.5 text-[15px] leading-tight">
                  <HandIcon name="tick" size={16} className="shrink-0 text-accent-strong" />
                  {idea}
                </li>
              ))}
            </ul>
          ) : (
            <Muted>Menü ekledikçe burada sevdiğin yemeklerden fikirler çıkacak.</Muted>
          )}
        </section>
      </div>
    </>
  )
}
