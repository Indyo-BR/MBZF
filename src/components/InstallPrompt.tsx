import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | 'inapp' | 'other'

/** True when the app is already running as an installed PWA. */
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent || ''
  // In-app browsers (Instagram, Facebook, etc.) cannot install PWAs.
  if (/FBAN|FBAV|Instagram|Line|MicroMessenger|Snapchat|Pinterest/i.test(ua)) return 'inapp'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}

function Step({ n, icon, text }: { n: number; icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-flamingo-pink text-white flex items-center justify-center font-bebas text-base">
        {n}
      </div>
      <span className="material-symbols-outlined text-miami-turquoise shrink-0">{icon}</span>
      <span className="text-sm text-dark-surface leading-snug">{text}</span>
    </div>
  )
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')

  useEffect(() => {
    if (isStandalone()) return // already installed — nothing to do
    if (sessionStorage.getItem('mbzf-install-dismissed')) return

    const p = detectPlatform()
    if (p === 'other') return // desktop — skip the home-screen prompt
    setPlatform(p)

    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    sessionStorage.setItem('mbzf-install-dismissed', '1')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-surface rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-4" />

        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-flamingo-pink/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-flamingo-pink text-3xl">
              install_mobile
            </span>
          </div>
        </div>

        {platform === 'inapp' ? (
          <>
            <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">
              Open in Your Browser
            </h3>
            <p className="text-center text-xs text-outline mt-1 mb-5 px-2">
              To install the app, open this page in Safari (iPhone) or Chrome (Android).
            </p>
            <Step n={1} icon="more_vert" text="Tap the menu in this window" />
            <Step
              n={2}
              icon="open_in_browser"
              text={'Choose "Open in browser", then add it to your Home Screen'}
            />
          </>
        ) : (
          <>
            <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">
              Install the App
            </h3>
            <p className="text-center text-xs text-outline mt-1 mb-5 px-2">
              Add Miami Beach Zouk to your Home Screen for the full experience.
            </p>
            {platform === 'ios' ? (
              <>
                <Step n={1} icon="ios_share" text="Tap the Share button in the Safari toolbar" />
                <Step
                  n={2}
                  icon="add_to_home_screen"
                  text={'Scroll down and tap "Add to Home Screen"'}
                />
              </>
            ) : (
              <>
                <Step n={1} icon="more_vert" text="Tap the menu (⋮) in the top-right of Chrome" />
                <Step
                  n={2}
                  icon="add_to_home_screen"
                  text={'Tap "Add to Home screen" (or "Install app")'}
                />
              </>
            )}
          </>
        )}

        <button
          onClick={dismiss}
          className="w-full mt-5 bg-flamingo-pink text-white py-3.5 rounded-full font-bebas text-xl tracking-widest active:scale-95 transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
