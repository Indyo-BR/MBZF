import FadeInImage from '../components/FadeInImage'

interface Party {
  id: string
  /** Accessible label (the party name is baked into the artwork). */
  name: string
  date: string
  image: string
  /** CSS aspect-ratio matching the source art, so nothing gets cropped. */
  aspect: string
}

// Ordered by festival day: pre-party first, after-party last.
const parties: Party[] = [
  { id: 'pre', name: 'Pre Party', date: 'THU · APR 22', image: '/parties/pre-party.jpg', aspect: '1080 / 540' },
  { id: 'neon', name: 'Neon Party', date: 'FRI · APR 23', image: '/parties/neon-party.jpg', aspect: '1080 / 540' },
  { id: 'vegas', name: 'A Night in Vegas', date: 'SAT · APR 24', image: '/parties/vegas-party.jpg', aspect: '1080 / 540' },
  { id: 'tropical', name: 'Tropical Party', date: 'SUN · APR 25', image: '/parties/tropical-party.jpg', aspect: '1080 / 602' },
  { id: 'after', name: 'After Party', date: 'MON · APR 26', image: '/parties/after-party.jpg', aspect: '1080 / 602' },
]

export default function PartiesPage() {
  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="reveal font-bebas text-5xl text-primary mb-2 leading-none">Parties</h1>
      <p className="reveal text-sm text-outline mb-6" style={{ animationDelay: '60ms' }}>
        Themed nights across the festival week.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {parties.map((p, i) => (
          <div key={p.id} className="reveal" style={{ animationDelay: `${120 + i * 90}ms` }}>
            <div
              className="skeleton relative w-full rounded-2xl overflow-hidden shadow-card"
              style={{ aspectRatio: p.aspect }}
            >
              <FadeInImage src={p.image} alt={p.name} className="w-full h-full object-cover" priority={i === 0} />
            </div>
            <p className="font-bebas text-miami-gold text-sm tracking-widest mt-2 ml-1">{p.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
