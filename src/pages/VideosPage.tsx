import { useState } from 'react'

interface Reel {
  id: string
  title: string
  sub: string
  /**
   * YouTube video ID — works for both normal videos and Shorts.
   * How to get it from a link:
   *   https://www.youtube.com/shorts/ABC123xyz   → youtubeId: 'ABC123xyz'
   *   https://www.youtube.com/watch?v=ABC123xyz  → youtubeId: 'ABC123xyz'
   *   https://youtu.be/ABC123xyz                 → youtubeId: 'ABC123xyz'
   * For the best vertical (TikTok-style) look, use YouTube Shorts.
   */
  youtubeId: string
}

// ⚠️ PLACEHOLDER videos — replace `youtubeId` with the festival's real clips.
const reels: Reel[] = [
  { id: '1', title: 'Zouk Sunset Vibes', sub: 'Beach Side Socials', youtubeId: 'kJQP7kiw5Fk' },
  { id: '2', title: 'Main Stage Show', sub: '2026 Recap Highlights', youtubeId: '9bZkp7q19f0' },
  { id: '3', title: 'Pool Flamingo Party', sub: 'Saturday Night Energy', youtubeId: 'pRpeEdMmmQ0' },
]

function ReelCard({
  reel,
  active,
  onPlay,
}: {
  reel: Reel
  active: boolean
  onPlay: () => void
}) {
  const thumb = `https://img.youtube.com/vi/${reel.youtubeId}/hqdefault.jpg`
  const embed =
    `https://www.youtube.com/embed/${reel.youtubeId}` +
    `?autoplay=1&playsinline=1&rel=0&modestbranding=1`

  return (
    <div className="relative h-[calc(100dvh-160px)] min-h-[420px] w-full snap-start overflow-hidden bg-black">
      {active ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embed}
          title={reel.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button onClick={onPlay} className="absolute inset-0 w-full h-full text-left">
          <img
            src={thumb}
            alt={reel.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 rounded-full bg-flamingo-pink/90 flex items-center justify-center shadow-xl">
              <span
                className="material-symbols-outlined text-white text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
            </div>
          </div>
          <div className="absolute bottom-10 left-6 right-6 text-white">
            <h2 className="font-bebas text-3xl tracking-wide">{reel.title}</h2>
            <p className="text-sm opacity-80">{reel.sub}</p>
          </div>
        </button>
      )}
    </div>
  )
}

export default function VideosPage() {
  // Only one reel plays at a time — tapping a new one stops the previous.
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <div className="h-full snap-y snap-mandatory overflow-y-auto hide-scrollbar bg-black">
      {reels.map((r) => (
        <ReelCard
          key={r.id}
          reel={r}
          active={activeId === r.id}
          onPlay={() => setActiveId(r.id)}
        />
      ))}
    </div>
  )
}
