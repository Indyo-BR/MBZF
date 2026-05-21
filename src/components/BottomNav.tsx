import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/schedule', icon: 'calendar_today', label: 'Schedule' },
  { to: '/ballrooms', icon: 'meeting_room', label: 'Ballrooms' },
  { to: '/artists', icon: 'groups', label: 'Artists' },
  { to: '/videos', icon: 'movie', label: 'Videos' },
]

export default function BottomNav() {
  return (
    <nav className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30 z-[60] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 transition-all duration-300 ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container rounded-full scale-90'
                : 'text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className="font-bebas text-[10px] tracking-wider">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
