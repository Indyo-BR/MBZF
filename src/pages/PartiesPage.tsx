interface Party {
  id: string
  title: string
  date: string
  venue: string
  /** Material Symbols icon name. */
  icon: string
  /** Tailwind gradient classes (full strings so JIT picks them up). */
  gradient: string
}

const parties: Party[] = [
  {
    id: 'white',
    title: 'White Night',
    date: 'Friday · April 23',
    venue: 'Grand Ballroom',
    icon: 'nightlife',
    gradient: 'from-slate-800 via-slate-600 to-slate-400',
  },
  {
    id: 'pool',
    title: 'Pool Flamingo',
    date: 'Saturday · April 24',
    venue: 'Resort Pool Deck',
    icon: 'pool',
    gradient: 'from-cyan-500 via-miami-turquoise to-flamingo-pink',
  },
  {
    id: 'carnival',
    title: 'Carnival Gala',
    date: 'Sunday · April 25',
    venue: 'Grand Theater',
    icon: 'celebration',
    gradient: 'from-secondary via-flamingo-pink to-miami-gold',
  },
]

export default function PartiesPage() {
  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="reveal font-bebas text-5xl text-primary mb-2 leading-none">Parties</h1>
      <p className="reveal text-sm text-outline mb-6" style={{ animationDelay: '60ms' }}>
        Themed nights across the festival week.
      </p>

      <div className="grid grid-cols-1 gap-5">
        {parties.map((p, i) => (
          <div
            key={p.id}
            className={`reveal relative h-44 rounded-2xl overflow-hidden shadow-card bg-gradient-to-br ${p.gradient}`}
            style={{ animationDelay: `${120 + i * 90}ms` }}
          >
            {/* Decorative watermark icon */}
            <span
              className="material-symbols-outlined absolute -right-3 -bottom-8 text-white/15 leading-none select-none"
              style={{ fontSize: '160px', fontVariationSettings: "'FILL' 1" }}
            >
              {p.icon}
            </span>

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute top-4 left-5">
              <span
                className="material-symbols-outlined text-white/90"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {p.icon}
              </span>
            </div>

            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="font-bebas text-4xl text-white leading-none drop-shadow-md">{p.title}</h2>
              <p className="font-bebas text-miami-gold text-sm tracking-widest mt-1">{p.date}</p>
              <p className="text-[11px] text-white/80 mt-0.5">{p.venue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
