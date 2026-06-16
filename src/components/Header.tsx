import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="relative w-full bg-flamingo-dark shrink-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-center px-6 py-2 h-[111px]">
        <Link to="/" aria-label="Go to home" className="active:scale-95 transition-transform">
          <img
            src="/logo.png"
            alt="Miami Beach Zouk Festival"
            className="h-[95px] w-auto object-contain"
          />
        </Link>
      </div>
      {/* Soft gradient fade so the header melts into the content instead of a hard edge. */}
      <div className="pointer-events-none absolute inset-x-0 top-full h-12 bg-gradient-to-b from-flamingo-dark to-flamingo-dark/0" />
    </header>
  )
}
