import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { EditorContext, type EditorPreset } from '../lib/editor'
import { hasTime, useItems, type Item, type Kind, type Module, type Repeat } from '../lib/items'
import { getPushState } from '../lib/push'
import HandIcon from './HandIcon'

const KINDS: { kind: Kind; label: string; module?: Module }[] = [
  { kind: 'gorev', label: 'Görev' },
  { kind: 'etkinlik', label: 'Etkinlik' },
  { kind: 'toplanti', label: 'Toplantı', module: 'is' },
  { kind: 'randevu', label: 'Randevu' },
  { kind: 'sinav', label: 'Sınav', module: 'okul' },
  { kind: 'odev', label: 'Ödev', module: 'okul' },
  { kind: 'seyahat', label: 'Seyahat', module: 'seyahat' },
  { kind: 'odeme', label: 'Ödeme', module: 'finans' },
]

const MODULES: { module: Module; label: string }[] = [
  { module: 'genel', label: 'Genel' },
  { module: 'is', label: 'İş' },
  { module: 'okul', label: 'Okul' },
  { module: 'bakim', label: 'Kişisel Bakım' },
  { module: 'seyahat', label: 'Seyahat' },
  { module: 'kisisel', label: 'Kişisel' },
  { module: 'finans', label: 'Bütçe' },
]

const REMINDERS: { minutes: number; label: string }[] = [
  { minutes: 0, label: 'Zamanında' },
  { minutes: 15, label: '15 dk önce' },
  { minutes: 60, label: '1 saat önce' },
  { minutes: 1440, label: '1 gün önce' },
]

const REPEATS: { repeat: Repeat | null; label: string }[] = [
  { repeat: null, label: 'Tekrar yok' },
  { repeat: 'gunluk', label: 'Her gün' },
  { repeat: 'haftalik', label: 'Her hafta' },
  { repeat: 'aylik', label: 'Her ay' },
  { repeat: 'yillik', label: 'Her yıl' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const dateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const timeValue = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

/**
 * Sağ alttaki + düğmesi ve kayıt sayfası. Çocuklarına useEditor().open(kayıt) verir:
 * kayıtla açılırsa düzenleme, kayıtsız açılırsa yeni kayıt.
 */
export default function EditorProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState<{ item?: Item; preset?: EditorPreset; key: number } | null>(null)
  return (
    <EditorContext value={{ open: (item, preset) => setEditing({ item, preset, key: Date.now() }) }}>
      {children}
      <button
        type="button"
        onClick={() => setEditing({ key: Date.now() })}
        aria-label="Yeni kayıt ekle"
        className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+92px)] z-20 grid size-14 place-items-center rounded-full border-[1.5px] border-fg/70 bg-accent text-accent-fg shadow-[0_10px_24px_-10px_var(--accent)]"
      >
        <HandIcon name="plus" size={30} strokeWidth={2.2} fill={false} />
      </button>
      {editing && <Sheet key={editing.key} item={editing.item} preset={editing.preset} onClose={() => setEditing(null)} />}
    </EditorContext>
  )
}

function Sheet({ item, preset, onClose }: { item?: Item; preset?: EditorPreset; onClose: () => void }) {
  const { add, update, remove } = useItems()
  const titleRef = useRef<HTMLInputElement>(null)
  const start = item?.starts_at ? new Date(item.starts_at) : null
  const [title, setTitle] = useState(item?.title ?? '')
  const [kind, setKind] = useState<Kind>(item?.kind ?? preset?.kind ?? 'gorev')
  const [module, setModule] = useState<Module>(item?.module ?? preset?.module ?? 'genel')
  const [date, setDate] = useState(() => (item ? (start ? dateValue(start) : '') : dateValue(new Date())))
  const [time, setTime] = useState(item && start && hasTime(item) ? timeValue(start) : '')
  const [reminders, setReminders] = useState<number[]>(item ? item.reminders.map((r) => r.offset_minutes) : (preset?.reminders ?? [0]))
  const [repeat, setRepeat] = useState<Repeat | null>(item?.repeat ?? preset?.repeat ?? null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pushOff, setPushOff] = useState(false)

  useEffect(() => {
    if (!item) titleRef.current?.focus()
    getPushState().then((s) => setPushOff(s !== 'enabled'))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, item])

  const wantsReminder = reminders.length > 0 && date !== ''

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    setError('')
    // Saat seçilmeden hatırlatma istenirse hatırlatma sabah 09:00'a kurulur.
    const clock = time || (wantsReminder ? '09:00' : '00:00')
    const starts_at = date ? new Date(`${date}T${clock}`).toISOString() : null
    try {
      const data = { title: title.trim(), kind, module, starts_at, repeat: date ? repeat : null, reminders: wantsReminder ? reminders : [] }
      if (item) await update(item.id, data)
      else await add(data)
      onClose()
    } catch {
      setError(item ? 'Değişiklik kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.' : 'Kayıt eklenemedi. İnternet bağlantını kontrol edip tekrar dene.')
      setBusy(false)
    }
  }

  async function deleteItem() {
    if (!item) return
    await remove(item.id)
    onClose()
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1 text-[16px] ${active ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-white/70 text-fg'}`

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-fg/30" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={item ? 'Kaydı düzenle' : 'Yeni kayıt'}
        className="mx-auto flex max-h-[92dvh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-bg px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-12px_40px_-20px_var(--shadow)]"
      >
        <span className="mx-auto h-1.5 w-12 rounded-full bg-fg/20" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[34px] leading-none font-bold">{item ? 'Kaydı düzenle' : 'Yeni kayıt'}</h2>
          <button type="button" onClick={onClose} className="text-[17px] text-fg/70">
            Vazgeç
          </button>
        </div>

        <input
          ref={titleRef}
          id="quick-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ne yapılacak? (ör. Kuaför randevusu)"
          maxLength={200}
          required
          className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-[19px] placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />

        <Field label="Tür">
          {KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              onClick={() => {
                setKind(k.kind)
                if (k.module) setModule(k.module)
              }}
              className={chip(kind === k.kind)}
            >
              {k.label}
            </button>
          ))}
        </Field>

        <Field label="Bölüm">
          {MODULES.map((m) => (
            <button key={m.module} type="button" onClick={() => setModule(m.module)} className={chip(module === m.module)}>
              {m.label}
            </button>
          ))}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-[15px] text-fg/70">
            Tarih
            <input
              id="quick-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-line bg-surface px-3 py-2.5 text-[17px] text-fg"
            />
          </label>
          <label className="flex flex-col gap-1 text-[15px] text-fg/70">
            Saat
            <input
              id="quick-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-2xl border border-line bg-surface px-3 py-2.5 text-[17px] text-fg"
            />
          </label>
        </div>

        {date && (
          <Field label="Hatırlat">
            {REMINDERS.map((r) => {
              const active = reminders.includes(r.minutes)
              return (
                <button
                  key={r.minutes}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setReminders(active ? reminders.filter((m) => m !== r.minutes) : [...reminders, r.minutes])}
                  className={chip(active)}
                >
                  {r.label}
                </button>
              )
            })}
          </Field>
        )}
        {wantsReminder && !time && <p className="-mt-2 text-[14.5px] text-fg/65">Saat seçmezsen hatırlatma sabah 09:00'a göre kurulur.</p>}
        {wantsReminder && pushOff && (
          <p className="-mt-2 flex items-center gap-1.5 text-[14.5px] text-accent-strong">
            <HandIcon name="bell" size={18} />
            Bildirimler kapalı. Ana Sayfa'daki karttan açabilirsin.
          </p>
        )}

        {date && (
          <Field label="Tekrar">
            {REPEATS.map((r) => (
              <button key={r.label} type="button" onClick={() => setRepeat(r.repeat)} className={chip(repeat === r.repeat)}>
                {r.label}
              </button>
            ))}
          </Field>
        )}

        {error && (
          <p role="alert" className="text-[16px] text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy || !title.trim()} className="rounded-2xl bg-accent py-3 text-[21px] text-accent-fg disabled:opacity-50">
          {busy ? 'Kaydediliyor…' : 'Kaydet'}
        </button>

        {item &&
          (confirmDelete ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-danger/30 bg-white/70 p-3">
              <p className="text-[16px]">Bu kayıt ve hatırlatmaları silinsin mi?</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={deleteItem} className="rounded-xl bg-danger py-2 text-[17px] text-white">
                  Evet, sil
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl border border-line py-2 text-[17px]">
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="py-1 text-[17px] text-danger">
              Kaydı sil
            </button>
          ))}
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[15px] text-fg/70">{label}</span>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">{children}</div>
    </div>
  )
}
