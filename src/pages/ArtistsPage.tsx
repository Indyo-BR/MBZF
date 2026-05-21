import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { artists } from '../data/artists'

export default function ArtistsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.role.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-6 pt-6 pb-6">
      <h1 className="font-bebas text-5xl text-primary mb-6 leading-none">Artists</h1>

      <div className="relative mb-8">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-outline-variant bg-surface-container text-sm focus:border-flamingo-pink outline-none transition-all"
          placeholder="Search artists..."
          type="text"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate(`/artists/${a.id}`)}
            className="flex flex-col items-center active:scale-95 transition-transform"
          >
            <div className="mb-3">
              <div className="w-32 h-32 rounded-full border-[6px] border-flamingo-pink p-1">
                <img src={a.photo} alt={a.name} className="w-full h-full object-cover rounded-full" />
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
