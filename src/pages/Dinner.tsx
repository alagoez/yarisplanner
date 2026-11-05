import { useState, type FormEvent } from 'react'
import HandIcon from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { Art, CheckBox, IconChip, Muted, SeeAll, Twinkle } from '../components/ui'
import { addDays, DAY_SHORT, isSameDay, weekOf, weekRangeLabel } from '../lib/dates'
import { dayKey, itemsOf, useLists } from '../lib/lists'
import { useNow } from '../lib/useNow'

const WEEK_LABEL: Record<number, string> = { [-1]: 'Geçen hafta', 0: 'Bu hafta', 1: 'Gelecek hafta' }

export default function Dinner() {
  const today = useNow()
  const { meals, setMeal, listItems, addListItem, toggleListItem } = useLists()
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [product, setProduct] = useState('')

  const days = weekOf(addDays(today, offset * 7))
  const keys = days.map(dayKey)
  const mealOf = (key: string) => meals.find((m) => m.day === key)?.meal

  const shopping = itemsOf(listItems, 'alinacaklar').filter((i) => (i.category ?? 'Market') === 'Market' && (!i.done_at || isSameDay(new Date(i.done_at), today)))

  // Önceki haftalarda yapılan yemekler; en yenisi önce, tekrarsız
  const ideas = [...meals]
    .filter((m) => !keys.includes(m.day))
    .sort((a, b) => b.day.localeCompare(a.day))
    .map((m) => m.meal)
    .filter((meal, i, all) => all.indexOf(meal) === i)
    .slice(0, 6)
  const firstEmpty = keys.find((k) => !mealOf(k))

  function startEdit(key: string) {
    setEditing(key)
    setText(mealOf(key) ?? '')
  }

  function saveEdit() {
    if (editing) setMeal(editing, text)
    setEditing(null)
  }

  async function addProduct(e: FormEvent) {
    e.preventDefault()
    if (!product.trim()) return
    await addListItem('alinacaklar', product.trim(), { category: 'Market' })
    setProduct('')
  }

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
        <div className="flex items-center gap-1.5 pb-1">
          <HandIcon name="calendar" size={26} />
          <h2 className="text-[19px] leading-tight">Akşam Yemeği Planı</h2>
          <div className="ml-auto flex shrink-0 items-center">
            <button type="button" onClick={() => setOffset(offset - 1)} aria-label="Önceki hafta" className="grid size-8 place-items-center">
              <HandIcon name="chevronLeft" size={18} />
            </button>
            <span className="flex flex-col items-center leading-none">
              <span className="text-[14px]">{WEEK_LABEL[offset] ?? 'Hafta'}</span>
              <span className="text-[12.5px] text-fg/65">{weekRangeLabel(days)}</span>
            </span>
            <button type="button" onClick={() => setOffset(offset + 1)} aria-label="Sonraki hafta" className="grid size-8 place-items-center">
              <HandIcon name="chevronRight" size={18} />
            </button>
          </div>
        </div>
        <ul className="flex flex-col">
          {days.map((d, i) => {
            const key = keys[i]
            const meal = mealOf(key)
            const isToday = isSameDay(d, today)
            return (
              <li key={key} className={`flex items-center gap-3 rounded-[12px] px-1.5 py-1.5 ${isToday ? 'bg-surface-2/80' : 'border-b border-dashed border-line last:border-0'}`}>
                <span className={`w-[46px] shrink-0 rounded-[9px] py-0.5 text-center text-[15px] ${isToday ? 'bg-accent text-accent-fg' : 'bg-surface-2/70'}`}>{DAY_SHORT[i]}</span>
                {editing === key ? (
                  <input
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    placeholder="Ne pişecek?"
                    maxLength={200}
                    className="min-w-0 flex-1 rounded-xl border border-accent bg-surface px-2 py-1 text-[16px] focus:outline-none"
                  />
                ) : (
                  <button type="button" onClick={() => startEdit(key)} className={`flex min-w-0 flex-1 items-center gap-2 text-left text-[16px] ${meal ? '' : 'text-muted'}`}>
                    <span className="min-w-0 flex-1 truncate">{meal ?? 'Yemek yaz'}</span>
                    <HandIcon name={meal ? 'pencil' : 'plus'} size={17} fill={false} className="shrink-0 text-fg/50" />
                  </button>
                )}
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
              <span className="text-[13.5px] text-fg/65">Market ihtiyaçları</span>
            </div>
          </div>
          <form onSubmit={addProduct} className="flex gap-1.5">
            <input
              id="dinner-product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ürün ekle"
              maxLength={200}
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-[16px] placeholder:text-muted/70 focus:border-accent focus:outline-none"
            />
            <button type="submit" aria-label="Ürünü ekle" disabled={!product.trim()} className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg disabled:opacity-50">
              <HandIcon name="plus" size={20} fill={false} />
            </button>
          </form>
          {shopping.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {shopping.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-[15px] leading-tight">
                  <CheckBox checked={!!item.done_at} label={item.title} onToggle={() => toggleListItem(item.id)} />
                  <span className={item.done_at ? 'text-muted line-through' : ''}>{item.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Muted>Liste boş.</Muted>
          )}
          <div className="mt-auto">
            <SeeAll to="/listeler/alinacaklar">Tüm liste</SeeAll>
          </div>
        </section>

        <section className="card flex flex-col gap-2 p-3">
          <div className="flex items-center gap-2">
            <HandIcon name="sparkles" size={28} fill="var(--butter)" className="shrink-0" />
            <div className="flex flex-col leading-tight">
              <h2 className="text-[19px]">Menü Fikirleri</h2>
              <span className="text-[13.5px] text-fg/65">Önceki haftalardan</span>
            </div>
          </div>
          <div className="grid place-items-center rounded-[14px] bg-surface-2/60 py-1">
            <Art name="plate" className="w-[70%]" />
          </div>
          {ideas.length > 0 ? (
            <>
              <ul className="flex flex-col gap-1">
                {ideas.map((idea) => (
                  <li key={idea}>
                    <button
                      type="button"
                      disabled={!firstEmpty}
                      onClick={() => firstEmpty && setMeal(firstEmpty, idea)}
                      className="flex w-full items-center gap-1.5 text-left text-[15px] leading-tight disabled:opacity-60"
                    >
                      <HandIcon name="plus" size={15} fill={false} className="shrink-0 text-accent-strong" />
                      {idea}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-[13px] text-fg/60">{firstEmpty ? 'Dokun, haftanın ilk boş gününe eklensin.' : 'Bu haftanın bütün günleri dolu.'}</p>
            </>
          ) : (
            <Muted>Yemek yazdıkça önceki haftalardan fikirler burada çıkacak.</Muted>
          )}
        </section>
      </div>
    </>
  )
}
