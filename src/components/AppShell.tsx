import { CalendarDays, CircleCheck, House, Layers, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

const TABS = [
  { to: '/', label: 'Ana Sayfa', icon: House },
  { to: '/takvim', label: 'Takvim', icon: CalendarDays },
  { to: '/gorevler', label: 'Görevler', icon: CircleCheck },
  { to: '/listeler', label: 'Listeler', icon: Layers },
  { to: '/profil', label: 'Profil', icon: User },
]

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+104px)]">
        <Outlet />
      </main>

      <nav
        aria-label="Ana menü"
        className="fixed inset-x-0 bottom-0 z-10 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)]"
      >
        <ul className="card mx-auto grid max-w-xl grid-cols-5 px-1 py-2 backdrop-blur">
          {TABS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-xl py-1 text-[12px] font-medium ${
                    isActive ? 'text-accent' : 'text-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={24} strokeWidth={isActive ? 2.2 : 1.6} aria-hidden />
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
