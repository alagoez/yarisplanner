/**
 * Tasarım görsellerindeki örnek içerik. Yalnızca geliştirmede, adrese ?demo eklenince
 * gösterilir; yayındaki uygulamada hiçbir zaman görünmez.
 */
import type { Item, Kind, Module } from './items'

export type Tag = 'is' | 'okul'
export type CheckItem = { title: string; done?: boolean; note?: string }
export type Project = { title: string; detail: string; progress: number; done?: boolean; tag: Tag }
export type DayMeal = { day: number; meal: string }

/** Henüz veritabanına bağlanmamış bölümlerin (yemek, alışveriş, listeler, projeler) verisi */
export type Extras = {
  dinnerToday?: string
  shoppingCount: number
  movies: number
  goals: number
  projects: Project[]
  meals: DayMeal[]
  shopping: CheckItem[]
  mealIdeas: string[]
}

export const EMPTY_EXTRAS: Extras = { shoppingCount: 0, movies: 0, goals: 0, projects: [], meals: [], shopping: [], mealIdeas: [] }

export const DEMO_EXTRAS: Extras = {
  dinnerToday: 'Fırında tavuk, sebze sote ve bulgur pilavı',
  shoppingCount: 5,
  movies: 5,
  goals: 3,
  projects: [
    { title: 'Tez Projesi', detail: 'Literatür taraması (%60)', progress: 60, done: true, tag: 'okul' },
    { title: 'İş – Müşteri Analiz Projesi', detail: 'Milestone 2 (bu hafta)', progress: 75, tag: 'is' },
  ],
  meals: [
    { day: 0, meal: 'Tavuk sote ve bulgur pilavı' },
    { day: 1, meal: 'Mercimek çorbası ve mevsim salatası' },
    { day: 2, meal: 'Köfte ve fırın patates' },
    { day: 3, meal: 'Zeytinyağlı taze fasulye ve yoğurt' },
    { day: 4, meal: 'Fırında somon ve sebze' },
    { day: 5, meal: 'Karnıyarık ve pirinç pilavı' },
    { day: 6, meal: 'Sebzeli omlet ve yeşil salata' },
  ],
  shopping: [
    { title: 'Tavuk göğsü (500 g)', done: true },
    { title: 'Bulgur (500 g)', done: true },
    { title: 'Mercimek (1 paket)' },
    { title: 'Patates (1 kg)' },
    { title: 'Somon (2 dilim)' },
    { title: 'Yoğurt (1 kg)' },
    { title: 'Taze fasulye (500 g)' },
  ],
  mealIdeas: ['Fırında sebzeli tavuk', 'Kremalı mantarlı makarna', 'Etli sebze güveç', 'Nohut yemeği ve pilav', 'Sebzeli kısır ve yoğurt'],
}

/** Tasarım görsellerindeki tarih: 23 Ocak 2025 Perşembe, 09:24 */
export const DEMO_DATE = new Date(2025, 0, 23, 9, 24)

let seq = 0
function demo(title: string, module: Module, kind: Kind, day: number, time: string | null, extra: Partial<Item> = {}): Item {
  const [h, m] = time ? time.split(':').map(Number) : [0, 0]
  return {
    id: `demo-${seq++}`,
    title,
    notes: null,
    module,
    kind,
    starts_at: new Date(2025, 0, day, h, m).toISOString(),
    ends_at: null,
    repeat: null,
    done_at: null,
    reminders: [{ offset_minutes: 15 }],
    ...extra,
  }
}

const doneToday = { done_at: new Date(2025, 0, 23, 8, 0).toISOString() }

export const DEMO_ITEMS: Item[] = [
  demo('Ekip toplantısı', 'is', 'toplanti', 23, '10:00', { notes: 'Q1 hedefleri ve proje durumu', ends_at: new Date(2025, 0, 23, 11).toISOString() }),
  demo('Seminer: Araştırma Yöntemleri', 'okul', 'etkinlik', 23, '13:00', { notes: 'Yüksek lisans • B-204', ends_at: new Date(2025, 0, 23, 14).toISOString() }),
  demo('Proje sunumu', 'is', 'toplanti', 23, '15:30', { notes: 'Milestone 2 – Gözden geçirme', ends_at: new Date(2025, 0, 23, 16, 30).toISOString() }),
  demo('Tez çalışması', 'okul', 'etkinlik', 23, '19:00', { notes: 'Literatür taraması ve taslak yazımı', ends_at: new Date(2025, 0, 23, 21).toISOString() }),
  demo('Sunum dosyasını tamamla', 'genel', 'gorev', 23, null),
  demo('Market alışverişi yap', 'genel', 'gorev', 23, null),
  demo('Seyahat biletlerini kontrol et', 'genel', 'gorev', 23, null),
  demo('Cilt bakımı', 'bakim', 'gorev', 23, null, doneToday),
  demo('Su takibini tamamla', 'bakim', 'gorev', 23, null),
  demo('30 dk. yürüyüş', 'bakim', 'gorev', 23, null),
  demo('Kuaför • Saç kesimi', 'bakim', 'randevu', 23, '14:00'),
  demo('Cilt bakımı rutini', 'bakim', 'randevu', 27, '10:30'),
  demo('İstanbul → İzmir', 'seyahat', 'seyahat', 28, '09:20', { reminders: [{ offset_minutes: 1440 }] }),
  demo('Ara Sınav – Araştırma Yönt.', 'okul', 'sinav', 28, '10:00'),
  demo('Final – İleri Veri Analizi', 'okul', 'sinav', 43, '14:00'),
  demo('Literatür özeti', 'okul', 'odev', 22, null, doneToday),
  demo('Makale analizi raporu', 'okul', 'odev', 27, null),
  demo('Sunum hazırlığı', 'okul', 'odev', 29, null),
  demo('Haftalık raporu gönder', 'is', 'gorev', 23, null, doneToday),
  demo('Proje sunumunu güncelle', 'is', 'gorev', 23, null),
  demo('Müşteri geri bildirimlerini topla', 'is', 'gorev', 24, null),
  demo('Q1 planını netleştir', 'is', 'gorev', 24, null),
]

function readDemoFlag() {
  if (import.meta.env.MODE === 'production') return false
  const fromUrl = new URLSearchParams(window.location.search).has('demo')
  try {
    if (fromUrl) sessionStorage.setItem('demo', '1')
    return fromUrl || sessionStorage.getItem('demo') === '1'
  } catch {
    return fromUrl
  }
}

export const IS_DEMO = readDemoFlag()

export function useExtras(): Extras {
  return IS_DEMO ? DEMO_EXTRAS : EMPTY_EXTRAS
}
