import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export type PushState =
  /** Bu tarayıcı bildirim desteklemiyor */
  | 'unsupported'
  /** iPhone'da Safari sekmesinde açık; önce ana ekrana eklenmeli */
  | 'needs-install'
  /** Kullanıcı daha önce izin vermedi */
  | 'denied'
  /** İzin istenebilir */
  | 'prompt'
  /** Bildirimler açık */
  | 'enabled'

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

export async function getPushState(): Promise<PushState> {
  if (isIOS() && !isStandalone()) return 'needs-install'
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window) || !VAPID_PUBLIC_KEY) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'default') return 'prompt'
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  return subscription ? 'enabled' : 'prompt'
}

function base64UrlToBytes(base64Url: string) {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

/** İzin ister, cihazı bildirimlere abone eder ve aboneliği Supabase'e kaydeder. Bir dokunuşla çağrılmalı. */
export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'prompt'

  const registration = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'))
  await navigator.serviceWorker.ready
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY!) }))

  const { endpoint, keys } = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  const { error } = await supabase!.from('push_subscriptions').upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: 'endpoint' })
  if (error) throw error
  return 'enabled'
}

/** Bu cihaza hemen bir deneme bildirimi gönderir. */
export async function sendTestPush() {
  const { data, error } = await supabase!.functions.invoke<{ sent: number }>('send-reminders', { body: { test: true } })
  if (error) throw error
  return data?.sent ?? 0
}
