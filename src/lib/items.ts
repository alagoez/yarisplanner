import { createContext, useContext } from 'react'
import { addDays, isSameDay } from './dates'

export type Kind = 'gorev' | 'etkinlik' | 'toplanti' | 'sinav' | 'odev' | 'randevu' | 'odeme' | 'seyahat'
export type Module = 'genel' | 'is' | 'okul' | 'bakim' | 'seyahat' | 'yemek' | 'alisveris' | 'finans' | 'kisisel'
export type Repeat = 'gunluk' | 'haftalik' | 'aylik' | 'yillik'

export type Item = {
  id: string
  title: string
  notes: string | null
  module: Module
  kind: Kind
  starts_at: string | null
  ends_at: string | null
  repeat: Repeat | null
  done_at: string | null
  reminders: { offset_minutes: number }[]
}

export type NewItem = {
  title: string
  notes?: string
  module: Module
  kind: Kind
  starts_at: string | null
  repeat: Repeat | null
  reminders: number[]
}

export type ItemsState = {
  items: Item[]
  loading: boolean
  error: string
  add: (item: NewItem) => Promise<void>
  toggleDone: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const ItemsContext = createContext<ItemsState>({
  items: [],
  loading: true,
  error: '',
  add: async () => {},
  toggleDone: async () => {},
  remove: async () => {},
})

export function useItems() {
  return useContext(ItemsContext)
}

// ---------- kayıtlardan ekran verisi çıkaran yardımcılar ----------

export const startOf = (item: Item) => (item.starts_at ? new Date(item.starts_at) : null)

export const isDone = (item: Item) => item.done_at !== null

/** Saatli mi? Saatsiz kayıtlar gün başına (00:00) kaydedilir. */
export function hasTime(item: Item) {
  const d = startOf(item)
  return !!d && (d.getHours() !== 0 || d.getMinutes() !== 0)
}

export function onDay(items: Item[], day: Date) {
  return items
    .filter((i) => {
      const d = startOf(i)
      return d && isSameDay(d, day)
    })
    .sort((a, b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? ''))
}

/** Görev mi, yoksa takvimde saati olan bir etkinlik mi? */
export const isTask = (item: Item) => item.kind === 'gorev'

export function upcoming(items: Item[], now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return items
    .filter((i) => {
      const d = startOf(i)
      return d && d >= today && !isDone(i)
    })
    .sort((a, b) => (a.starts_at ?? '').localeCompare(b.starts_at ?? ''))
}

/** Bugün ya da tarihsiz, bitmemiş görevler; bugün bitenler de üstü çizili görünsün diye listede kalır. */
export function openTasks(items: Item[], now: Date) {
  const endOfToday = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), 1)
  return items
    .filter((i) => isTask(i))
    .filter((i) => {
      const d = startOf(i)
      if (i.done_at) return isSameDay(new Date(i.done_at), now)
      return !d || d < endOfToday
    })
    .sort((a, b) => (a.starts_at ?? '9').localeCompare(b.starts_at ?? '9'))
}

const timeFmt = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' })
const shortFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' })
const longFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })

export const formatTime = (item: Item) => (hasTime(item) ? timeFmt.format(startOf(item)!) : '')

/** "23 Oca Per, 14:00" */
export function formatShort(item: Item) {
  const d = startOf(item)
  if (!d) return ''
  const time = formatTime(item)
  return `${shortFmt.format(d).replace('.', '')}${time ? `, ${time}` : ''}`
}

/** "28 Ocak Sal, 09:20" */
export function formatLong(item: Item) {
  const d = startOf(item)
  if (!d) return ''
  const time = formatTime(item)
  return `${longFmt.format(d)}${time ? `, ${time}` : ''}`
}

/** "İstanbul → İzmir" başlığını iki şehre böler. */
export function splitRoute(title: string) {
  const [from, to] = title.split(/\s*(?:→|->|–|-)\s*/)
  return { from: from ?? title, to: to ?? '' }
}
