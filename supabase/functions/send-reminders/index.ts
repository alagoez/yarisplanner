// Zamanı gelen hatırlatmaları telefona Web Push bildirimi olarak gönderir.
// Zamanlayıcı (pg_cron) her dakika boş gövdeyle çağırır.
// Uygulama { "test": true } ve kullanıcı oturumuyla çağırırsa o kullanıcıya deneme bildirimi gider.
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'https://yarisplanner.vercel.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIME = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })
const DAY = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'Europe/Istanbul' })

type Due = { reminder_id: string; owner_id: string; item_id: string; title: string; module: string; starts_at: string; offset_minutes: number }
type Message = { title: string; body: string; url: string; tag?: string }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

/** "15 dakika sonra · 14:00", "Yarın · 1 gün sonra" gibi okunur bir zaman açıklaması */
function whenText(startsAt: string, offset: number) {
  const start = new Date(startsAt)
  const time = TIME.format(start)
  if (offset === 0) return `Şimdi · ${time}`
  if (offset < 60) return `${offset} dakika sonra · ${time}`
  if (offset < 1440) return `${Math.round(offset / 60)} saat sonra · ${time}`
  return `${Math.round(offset / 1440)} gün sonra · ${DAY.format(start)} ${time}`
}

async function sendToUser(userId: string, message: Message) {
  const { data: subs } = await supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', userId)
  let sent = 0
  for (const sub of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(message), {
        TTL: 60 * 60,
        urgency: 'high',
      })
      sent++
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode
      // Cihaz aboneliği bırakmış: kaydı temizle.
      if (status === 404 || status === 410) await supabase.from('push_subscriptions').delete().eq('id', sub.id)
      else console.error('gönderilemedi', status, (err as Error).message)
    }
  }
  return sent
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const body = await req.json().catch(() => ({}))

  if (body?.test) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const { data } = token ? await supabase.auth.getUser(token) : { data: { user: null } }
    if (!data.user) return json({ error: 'Giriş yapman gerekiyor.' }, 401)
    const sent = await sendToUser(data.user.id, { title: 'Asistanım', body: 'Bildirimler çalışıyor. Hatırlatmaların buraya gelecek.', url: '/profil' })
    return json({ sent })
  }

  const { data: due, error } = await supabase.rpc('claim_due_reminders')
  if (error) {
    console.error(error)
    return json({ error: error.message }, 500)
  }

  let sent = 0
  for (const r of (due ?? []) as Due[]) {
    sent += await sendToUser(r.owner_id, {
      title: r.title,
      body: whenText(r.starts_at, r.offset_minutes),
      url: '/takvim',
      tag: `${r.item_id}-${r.offset_minutes}`,
    })
  }
  return json({ due: due?.length ?? 0, sent })
})
