import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import HandIcon, { type IconName } from './HandIcon'

type Tone = 'rose' | 'lavender'

/** Kart başlıklarındaki yumuşak köşeli simge kutusu. */
export function IconChip({ icon, size = 44, tone = 'rose' }: { icon: IconName; size?: number; tone?: Tone }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`grid shrink-0 place-items-center rounded-[14px] text-fg ${tone === 'lavender' ? 'bg-white/50' : 'bg-surface-2'}`}
    >
      <HandIcon name={icon} size={Math.round(size * 0.6)} fill={tone === 'lavender' ? '#d8cbec' : undefined} />
    </span>
  )
}

export function CardHeading({ icon, title, subtitle, tone }: { icon: IconName; title: string; subtitle?: ReactNode; tone?: Tone }) {
  return (
    <div className="flex items-center gap-3">
      <IconChip icon={icon} tone={tone} />
      <div className="flex min-w-0 flex-col">
        <h2 className="text-[21px] leading-tight">{title}</h2>
        {subtitle && <span className="text-[14.5px] leading-tight text-muted">{subtitle}</span>}
      </div>
    </div>
  )
}

export function SeeAll({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="ml-auto flex items-center gap-1 text-[15px] text-accent-strong">
      {children}
      <HandIcon name="arrowRight" size={18} fill={false} />
    </Link>
  )
}

/** El çizimi kare onay kutusu. */
export function CheckBox({ checked, onToggle, label }: { checked: boolean; onToggle?: () => void; label: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onToggle} className="shrink-0 text-fg">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 5H20V20H5Z" transform="translate(0.8 0.9)" fill={checked ? 'var(--accent)' : '#fffdfb'} stroke="none" />
        <g filter="url(#hand-wobble)">
          <path d="M4.4 4.6C9.4 4.3 14.6 4.4 19.5 4.5C19.7 9.5 19.6 14.5 19.5 19.5C14.5 19.7 9.5 19.6 4.5 19.5C4.3 14.5 4.4 9.5 4.4 4.6Z" />
          {checked && <path d="M7.4 12.4L10.6 15.6L17.8 7.6" stroke="#fffdfb" strokeWidth="2.2" />}
        </g>
      </svg>
    </button>
  )
}

/** Sol kenarda dikey çizgi ve noktalarla zaman çizelgesi. */
export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="relative flex flex-col before:absolute before:top-4 before:bottom-4 before:left-[4px] before:w-[1.5px] before:rounded before:bg-accent/45">{children}</ol>
}

export function TimelineRow({ children, last }: { children: ReactNode; last?: boolean }) {
  return (
    <li className="relative flex items-center pl-5">
      <span className="absolute left-0 size-[10px] rounded-full border-[1.5px] border-fg/70 bg-accent" aria-hidden />
      <div className={`flex min-w-0 flex-1 items-center gap-3 py-2 ${last ? '' : 'border-b border-dashed border-line'}`}>{children}</div>
    </li>
  )
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-snug text-muted">{children}</p>
}

/** Sayfa ve kartlardaki el çizimi illüstrasyon (public/art). */
export function Art({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  return <img src={`/art/${name}.svg`} alt="" draggable={false} style={style} className={`pointer-events-none select-none ${className ?? ''}`} />
}

/** Metin içinde ✨ yerine kullanılan küçük el çizimi yıldızlar. */
export function Twinkle() {
  return <HandIcon name="sparkles" size={18} fill="var(--butter)" className="ml-1 inline-block -translate-y-0.5 align-middle text-fg/80" />
}
