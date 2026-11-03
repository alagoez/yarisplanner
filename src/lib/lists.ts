import type { IconName } from '../components/HandIcon'

export type ListInfo = { slug: string; title: string; subtitle: string; icon: IconName; art?: string }

/** Listeler sekmesindeki listeler; sıra tasarımdaki sırayı izler. */
export const LISTS: ListInfo[] = [
  { slug: 'kisisel-bakim', title: 'Kişisel Bakım', subtitle: 'Bakım ve randevuların', icon: 'lotus', art: 'care' },
  { slug: 'seyahat', title: 'Seyahat', subtitle: 'Geçmiş ve yaklaşan seyahatlerin', icon: 'plane', art: 'plane' },
  { slug: 'alinacaklar', title: 'Alınacaklar', subtitle: 'Market, ev ve diğer alışverişler', icon: 'cart', art: 'bag' },
  { slug: 'filmler', title: 'Filmler', subtitle: 'İzlenecekler listesi', icon: 'film', art: 'popcorn' },
  { slug: 'hedefler', title: 'Hedefler', subtitle: 'Hedefler ve alışkanlıklar', icon: 'target', art: 'notebook' },
  { slug: 'aksam-yemegi', title: 'Akşam Yemeği', subtitle: 'Haftalık menü planın', icon: 'utensils', art: 'plate' },
  { slug: 'ozel-gunler', title: 'Özel Günler', subtitle: 'Doğum günleri ve etkinlikler', icon: 'cake' },
  { slug: 'butce', title: 'Bütçe', subtitle: 'Hedefler, abonelikler, ödemeler', icon: 'wallet' },
]
