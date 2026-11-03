import { useEffect, useState } from 'react'
import { enablePush, getPushState, sendTestPush, type PushState } from '../lib/push'
import HandIcon from './HandIcon'

/**
 * Bildirim durumunu gösterir ve açmayı sağlar.
 * compact: Ana Sayfa'da yalnızca bildirimler kapalıyken görünen kart.
 */
export default function NotificationCard({ compact }: { compact?: boolean }) {
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getPushState().then(setState)
  }, [])

  if (!state || (compact && (state === 'enabled' || state === 'unsupported'))) return null

  async function turnOn() {
    setBusy(true)
    setMessage('')
    try {
      setState(await enablePush())
    } catch {
      setMessage('Bildirimler açılamadı. İnternet bağlantını kontrol edip tekrar dene.')
    }
    setBusy(false)
  }

  async function test() {
    setBusy(true)
    setMessage('')
    try {
      const sent = await sendTestPush()
      setMessage(sent > 0 ? 'Deneme bildirimi gönderildi. Birkaç saniye içinde gelmeli.' : 'Bu hesaba kayıtlı cihaz bulunamadı. Bildirimleri yeniden aç.')
    } catch {
      setMessage('Deneme bildirimi gönderilemedi.')
    }
    setBusy(false)
  }

  return (
    <section className="card flex flex-col gap-2.5 p-3.5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-surface-2">
          <HandIcon name="bell" size={28} />
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <h2 className="text-[20px]">Hatırlatma bildirimleri</h2>
          <span className="text-[15px] text-fg/70">{TEXT[state]}</span>
        </div>
      </div>

      {state === 'needs-install' && (
        <ol className="flex list-decimal flex-col gap-1 rounded-[14px] bg-surface-2/60 py-2.5 pr-3 pl-8 text-[15.5px] leading-snug">
          <li>Safari'nin altındaki Paylaş düğmesine dokun.</li>
          <li>"Ana Ekrana Ekle"yi seç.</li>
          <li>Uygulamayı ana ekrandaki Asistanım ikonundan aç ve buraya dön.</li>
        </ol>
      )}

      {state === 'denied' && (
        <p className="rounded-[14px] bg-surface-2/60 px-3 py-2.5 text-[15.5px] leading-snug">
          iPhone'da Ayarlar → Bildirimler → Asistanım bölümünden izin ver, sonra uygulamayı kapatıp yeniden aç.
        </p>
      )}

      {state === 'prompt' && (
        <button type="button" onClick={turnOn} disabled={busy} className="rounded-[14px] bg-accent py-2.5 text-[18px] text-accent-fg disabled:opacity-60">
          {busy ? 'Açılıyor…' : 'Bildirimleri aç'}
        </button>
      )}

      {state === 'enabled' && !compact && (
        <button type="button" onClick={test} disabled={busy} className="rounded-[14px] border border-accent/50 bg-white/70 py-2.5 text-[17px] text-accent-strong disabled:opacity-60">
          {busy ? 'Gönderiliyor…' : 'Deneme bildirimi gönder'}
        </button>
      )}

      {message && (
        <p role="status" className="text-[15px] text-fg/80">
          {message}
        </p>
      )}
    </section>
  )
}

const TEXT: Record<PushState, string> = {
  unsupported: 'Bu tarayıcı bildirim desteklemiyor.',
  'needs-install': 'Bildirimler için uygulamayı ana ekrana eklemen gerekiyor.',
  denied: 'Bildirim izni kapalı.',
  prompt: 'Hatırlatmaların zamanında telefonuna gelsin.',
  enabled: 'Açık. Hatırlatmaların telefonuna gelecek.',
}
