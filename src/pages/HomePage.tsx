import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { artists } from '../data/artists'

function getCountdown() {
  const target = new Date('2027-04-22T00:00:00').getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const mins = Math.floor((diff / (1000 * 60)) % 60)
  return { days, hours, mins }
}

// Event location used by the maps apps.
const EVENT_QUERY = encodeURIComponent('Ocean Drive, Miami Beach, FL, United States')

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

export default function HomePage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(getCountdown())
  const [mapsOpen, setMapsOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown()), 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[80vh] min-h-[520px] w-full flex flex-col items-center justify-center overflow-hidden">
        <img
          alt="Festival Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://loremflickr.com/800/1200/miami,beach,pool,palm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-surface" />

        <div className="relative z-10 w-full px-6 flex flex-col items-center">
          {/* Countdown */}
          <div className="flex gap-6 mb-10">
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
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            {/* Date → add to calendar (.ics) */}
            <a
              href="/event.ics"
              className="glass-panel p-4 rounded-xl border border-white/40 flex flex-col items-center text-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-flamingo-pink mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                calendar_month
              </span>
              <p className="font-bebas text-dark-surface tracking-wider">April 22–26</p>
              <p className="text-[10px] uppercase font-bold text-outline">Add to calendar</p>
            </a>

            {/* Location → open maps app picker */}
            <button
              onClick={() => setMapsOpen(true)}
              className="glass-panel p-4 rounded-xl border border-white/40 flex flex-col items-center text-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-miami-turquoise mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
              <p className="font-bebas text-dark-surface tracking-wider">Ocean Drive</p>
              <p className="text-[10px] uppercase font-bold text-outline">Get directions</p>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/schedule')}
            className="w-full bg-flamingo-pink text-white py-4 rounded-full font-bebas text-2xl tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            SCHEDULE
          </button>
          <a
            href="https://www.danceplace.com/pt/index/no/16431/Miami+Beach+Zouk+Festival-2027-Miami+Beach_+FL-United+States-Brazilian+Zouk+Dance+event"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 block text-center bg-flamingo-pink text-white py-4 rounded-full font-bebas text-2xl tracking-widest shadow-lg active:scale-95 transition-transform"
          >
            Buy Tickets
          </a>
        </div>
      </section>

      {/* Featured artists */}
      <section className="mt-4 px-6 pb-6">
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
              className="flex-shrink-0 w-24"
            >
              <div className="w-24 h-24 rounded-full border-4 border-flamingo-pink p-1">
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover rounded-full" />
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
            <p className="text-center text-xs text-outline mb-5">Ocean Drive · Miami Beach, FL</p>

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
    </div>
  )
}
