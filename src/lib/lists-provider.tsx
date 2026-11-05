import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DEMO_DATE, DEMO_EXTRAS, IS_DEMO } from './demo'
import { addDays, weekOf } from './dates'
import { dayKey, ListsContext, type ListItem, type Meal } from './lists'
import { supabase } from './supabase'

function demoState(): { listItems: ListItem[]; meals: Meal[] } {
  const now = new Date().toISOString()
  const item = (list: string, title: string, extra: Partial<ListItem> = {}): ListItem => ({
    id: crypto.randomUUID(),
    list,
    title,
    category: null,
    amount: null,
    done_at: null,
    created_at: now,
    ...extra,
  })
  const week = weekOf(DEMO_DATE)
  return {
    listItems: [
      ...DEMO_EXTRAS.shopping.map((s) => item('alinacaklar', s.title, { category: 'Market', done_at: s.done ? now : null })),
      item('filmler', 'Küçük Kadınlar'),
      item('filmler', 'Amélie'),
      item('hedefler', 'Ayda 2 kitap oku'),
      item('birikim', 'Tatil', { amount: 15000 }),
      item('butce-hedef', 'Aylık bütçe', { amount: 25000 }),
    ],
    meals: [
      ...DEMO_EXTRAS.meals.map((m) => ({ day: dayKey(week[m.day]), meal: m.meal })),
      { day: dayKey(addDays(week[0], -7)), meal: 'Fırında sebzeli tavuk' },
      { day: dayKey(addDays(week[0], -6)), meal: 'Kremalı mantarlı makarna' },
    ],
  }
}

/** Liste maddelerini ve akşam yemeği planını yükler, değişiklikleri kaydeder. */
export function ListsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => (IS_DEMO ? demoState() : { listItems: [] as ListItem[], meals: [] as Meal[] }))

  const load = useCallback(async () => {
    if (IS_DEMO || !supabase) return
    const [lists, meals] = await Promise.all([
      supabase.from('list_items').select('id, list, title, category, amount, done_at, created_at').order('created_at'),
      supabase.from('meals').select('day, meal'),
    ])
    if (!lists.error && !meals.error) setState({ listItems: lists.data as ListItem[], meals: meals.data as Meal[] })
  }, [])

  useEffect(() => {
    load()
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  const patch = (fn: (items: ListItem[]) => ListItem[]) => setState((s) => ({ ...s, listItems: fn(s.listItems) }))

  async function addListItem(list: string, title: string, extra: { category?: string; amount?: number | null } = {}) {
    const row = { list, title, category: extra.category ?? null, amount: extra.amount ?? null }
    if (IS_DEMO || !supabase) {
      patch((items) => [...items, { id: crypto.randomUUID(), done_at: null, created_at: new Date().toISOString(), ...row }])
      return
    }
    const { data, error } = await supabase.from('list_items').insert(row).select('id, list, title, category, amount, done_at, created_at').single()
    if (error) throw error
    patch((items) => [...items, data as ListItem])
  }

  async function updateListItem(id: string, changes: Partial<Pick<ListItem, 'title' | 'category' | 'amount'>>) {
    patch((items) => items.map((i) => (i.id === id ? { ...i, ...changes } : i)))
    if (IS_DEMO || !supabase) return
    const { error } = await supabase.from('list_items').update(changes).eq('id', id)
    if (error) await load()
  }

  async function toggleListItem(id: string) {
    const current = state.listItems.find((i) => i.id === id)
    if (!current) return
    const done_at = current.done_at ? null : new Date().toISOString()
    patch((items) => items.map((i) => (i.id === id ? { ...i, done_at } : i)))
    if (IS_DEMO || !supabase) return
    const { error } = await supabase.from('list_items').update({ done_at }).eq('id', id)
    if (error) await load()
  }

  async function removeListItem(id: string) {
    patch((items) => items.filter((i) => i.id !== id))
    if (IS_DEMO || !supabase) return
    const { error } = await supabase.from('list_items').delete().eq('id', id)
    if (error) await load()
  }

  async function setMeal(day: string, meal: string) {
    const text = meal.trim()
    setState((s) => ({ ...s, meals: [...s.meals.filter((m) => m.day !== day), ...(text ? [{ day, meal: text }] : [])] }))
    if (IS_DEMO || !supabase) return
    const { error } = text
      ? await supabase.from('meals').upsert({ day, meal: text }, { onConflict: 'user_id,day' })
      : await supabase.from('meals').delete().eq('day', day)
    if (error) await load()
  }

  return (
    <ListsContext value={{ ...state, addListItem, updateListItem, toggleListItem, removeListItem, setMeal }}>{children}</ListsContext>
  )
}
