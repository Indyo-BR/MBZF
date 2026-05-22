export default function Header() {
  return (
    <header className="w-full bg-flamingo-dark shadow-sm shrink-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-center px-6 py-2 h-[89px]">
        <img
          src="/logo.png"
          alt="Miami Beach Zouk Festival"
          className="h-[73px] w-auto object-contain"
        />
      </div>
    </header>
  )
}
