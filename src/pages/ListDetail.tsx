import { useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router'
import HandIcon from '../components/HandIcon'
import PageHeader from '../components/PageHeader'
import { CheckBox, EditTitle, Muted } from '../components/ui'
import { useEditor } from '../lib/editor'
import { formatShort, isDone, startOf, useItems, type Item } from '../lib/items'
import { itemsOf, listBySlug, useLists, type ListInfo, type ListItem } from '../lib/lists'
import { useNow } from '../lib/useNow'

const REPEAT_LABEL = { gunluk: 'her gün', haftalik: 'her hafta', aylik: 'her ay', yillik: 'her yıl' }
const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })

const inputClass = 'min-w-0 flex-1 rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-[18px] placeholder:text-muted/70 focus:border-accent focus:outline-none'

export default function ListDetail() {
  const { slug } = useParams()
  const list = listBySlug(slug)
  if (!list) return <Navigate to="/listeler" replace />

  return (
    <>
      <PageHeader title={list.title} subtitle={list.subtitle} art={list.art} />
      {list.type === 'checklist' && <ChecklistView list={list} />}
      {list.type === 'dated' && <DatedView list={list} />}
      {list.slug === 'butce' && <BudgetView />}
    </>
  )
}

// ---------- madde listeleri ----------

function ChecklistView({ list }: { list: ListInfo }) {
  const { listItems, addListItem } = useLists()
  const items = itemsOf(listItems, list.slug)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(list.categories?.[0] ?? '')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setError('')
    try {
      await addListItem(list.slug, title.trim(), { category: list.categories ? category : undefined })
      setTitle('')
    } catch {
      setError('Eklenemedi. İnternet bağlantını kontrol et.')
    }
  }

  const open = items.filter((i) => !i.done_at)
  const done = items.filter((i) => i.done_at)
  const groups = list.categories ? list.categories.map((c) => ({ name: c, items: open.filter((i) => (i.category ?? list.categories![0]) === c) })) : [{ name: '', items: open }]

  return (
    <>
      <form onSubmit={submit} className="card flex flex-col gap-2.5 p-3">
        <div className="flex gap-2">
          <input id={`add-${list.slug}`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={list.placeholder} maxLength={200} className={inputClass} />
          <button type="submit" disabled={!title.trim()} className="shrink-0 rounded-2xl bg-accent px-4 text-[18px] text-accent-fg disabled:opacity-50">
            Ekle
          </button>
        </div>
        {list.categories && (
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5">
            {list.categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[15.5px] ${category === c ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-white/70'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {error && <p className="text-[15px] text-danger">{error}</p>}
      </form>

      {items.length === 0 && (
        <section className="card p-4">
          <Muted>Liste boş. Yukarıdan ilk maddeyi ekleyebilirsin.</Muted>
        </section>
      )}

      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.name || 'hepsi'} className="card flex flex-col p-1.5">
            {g.name && <h2 className="px-2 pt-1.5 text-[18px] text-fg/70">{g.name}</h2>}
            <ul className="flex flex-col divide-y divide-dashed divide-line">
              {g.items.map((item) => (
                <ChecklistRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}

      {done.length > 0 && (
        <section className="card flex flex-col p-1.5">
          <h2 className="px-2 pt-1.5 text-[18px] text-fg/70">
            {list.doneLabel} · {done.length}
          </h2>
          <ul className="flex flex-col divide-y divide-dashed divide-line">
            {done.map((item) => (
              <ChecklistRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

/** Madde satırı: işaretle, başlığa dokunup düzelt, × ile sil. */
function ChecklistRow({ item, showAmount }: { item: ListItem; showAmount?: boolean }) {
  const { toggleListItem, updateListItem, removeListItem } = useLists()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(item.title)

  function save() {
    setEditing(false)
    if (text.trim() && text.trim() !== item.title) updateListItem(item.id, { title: text.trim() })
    else setText(item.title)
  }

  return (
    <li className="flex items-center gap-2.5 px-2 py-2">
      <CheckBox checked={!!item.done_at} label={item.title} onToggle={() => toggleListItem(item.id)} />
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          maxLength={200}
          className="min-w-0 flex-1 rounded-xl border border-accent bg-surface px-2 py-1 text-[17px] focus:outline-none"
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)} className={`min-w-0 flex-1 text-left text-[17px] leading-tight ${item.done_at ? 'text-muted line-through' : ''}`}>
          {item.title}
          {showAmount && item.amount !== null && <span className="ml-2 text-[15px] text-fg/65">{money.format(item.amount)}</span>}
        </button>
      )}
      <button type="button" onClick={() => removeListItem(item.id)} aria-label={`${item.title} sil`} className="shrink-0 p-1 text-fg/45">
        <HandIcon name="close" size={20} fill={false} />
      </button>
    </li>
  )
}

// ---------- tarihli listeler (özel günler, seyahat, kişisel bakım) ----------

function matchesList(list: ListInfo, item: Item) {
  const p = list.preset!
  if (p.kind === 'seyahat') return item.kind === 'seyahat'
  if (list.slug === 'ozel-gunler') return item.module === 'kisisel' && item.kind === 'etkinlik'
  return item.module === p.module
}

function DatedView({ list }: { list: ListInfo }) {
  const { items, toggleDone } = useItems()
  const { open } = useEditor()
  const now = useNow()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const mine = items.filter((i) => matchesList(list, i)).sort((a, b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? ''))
  const upcomingItems = mine.filter((i) => !startOf(i) || startOf(i)! >= startToday)
  const past = mine.filter((i) => startOf(i) && startOf(i)! < startToday).reverse()

  const row = (item: Item) => (
    <li key={item.id} className="flex items-center gap-2.5 px-2 py-2.5">
      <CheckBox checked={isDone(item)} label={item.title} onToggle={() => toggleDone(item.id)} />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <EditTitle item={item} className={`text-[17px] ${isDone(item) ? 'text-muted line-through' : ''}`} />
        <span className="flex flex-wrap items-center gap-x-2 text-[14px] text-fg/65">
          {formatShort(item)}
          {item.repeat && <span>· {REPEAT_LABEL[item.repeat]}</span>}
          {item.reminders.length > 0 && <HandIcon name="bell" size={15} className="text-accent-strong" />}
        </span>
      </div>
      <button type="button" onClick={() => open(item)} aria-label={`${item.title} düzenle`} className="shrink-0 p-1 text-fg/55">
        <HandIcon name="pencil" size={20} fill={false} />
      </button>
    </li>
  )

  return (
    <>
      <button type="button" onClick={() => open(undefined, list.preset)} className="card flex items-center justify-center gap-2 py-3 text-[19px] text-accent-strong">
        <HandIcon name="plus" size={22} fill={false} />
        {list.slug === 'ozel-gunler' ? 'Özel gün ekle' : list.slug === 'seyahat' ? 'Seyahat ekle' : 'Ekle'}
      </button>

      <section className="card flex flex-col p-1.5">
        <h2 className="px-2 pt-1.5 text-[18px] text-fg/70">Yaklaşan</h2>
        {upcomingItems.length > 0 ? (
          <ul className="flex flex-col divide-y divide-dashed divide-line">{upcomingItems.map(row)}</ul>
        ) : (
          <div className="p-2">
            <Muted>Yaklaşan kayıt yok.</Muted>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="card flex flex-col p-1.5">
          <h2 className="px-2 pt-1.5 text-[18px] text-fg/70">Geçmiş</h2>
          <ul className="flex flex-col divide-y divide-dashed divide-line">{past.map(row)}</ul>
        </section>
      )}
    </>
  )
}

// ---------- bütçe ----------

function BudgetView() {
  const { listItems, addListItem, updateListItem } = useLists()
  const { items } = useItems()
  const { open } = useEditor()
  const goal = itemsOf(listItems, 'butce-hedef')[0]
  const savings = itemsOf(listItems, 'birikim')
  const payments = items.filter((i) => i.module === 'finans').sort((a, b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? ''))

  const [goalText, setGoalText] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [savingTitle, setSavingTitle] = useState('')
  const [savingAmount, setSavingAmount] = useState('')

  const parseAmount = (s: string) => {
    const n = Number(s.replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  async function saveGoal(e: FormEvent) {
    e.preventDefault()
    const amount = parseAmount(goalText)
    if (amount === null) return
    if (goal) await updateListItem(goal.id, { amount })
    else await addListItem('butce-hedef', 'Aylık bütçe', { amount })
    setEditingGoal(false)
  }

  async function addSaving(e: FormEvent) {
    e.preventDefault()
    if (!savingTitle.trim()) return
    await addListItem('birikim', savingTitle.trim(), { amount: parseAmount(savingAmount) })
    setSavingTitle('')
    setSavingAmount('')
  }

  return (
    <>
      <section className="card flex flex-col gap-2 p-3.5">
        <h2 className="text-[20px]">Aylık bütçe hedefi</h2>
        {editingGoal || !goal ? (
          <form onSubmit={saveGoal} className="flex gap-2">
            <input
              id="budget-goal"
              inputMode="decimal"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="ör. 25000"
              className={inputClass}
            />
            <button type="submit" className="shrink-0 rounded-2xl bg-accent px-4 text-[18px] text-accent-fg">
              Kaydet
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setGoalText(String(goal.amount ?? ''))
              setEditingGoal(true)
            }}
            className="flex items-center justify-between text-left"
          >
            <span className="font-display text-[40px] leading-none font-bold">{money.format(goal.amount ?? 0)}</span>
            <HandIcon name="pencil" size={22} fill={false} className="text-fg/55" />
          </button>
        )}
        <p className="text-[14.5px] text-fg/65">Bu bir hedef; harcama kaydı tutulmaz ve karşılaştırma yapılmaz.</p>
      </section>

      <section className="card flex flex-col gap-2 p-3">
        <h2 className="px-0.5 text-[20px]">Birikim hedefleri</h2>
        <form onSubmit={addSaving} className="flex gap-2">
          <input id="saving-title" value={savingTitle} onChange={(e) => setSavingTitle(e.target.value)} placeholder="Hedef (ör. Tatil)" maxLength={200} className={inputClass} />
          <input
            id="saving-amount"
            inputMode="decimal"
            value={savingAmount}
            onChange={(e) => setSavingAmount(e.target.value)}
            placeholder="Tutar"
            className="w-[92px] shrink-0 rounded-2xl border border-line bg-surface px-3 py-2.5 text-[18px] placeholder:text-muted/70 focus:border-accent focus:outline-none"
          />
          <button type="submit" disabled={!savingTitle.trim()} className="shrink-0 rounded-2xl bg-accent px-3.5 text-[18px] text-accent-fg disabled:opacity-50">
            Ekle
          </button>
        </form>
        {savings.length > 0 ? (
          <ul className="flex flex-col divide-y divide-dashed divide-line">
            {savings.map((s) => (
              <ChecklistRow key={s.id} item={s} showAmount />
            ))}
          </ul>
        ) : (
          <Muted>Henüz birikim hedefi yok.</Muted>
        )}
      </section>

      <section className="card flex flex-col gap-1 p-1.5">
        <div className="flex items-center justify-between px-2 pt-1.5">
          <h2 className="text-[20px]">Abonelik ve ödemeler</h2>
          <button
            type="button"
            onClick={() => open(undefined, { module: 'finans', kind: 'odeme', repeat: 'aylik', reminders: [1440] })}
            className="flex items-center gap-1 text-[16px] text-accent-strong"
          >
            <HandIcon name="plus" size={18} fill={false} />
            Ödeme ekle
          </button>
        </div>
        {payments.length > 0 ? (
          <ul className="flex flex-col divide-y divide-dashed divide-line">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center gap-2.5 px-2 py-2.5">
                <HandIcon name="wallet" size={24} />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <EditTitle item={p} className="text-[17px]" />
                  <span className="text-[14px] text-fg/65">
                    {formatShort(p)}
                    {p.repeat && ` · ${REPEAT_LABEL[p.repeat]}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-2">
            <Muted>Kayıtlı ödeme yok. Abonelikleri ekleyince ödeme gününden önce hatırlatılır.</Muted>
          </div>
        )}
      </section>
    </>
  )
}
