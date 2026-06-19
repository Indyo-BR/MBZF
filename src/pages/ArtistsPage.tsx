import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { artists } from '../data/artists'
import FadeInImage from '../components/FadeInImage'

type Kind = 'instructor' | 'dj'

const TABS: { kind: Kind; label: string }[] = [
  { kind: 'instructor', label: 'Artists' },
  { kind: 'dj', label: 'DeeJays' },
]

export default function ArtistsPage() {
  const navigate = useNavigate()
  // Active tab lives in the URL (?tab=dj) so it survives going back from a detail page.
  const [searchParams, setSearchParams] = useSearchParams()
  const kind: Kind = searchParams.get('tab') === 'dj' ? 'dj' : 'instructor'
  const setKind = (k: Kind) =>
    setSearchParams(k === 'dj' ? { tab: 'dj' } : {}, { replace: true })
  const [query, setQuery] = useState('')
  const filtered = artists.filter(
    (a) =>
      a.kind === kind &&
      (a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.role.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="reveal font-bebas text-5xl text-primary mb-2 leading-none">Artists</h1>
      <p className="reveal text-sm text-outline mb-6" style={{ animationDelay: '40ms' }}>
        Instructors and DeeJays of the festival.
      </p>

      {/* Artists / DeeJays toggle */}
      <div className="reveal flex gap-2 mb-6" style={{ animationDelay: '50ms' }}>
        {TABS.map((t) => (
          <button
            key={t.kind}
            onClick={() => setKind(t.kind)}
            className={`flex-1 py-2.5 rounded-full font-bebas tracking-widest text-base transition-all duration-200 active:scale-95 ${
              kind === t.kind ? 'bg-primary text-white' : 'bg-surface-container-highest text-dark-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="reveal relative mb-8" style={{ animationDelay: '70ms' }}>
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
          search
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-outline-variant bg-surface-container text-sm focus:border-flamingo-pink outline-none transition-all"
          placeholder="Search artists..."
          type="search"
          inputMode="search"
          aria-label="Search artists"
        />
      </div>

      {filtered.length === 0 && (
        <div className="reveal flex flex-col items-center text-center pt-10">
          <span className="material-symbols-outlined text-outline-variant text-5xl mb-2">search_off</span>
          <p className="font-bebas text-2xl text-primary tracking-wide">No artists found</p>
          <p className="text-sm text-outline mt-1">Try a different name.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((a, i) => (
          <button
            key={a.id}
            onClick={() => navigate(`/artists/${a.id}`)}
            className="reveal flex flex-col items-center active:scale-95 transition-transform"
            style={{ animationDelay: `${120 + i * 70}ms` }}
          >
            <div className="mb-3">
              <div className="skeleton w-32 h-32 rounded-full border-[6px] border-flamingo-pink p-1">
                <FadeInImage
                  src={a.photo}
                  alt={a.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <h3 className="font-bebas text-xl text-dark-surface leading-none text-center">{a.name}</h3>
            <p className="text-[10px] uppercase font-bold text-outline tracking-wider mt-1">{a.role}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
