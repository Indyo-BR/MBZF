import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { artists } from '../data/artists'
import FadeInImage from '../components/FadeInImage'

function getCountdown() {
  const target = new Date('2027-04-22T00:00:00').getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  return { days, hours, mins }
}

// Event venue used by the maps apps.
const EVENT_QUERY = encodeURIComponent('Holiday Inn Miami Beach-Oceanfront, Miami Beach, FL')

const mapsOptions = [
  {
    label: 'Google Maps',
    icon: 'map',
    url: `https://www.google.com/maps/search/?api=1&query=${EVENT_QUERY}`,
  },
  {
    label: 'Waze',
    icon: 'navigation',
    url: `https://waze.com/ul?q=${EVENT_QUERY}&navigate=yes`,
  },
  {
    label: 'Apple Maps',
    icon: 'pin_drop',
    url: `https://maps.apple.com/?q=${EVENT_QUERY}`,
  },
]

// Festival event used by the calendar apps.
const CAL_TITLE = 'Miami Beach Zouk Festival 2027'
const CAL_VENUE = 'Holiday Inn Miami Beach-Oceanfront, Miami Beach, FL'
const CAL_DETAILS =
  'Brazilian Zouk dance festival — workshops, parties and shows. https://mbzf.netlify.app'

const googleCalUrl =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  `&text=${encodeURIComponent(CAL_TITLE)}` +
  '&dates=20270422/20270427' +
  `&location=${encodeURIComponent(CAL_VENUE)}` +
  `&details=${encodeURIComponent(CAL_DETAILS)}`

const calendarOptions = [
  { label: 'Google Calendar', sub: 'Google account', icon: 'event', url: googleCalUrl, external: true },
  { label: 'Apple Calendar', sub: 'iOS', icon: 'calendar_today', url: '/event.ics', external: false },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(getCountdown())
  const [mapsOpen, setMapsOpen] = useState(false)
  const [calOpen, setCalOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[520px] w-full flex flex-col items-center justify-center overflow-hidden bg-wood-brown">
        <FadeInImage
          alt="Festival Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://loremflickr.com/800/1200/miami,beach,pool,palm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-surface" />

        <div className="relative z-10 w-full px-6 flex flex-col items-center">
          {/* Countdown */}
          <div className="reveal flex gap-6 mb-10">
            {[
              { v: String(countdown.days).padStart(2, '0'), label: 'Days' },
              { v: String(countdown.hours).padStart(2, '0'), label: 'Hours' },
              { v: String(countdown.mins).padStart(2, '0'), label: 'Mins' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="font-bebas text-5xl text-miami-gold drop-shadow-md leading-none">{item.v}</span>
                <span className="font-bebas text-white text-sm tracking-widest mt-1">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Info cards */}
          <div className="reveal grid grid-cols-2 gap-4 w-full mb-6" style={{ animationDelay: '90ms' }}>
            {/* Date → add-to-calendar picker */}
            <button
              onClick={() => setCalOpen(true)}
              className="glass-panel p-4 rounded-xl border border-white/40 shadow-card flex flex-col items-center text-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-flamingo-pink mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                calendar_month
              </span>
              <p className="font-bebas text-dark-surface tracking-wider">April 22–26</p>
              <p className="text-[10px] uppercase font-bold text-outline">Add to calendar</p>
            </button>

            {/* Location → open maps app picker */}
            <button
              onClick={() => setMapsOpen(true)}
              className="glass-panel p-4 rounded-xl border border-white/40 shadow-card flex flex-col items-center text-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-miami-turquoise mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
              <p className="font-bebas text-dark-surface tracking-wider">Holiday Inn</p>
              <p className="text-[10px] uppercase font-bold text-outline">Miami Beach Oceanfront</p>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/schedule')}
            className="reveal w-full bg-flamingo-pink text-white py-4 rounded-full font-bebas text-2xl tracking-widest shadow-card active:scale-95 transition-transform"
            style={{ animationDelay: '170ms' }}
          >
            SCHEDULE
          </button>
          <a
            href="https://www.danceplace.com/pt/index/no/16431/Miami+Beach+Zouk+Festival-2027-Miami+Beach_+FL-United+States-Brazilian+Zouk+Dance+event"
            target="_blank"
            rel="noopener noreferrer"
            className="reveal w-full mt-3 block text-center bg-flamingo-pink text-white py-4 rounded-full font-bebas text-2xl tracking-widest shadow-card active:scale-95 transition-transform"
            style={{ animationDelay: '230ms' }}
          >
            Buy Tickets
          </a>
        </div>
      </section>

      {/* Featured artists */}
      <section className="reveal mt-4 px-6 pb-6" style={{ animationDelay: '300ms' }}>
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-bebas text-primary text-2xl tracking-wide">FEATURED ARTISTS</h2>
          <button onClick={() => navigate('/artists')} className="font-bebas text-secondary text-sm tracking-widest underline">
            VIEW ALL
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {artists.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/artists/${a.id}`)}
              className="flex-shrink-0 w-24 active:scale-95 transition-transform"
            >
              <div className="skeleton w-24 h-24 rounded-full border-4 border-flamingo-pink p-1">
                <FadeInImage
                  src={a.photo}
                  alt={a.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <p className="text-center font-bold mt-2 text-xs text-dark-surface">{a.name.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Maps app picker — bottom sheet */}
      {mapsOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          onClick={() => setMapsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-surface rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-4" />
            <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">Get Directions</h3>
            <p className="text-center text-xs text-outline mb-5">Holiday Inn Miami Beach-Oceanfront</p>

            <div className="space-y-3">
              {mapsOptions.map((m) => (
                <a
                  key={m.label}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMapsOpen(false)}
                  className="flex items-center gap-3 w-full bg-surface-container border border-outline-variant/60 rounded-2xl px-4 py-3.5 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-miami-turquoise">{m.icon}</span>
                  <span className="font-bebas text-lg tracking-wide text-dark-surface">{m.label}</span>
                  <span className="material-symbols-outlined text-outline ml-auto text-lg">open_in_new</span>
                </a>
              ))}
            </div>

            <button
              onClick={() => setMapsOpen(false)}
              className="w-full mt-4 py-3 font-bebas text-lg tracking-widest text-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add-to-calendar picker — bottom sheet */}
      {calOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          onClick={() => setCalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-surface rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-4" />
            <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">Add to Calendar</h3>
            <p className="text-center text-xs text-outline mb-5">Miami Beach Zouk Festival · April 22–26</p>

            <div className="space-y-3">
              {calendarOptions.map((c) => (
                <a
                  key={c.label}
                  href={c.url}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={() => setCalOpen(false)}
                  className="flex items-center gap-3 w-full bg-surface-container border border-outline-variant/60 rounded-2xl px-4 py-3.5 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-flamingo-pink">{c.icon}</span>
                  <span className="flex flex-col text-left">
                    <span className="font-bebas text-lg tracking-wide text-dark-surface leading-none">{c.label}</span>
                    <span className="text-[11px] text-outline mt-0.5">{c.sub}</span>
                  </span>
                  <span className="material-symbols-outlined text-outline ml-auto text-lg">chevron_right</span>
                </a>
              ))}
            </div>

            <button
              onClick={() => setCalOpen(false)}
              className="w-full mt-4 py-3 font-bebas text-lg tracking-widest text-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
