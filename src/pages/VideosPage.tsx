interface Reel {
  id: string
  title: string
  /**
   * YouTube video ID — works for normal videos and Shorts alike.
   * From a link, the ID is the part after `v=`, `/shorts/` or `youtu.be/`:
   *   https://www.youtube.com/watch?v=ABC123  → 'ABC123'
   *   https://www.youtube.com/shorts/ABC123   → 'ABC123'
   * For the best vertical look, use YouTube Shorts.
   */
  youtubeId: string
}

// ⚠️ PLACEHOLDER clips — replace `youtubeId` with the festival's real videos.
const reels: Reel[] = [
  { id: '1', title: 'Zouk Sunset Vibes', youtubeId: 'kJQP7kiw5Fk' },
  { id: '2', title: 'Main Stage Show', youtubeId: '9bZkp7q19f0' },
  { id: '3', title: 'Pool Flamingo Party', youtubeId: 'RgKAFK5djSk' },
]

export default function VideosPage() {
  return (
    <div className="h-full snap-y snap-mandatory overflow-y-auto hide-scrollbar bg-black">
      {reels.map((r) => (
        <div
          key={r.id}
          className="relative h-[calc(100dvh-200px)] min-h-[440px] w-full snap-start bg-black"
        >
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${r.youtubeId}?playsinline=1&rel=0`}
            title={r.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ))}
    </div>
  )
}
