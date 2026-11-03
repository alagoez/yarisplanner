export const DAY_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

const monthLong = new Intl.DateTimeFormat('tr-TR', { month: 'long' })
const monthShort = new Intl.DateTimeFormat('tr-TR', { month: 'short' })
const fullDate = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })

/** Verilen günün haftasını Pazartesiden Pazara döndürür. */
export function weekOf(date: Date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "3–9 Kasım" ya da ay değişiyorsa "27 Eki – 2 Kas" */
export function weekRangeLabel(days: Date[]) {
  const first = days[0]
  const last = days[days.length - 1]
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${monthLong.format(last)}`
  }
  return `${first.getDate()} ${monthShort.format(first)} – ${last.getDate()} ${monthShort.format(last)}`
}

export function formatFullDate(date: Date) {
  return fullDate.format(date)
}

export function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 5) return 'İyi geceler'
  if (hour < 12) return 'Günaydın'
  if (hour < 18) return 'İyi günler'
  return 'İyi akşamlar'
}
