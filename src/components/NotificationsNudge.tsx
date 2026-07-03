import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { initPush, OneSignal } from '../lib/push'
import { isStandalone } from '../lib/pwa'

const DISMISS_KEY = 'mbzf-notif-nudge-dismissed'

/**
 * One-time prompt shown INSIDE the installed app when notifications are still
 * off — reinforces why they matter, then opts the user in. Sits alongside the
 * always-present AlertsButton; InstallPrompt covers the not-yet-installed case.
 */
export default function NotificationsNudge() {
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isStandalone()) return // only nag inside the installed PWA
    if (localStorage.getItem(DISMISS_KEY)) return
    let alive = true
    initPush()
      .then(() => {
        if (!alive) return
        const denied = OneSignal.Notifications.permissionNative === 'denied'
        const on = OneSignal.User.PushSubscription.optedIn
        if (!on && !denied) {
          // Let the app settle first so it doesn't slam the user on open.
          setTimeout(() => alive && setVisible(true), 2200)
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!visible) return null

  const close = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const enable = async () => {
    setBusy(true)
    try {
      await OneSignal.User.PushSubscription.optIn()
    } finally {
      setBusy(false)
      close()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-end justify-center" onClick={close}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-surface rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-sheet-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-4" />

        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-flamingo-pink/15 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-flamingo-pink text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              notifications_active
            </span>
          </div>
        </div>

        <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">
          Don't Miss a Beat
        </h3>
        <p className="text-center text-sm text-outline mt-1 mb-5 px-2 leading-snug">
          Turn on notifications and the app tells you the moment your{' '}
          <strong className="text-dark-surface">classes start</strong>, when the{' '}
          <strong className="text-dark-surface">parties kick off</strong>, and any last-minute
          schedule changes. It's the whole reason to have the app.
        </p>

        <button
          onClick={enable}
          disabled={busy}
          className="w-full bg-flamingo-pink text-white py-3.5 rounded-full font-bebas text-xl tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            notifications
          </span>
          {busy ? '· · ·' : 'ENABLE NOTIFICATIONS'}
        </button>
        <button
          onClick={close}
          className="w-full mt-2 py-3 font-bebas text-lg tracking-widest text-outline"
        >
          Maybe later
        </button>
      </div>
    </div>,
    document.body
  )
}
