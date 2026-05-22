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
    <nav className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30 z-[60] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-transform duration-150 active:scale-90 ${
              isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="nav-ripple absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-miami-gold pointer-events-none"
                  />
                )}
                <span
                  className={`material-symbols-outlined text-xl relative z-10 ${
                    isActive ? 'nav-icon-pop' : ''
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
              </span>
              <span className="font-bebas text-[10px] tracking-wider">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
