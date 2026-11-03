import { NavLink, Outlet } from 'react-router'
import HandIcon, { type IconName } from './HandIcon'

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Ana Sayfa', icon: 'home' },
  { to: '/takvim', label: 'Takvim', icon: 'calendar' },
  { to: '/gorevler', label: 'Görevler', icon: 'check' },
  { to: '/listeler', label: 'Listeler', icon: 'layers' },
  { to: '/profil', label: 'Profil', icon: 'user' },
]

export default function AppShell() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-bg text-fg">
      <main className="mx-auto flex max-w-xl flex-col gap-3.5 px-4 [&_.grid>*]:min-w-0 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+108px)]">
        <Outlet />
      </main>

      <nav aria-label="Ana menü" className="fixed inset-x-0 bottom-0 z-10 px-3 pb-[calc(env(safe-area-inset-bottom)+6px)]">
        <ul className="mx-auto grid max-w-xl grid-cols-5 rounded-[26px] border border-line bg-surface/95 px-1 pt-2 pb-1.5 shadow-[0_-4px_30px_-18px_var(--shadow)] backdrop-blur">
          {TABS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[15px] ${isActive ? 'text-accent-strong' : 'text-fg/75'}`}
              >
                {({ isActive }) => (
                  <>
                    <HandIcon name={icon} size={30} strokeWidth={isActive ? 1.8 : 1.5} fill={isActive ? 'var(--icon-fill)' : false} />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
