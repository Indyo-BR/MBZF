import { useLocation } from 'react-router-dom'

const TICKETS_URL = 'https://www.danceplace.com/book/it/16431/MiamiAPP'

export default function TicketFab() {
  const location = useLocation()

  // Hide on home (per design hierarchy) and on the immersive Videos page,
  // where nothing scrolls and the FAB would permanently cover the video.
  if (location.pathname === '/' || location.pathname === '/videos') return null

  return (
    <a
      href={TICKETS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy Tickets"
      className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] right-5 w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform z-[55]"
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
        confirmation_number
      </span>
    </a>
  )
}
