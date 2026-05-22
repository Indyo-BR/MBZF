import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import TicketFab from './components/TicketFab'
import InstallPrompt from './components/InstallPrompt'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import PartiesPage from './pages/PartiesPage'
import ArtistsPage from './pages/ArtistsPage'
import ArtistDetailPage from './pages/ArtistDetailPage'
import VideosPage from './pages/VideosPage'

/**
 * Routed pages with a fade transition on navigation. Keying the wrapper
 * by pathname remounts it on every route change, so the fade — and each
 * page's staggered entrance — replays. Scroll resets to the top too.
 */
function RoutedPages() {
  const location = useLocation()

  useEffect(() => {
    document.querySelector('.page-scroll')?.scrollTo({ top: 0 })
  }, [location.pathname])

  // Videos needs a fixed-height wrapper for its internal snap scroll;
  // every other page grows with its content so the bottom padding works.
  const fullHeight = location.pathname === '/videos'

  return (
    <div key={location.pathname} className={`page-fade ${fullHeight ? 'h-full' : 'min-h-full'}`}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/parties" element={<PartiesPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:id" element={<ArtistDetailPage />} />
        <Route path="/videos" element={<VideosPage />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <div className="page-container max-w-md mx-auto bg-surface relative shadow-xl">
      <Header />
      <main className="page-scroll">
        <RoutedPages />
      </main>
      <TicketFab />
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
