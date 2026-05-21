import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import TicketFab from './components/TicketFab'
import InstallPrompt from './components/InstallPrompt'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import BallroomsPage from './pages/BallroomsPage'
import ArtistsPage from './pages/ArtistsPage'
import ArtistDetailPage from './pages/ArtistDetailPage'
import VideosPage from './pages/VideosPage'

export default function App() {
  return (
    <div className="page-container max-w-md mx-auto bg-surface relative shadow-xl">
      <Header />
      <main className="page-scroll">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/ballrooms" element={<BallroomsPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/artists/:id" element={<ArtistDetailPage />} />
          <Route path="/videos" element={<VideosPage />} />
        </Routes>
      </main>
      <TicketFab />
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
