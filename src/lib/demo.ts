/**
 * Tasarım görsellerindeki örnek içerik. Yalnızca geliştirmede, adrese ?demo eklenince
 * gösterilir; yayındaki uygulamada hiçbir zaman görünmez. Faz 1'de bu veriler
 * Supabase'den gelen gerçek kayıtlarla değiştirilecek.
 */

export type Tag = 'is' | 'okul'
export type ScheduleItem = { start: string; end?: string; title: string; detail?: string; tag?: Tag }
export type CheckItem = { title: string; done?: boolean; note?: string }
export type Exam = { title: string; when: string }
export type Project = { title: string; detail: string; progress: number; done?: boolean; tag: Tag }
export type CareItem = { when: string; title: string }
export type Trip = { from: string; to: string; when: string; whenShort: string; reminder: boolean }
export type DayMeal = { day: number; meal: string }

export type AppData = {
  summary: { events: number; tasks: number; reminders: number }
  /** Hafta şeridindeki gün başına kayıt sayısı (Pzt=0) */
  weekDots: number[]
  schedule: ScheduleItem[]
  tasks: CheckItem[]
  workReminders: number
  schoolReminders: number
  dinnerToday?: string
  shoppingCount: number
  careToday: CheckItem[]
  care: CareItem[]
  trip?: Trip
  movies: number
  goals: number
  exams: Exam[]
  homework: CheckItem[]
  projects: Project[]
  workTasks: CheckItem[]
  meals: DayMeal[]
  shopping: CheckItem[]
  mealIdeas: string[]
}

export const EMPTY_DATA: AppData = {
  summary: { events: 0, tasks: 0, reminders: 0 },
  weekDots: [0, 0, 0, 0, 0, 0, 0],
  schedule: [],
  tasks: [],
  workReminders: 0,
  schoolReminders: 0,
  shoppingCount: 0,
  careToday: [],
  care: [],
  movies: 0,
  goals: 0,
  exams: [],
  homework: [],
  projects: [],
  workTasks: [],
  meals: [],
  shopping: [],
  mealIdeas: [],
}

export const DEMO_DATA: AppData = {
  summary: { events: 3, tasks: 5, reminders: 2 },
  weekDots: [1, 2, 1, 3, 1, 0, 1],
  schedule: [
    { start: '10:00', end: '11:00', title: 'Ekip toplantısı', detail: 'Q1 hedefleri ve proje durumu', tag: 'is' },
    { start: '13:00', end: '14:00', title: 'Seminer: Araştırma Yöntemleri', detail: 'Yüksek lisans • B-204', tag: 'okul' },
    { start: '15:00', end: '16:30', title: 'Proje durum değerlendirmesi', detail: 'Milestone 2 – Gözden geçirme', tag: 'is' },
    { start: '19:00', end: '21:00', title: 'Tez çalışması', detail: 'Literatür taraması ve taslak yazımı', tag: 'okul' },
  ],
  tasks: [{ title: 'Sunum dosyasını tamamla' }, { title: 'Market alışverişi yap' }, { title: 'Seyahat biletlerini kontrol et' }],
  workReminders: 2,
  schoolReminders: 1,
  dinnerToday: 'Fırında tavuk, sebze sote ve bulgur pilavı',
  shoppingCount: 5,
  careToday: [{ title: 'Cilt bakımı', done: true }, { title: 'Su takibini tamamla' }, { title: '30 dk. yürüyüş' }],
  care: [
    { when: '23 Oca Per, 14:00', title: 'Kuaför • Saç kesimi' },
    { when: '27 Oca Pzt, 10:30', title: 'Cilt bakımı rutini' },
  ],
  trip: { from: 'İstanbul', to: 'İzmir', when: '28 Oca Sal, 09:20', whenShort: '28 Ocak Sal, 09:20', reminder: true },
  movies: 5,
  goals: 3,
  exams: [
    { title: 'Ara Sınav – Araştırma Yönt.', when: '28 Ocak Sal, 10:00' },
    { title: 'Final – İleri Veri Analizi', when: '12 Şubat Çar, 14:00' },
  ],
  homework: [
    { title: 'Literatür özeti', done: true, note: 'Teslim edildi' },
    { title: 'Makale analizi raporu', note: 'Son teslim: 27 Ocak' },
    { title: 'Sunum hazırlığı', note: 'Son teslim: 29 Ocak' },
  ],
  projects: [
    { title: 'Tez Projesi', detail: 'Literatür taraması (%60)', progress: 60, done: true, tag: 'okul' },
    { title: 'İş – Müşteri Analiz Projesi', detail: 'Milestone 2 (bu hafta)', progress: 75, tag: 'is' },
  ],
  workTasks: [
    { title: 'Haftalık raporu gönder', done: true },
    { title: 'Proje sunumunu güncelle' },
    { title: 'Müşteri geri bildirimlerini topla' },
    { title: 'Q1 planını netleştir' },
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

export function useAppData(): AppData {
  return IS_DEMO ? DEMO_DATA : EMPTY_DATA
}
