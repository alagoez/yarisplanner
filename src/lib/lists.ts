import { createContext, useContext } from 'react'
import type { IconName } from '../components/HandIcon'
import type { Kind, Module, Repeat } from './items'

/**
 * Listeler iki türlü:
 * - checklist: basit madde listesi (list_items tablosu)
 * - dated: tarihli kayıtlar (items tablosu); hatırlatma ve tekrar alabilir
 */
export type ListInfo = {
  slug: string
  title: string
  subtitle: string
  icon: IconName
  art?: string
  type: 'checklist' | 'dated' | 'custom'
  /** checklist: madde ekleme kutusunun ipucu ve işaretli maddelerin adı */
  placeholder?: string
  doneLabel?: string
  categories?: string[]
  /** dated: + ile açılan kayıt sayfasının hazır seçimleri */
  preset?: { module: Module; kind: Kind; repeat?: Repeat | null; reminders?: number[] }
}

export const SHOPPING_CATEGORIES = ['Market', 'Ev', 'Kişisel bakım', 'Diğer', 'Sonra alınacak']

/** Listeler sekmesindeki listeler; sıra tasarımdaki sırayı izler. */
export const LISTS: ListInfo[] = [
  { slug: 'kisisel-bakim', title: 'Kişisel Bakım', subtitle: 'Bakım ve randevuların', icon: 'lotus', art: 'care', type: 'dated', preset: { module: 'bakim', kind: 'randevu' } },
  { slug: 'seyahat', title: 'Seyahat', subtitle: 'Geçmiş ve yaklaşan seyahatlerin', icon: 'plane', art: 'plane', type: 'dated', preset: { module: 'seyahat', kind: 'seyahat', reminders: [1440] } },
  {
    slug: 'alinacaklar',
    title: 'Alınacaklar',
    subtitle: 'Market, ev ve diğer alışverişler',
    icon: 'cart',
    art: 'bag',
    type: 'checklist',
    placeholder: 'Ürün ekle (ör. Süt)',
    doneLabel: 'Alındı',
    categories: SHOPPING_CATEGORIES,
  },
  { slug: 'filmler', title: 'Filmler', subtitle: 'İzlenecekler listesi', icon: 'film', art: 'popcorn', type: 'checklist', placeholder: 'Film ekle', doneLabel: 'İzlendi' },
  { slug: 'kitaplar', title: 'Kitaplar', subtitle: 'Okunacaklar listesi', icon: 'clipboard', art: 'books-cap', type: 'checklist', placeholder: 'Kitap ekle', doneLabel: 'Okundu' },
  { slug: 'hedefler', title: 'Hedefler', subtitle: 'Hedefler ve alışkanlıklar', icon: 'target', art: 'notebook', type: 'checklist', placeholder: 'Hedef ekle', doneLabel: 'Tamamlandı' },
  { slug: 'istek-listesi', title: 'İstek Listesi', subtitle: 'Almak istediğin şeyler', icon: 'heart', type: 'checklist', placeholder: 'Ürün ekle', doneLabel: 'Alındı' },
  { slug: 'aksam-yemegi', title: 'Akşam Yemeği', subtitle: 'Haftalık menü planın', icon: 'utensils', art: 'plate', type: 'custom' },
  {
    slug: 'ozel-gunler',
    title: 'Özel Günler',
    subtitle: 'Doğum günleri ve etkinlikler',
    icon: 'cake',
    type: 'dated',
    preset: { module: 'kisisel', kind: 'etkinlik', repeat: 'yillik', reminders: [1440] },
  },
  { slug: 'butce', title: 'Bütçe', subtitle: 'Hedefler, abonelikler, ödemeler', icon: 'wallet', type: 'custom' },
  { slug: 'projeler', title: 'Projeler', subtitle: 'Okul ve iş projelerin', icon: 'target', art: 'sprout', type: 'checklist', placeholder: 'Proje ekle', doneLabel: 'Bitti' },
]

export const listBySlug = (slug: string | undefined) => LISTS.find((l) => l.slug === slug)

// ---------- liste maddeleri ve yemekler ----------

export type ListItem = {
  id: string
  list: string
  title: string
  category: string | null
  amount: number | null
  done_at: string | null
  created_at: string
}

export type Meal = { day: string; meal: string }

export type ListsState = {
  listItems: ListItem[]
  meals: Meal[]
  addListItem: (list: string, title: string, extra?: { category?: string; amount?: number | null }) => Promise<void>
  updateListItem: (id: string, changes: Partial<Pick<ListItem, 'title' | 'category' | 'amount'>>) => Promise<void>
  toggleListItem: (id: string) => Promise<void>
  removeListItem: (id: string) => Promise<void>
  /** Boş metin o günün yemeğini siler */
  setMeal: (day: string, meal: string) => Promise<void>
}

export const ListsContext = createContext<ListsState>({
  listItems: [],
  meals: [],
  addListItem: async () => {},
  updateListItem: async () => {},
  toggleListItem: async () => {},
  removeListItem: async () => {},
  setMeal: async () => {},
})

export function useLists() {
  return useContext(ListsContext)
}

export const itemsOf = (all: ListItem[], list: string) => all.filter((i) => i.list === list)

const pad = (n: number) => String(n).padStart(2, '0')
/** Yerel tarihi "2026-11-05" biçiminde verir (yemek planı günleri için). */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
