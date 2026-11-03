import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { DEMO_ITEMS, IS_DEMO } from './demo'
import { ItemsContext, type Item, type NewItem } from './items'
import { supabase } from './supabase'

const SELECT = 'id, title, notes, module, kind, starts_at, ends_at, repeat, done_at, reminders(offset_minutes)'

/** Kullanıcının kayıtlarını yükler ve ekleme / tamamlama / silme işlemlerini sağlar. */
export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(IS_DEMO ? DEMO_ITEMS : [])
  const [loading, setLoading] = useState(!IS_DEMO)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (IS_DEMO || !supabase) return
    const { data, error } = await supabase.from('items').select(SELECT).order('starts_at', { ascending: true, nullsFirst: false })
    if (error) setError('Kayıtlar yüklenemedi. İnternet bağlantını kontrol et.')
    else {
      setItems(data as Item[])
      setError('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Uygulamaya geri dönüldüğünde (ör. başka cihazda değişiklik) listeyi tazele.
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  async function add(input: NewItem) {
    const { reminders, ...fields } = input
    if (IS_DEMO || !supabase) {
      setItems((prev) => [...prev, { id: crypto.randomUUID(), notes: null, ends_at: null, done_at: null, ...fields, reminders: reminders.map((m) => ({ offset_minutes: m })) } as Item])
      return
    }
    const { data, error } = await supabase.from('items').insert(fields).select('id').single()
    if (error) throw error
    if (reminders.length > 0) {
      const { error: reminderError } = await supabase.from('reminders').insert(reminders.map((m) => ({ item_id: data.id, offset_minutes: m })))
      if (reminderError) throw reminderError
    }
    await load()
  }

  async function toggleDone(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const done_at = item.done_at ? null : new Date().toISOString()
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done_at } : i)))
    if (IS_DEMO || !supabase) return
    const { error } = await supabase.from('items').update({ done_at }).eq('id', id)
    if (error) {
      setItems((prev) => prev.map((i) => (i.id === id ? item : i)))
      setError('Değişiklik kaydedilemedi.')
    }
  }

  async function remove(id: string) {
    const before = items
    setItems((prev) => prev.filter((i) => i.id !== id))
    if (IS_DEMO || !supabase) return
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) {
      setItems(before)
      setError('Kayıt silinemedi.')
    }
  }

  return <ItemsContext value={{ items, loading, error, add, toggleDone, remove }}>{children}</ItemsContext>
}
