import { useParams, useNavigate } from 'react-router-dom'
import { artists } from '../data/artists'
import FadeInImage from '../components/FadeInImage'

/** Instagram brand glyph. */
function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0m0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324M12 16a4 4 0 110-8 4 4 0 010 8m6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881" />
    </svg>
  )
}

export default function ArtistDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const artist = artists.find((a) => a.id === id)

  if (!artist) {
    return (
      <div className="px-6 pt-12 text-center">
        <p className="font-bebas text-3xl text-primary">Artist not found</p>
        <button
          onClick={() => navigate('/artists')}
          className="mt-4 font-bebas tracking-widest text-secondary underline"
        >
          Back to Artists
        </button>
      </div>
    )
  }

  // "Privates" contact link. Currently points to WhatsApp, but can be
  // swapped per artist to any contact channel (email, form, IG, etc.).
  const privatesMessage = encodeURIComponent(
    `Hi ${artist.name}! I'm interested in private lessons (Privates) at the Miami Beach Zouk Festival.`
  )
  const privatesLink = `https://wa.me/${artist.whatsapp}?text=${privatesMessage}`
  const igLink = `https://instagram.com/${artist.instagram}`

  return (
    <div className="pb-10">
      {/* Hero photo */}
      <div className="skeleton relative h-80 w-full overflow-hidden">
        <FadeInImage
          src={artist.photo}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

        <button
          onClick={() => navigate('/artists')}
          aria-label="Back"
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="font-bebas text-5xl text-white leading-none">{artist.name}</h1>
          <p className="font-bebas text-miami-gold tracking-widest text-sm mt-1">
            {artist.role}
            {artist.origin && ` · ${artist.origin}`}
          </p>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* Biography */}
        <section className="reveal mb-6" style={{ animationDelay: '60ms' }}>
          <h2 className="font-bebas text-2xl text-primary tracking-wide mb-2">Biography</h2>
          <p className="text-sm text-on-surface/80 leading-relaxed">{artist.bio}</p>
        </section>

        {/* Curiosity */}
        <section className="reveal mb-8" style={{ animationDelay: '140ms' }}>
          <h2 className="font-bebas text-2xl text-primary tracking-wide mb-2">Did you know?</h2>
          <p className="text-sm text-on-surface/60 italic leading-relaxed">{artist.curiosity}</p>
        </section>

        {/* Privates CTA — instructors only (DJs show Instagram only) */}
        {artist.kind === 'instructor' && (
          <div className="reveal" style={{ animationDelay: '220ms' }}>
            <a
              href={privatesLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-flamingo-pink text-white py-4 rounded-full font-bebas text-2xl tracking-widest shadow-card active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
              Privates
            </a>
            <p className="text-center text-[11px] text-outline mt-2 mb-6">
              Private lessons · contact the artist directly
            </p>
          </div>
        )}

        {/* Instagram — smaller secondary button */}
        <a
          href={igLink}
          target="_blank"
          rel="noopener noreferrer"
          className="reveal flex items-center justify-center gap-2 w-1/2 mx-auto border-2 border-flamingo-pink text-flamingo-pink py-2.5 rounded-full font-bebas text-base tracking-widest active:scale-95 transition-transform"
          style={{ animationDelay: '300ms' }}
        >
          <InstagramIcon className="w-4 h-4" />
          Instagram
        </a>
      </div>
    </div>
  )
}
