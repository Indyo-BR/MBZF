import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { initPush, OneSignal } from '../lib/push'
import { detectPlatform, isStandalone } from '../lib/pwa'

type AlertState =
  | 'loading' // SDK still initializing
  | 'off' // supported, not subscribed yet
  | 'on' // subscribed
  | 'denied' // browser permission denied — must be re-enabled in settings
  | 'install' // iOS / in-app browser: must install to Home Screen first
  | 'unsupported' // no push at all — button hidden

function readState(): AlertState {
  if (OneSignal.Notifications.permissionNative === 'denied') return 'denied'
  return OneSignal.User.PushSubscription.optedIn ? 'on' : 'off'
}

export default function AlertsButton() {
  const [state, setState] = useState<AlertState>(() => {
    const platform = detectPlatform()
    // iOS Safari and in-app browsers only get push once installed to the
    // Home Screen — guide the install instead of a prompt that can't work.
    if ((platform === 'ios' || platform === 'inapp') && !isStandalone()) return 'install'
    if (!('PushManager' in window)) return 'unsupported'
    return 'loading'
  })
  const [sheet, setSheet] = useState<'none' | 'install' | 'denied' | 'on'>('none')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (state !== 'loading') return
    let alive = true
    const sync = () => {
      if (alive) setState(readState())
    }
    initPush()
      .then(() => {
        sync()
        OneSignal.User.PushSubscription.addEventListener('change', sync)
      })
      .catch(() => {
        if (alive) setState('unsupported')
      })
    return () => {
      alive = false
      OneSignal.User.PushSubscription.removeEventListener('change', sync)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'unsupported') return null

  const enable = async () => {
    setBusy(true)
    try {
      await OneSignal.User.PushSubscription.optIn()
      setState(readState())
    } catch {
      setState(readState())
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    try {
      await OneSignal.User.PushSubscription.optOut()
      setState(readState())
    } finally {
      setBusy(false)
      setSheet('none')
    }
  }

  const onClick = () => {
    if (busy || state === 'loading') return
    if (state === 'install') setSheet('install')
    else if (state === 'denied') setSheet('denied')
    else if (state === 'on') setSheet('on')
    else enable()
  }

  const isOn = state === 'on'

  return (
    <>
      <button
        onClick={onClick}
        aria-label={isOn ? 'Festival alerts are on' : 'Get festival alerts'}
        className="reveal w-full mt-3 glass-panel border border-white/40 shadow-card text-dark-surface py-3.5 rounded-full font-bebas text-xl tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"
        style={{ animationDelay: '290ms' }}
      >
        <span
          className={`material-symbols-outlined ${isOn ? 'text-tropical-green' : 'text-flamingo-pink'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isOn ? 'notifications_active' : 'notifications'}
        </span>
        {state === 'loading' || busy ? '· · ·' : isOn ? 'ALERTS ON' : 'GET FESTIVAL ALERTS'}
      </button>

      {/* Portal: the button lives inside the hero's z-10 stacking context,
          which would trap the sheet below the bottom nav (z-60). */}
      {sheet !== 'none' && createPortal(
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          onClick={() => setSheet('none')}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-surface rounded-t-3xl px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-sheet-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-outline-variant rounded-full mx-auto mb-4" />

            {sheet === 'install' && (
              <>
                <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">
                  Install First
                </h3>
                <p className="text-center text-xs text-outline mt-1 mb-5 px-2">
                  To receive festival alerts on iPhone, add the app to your Home Screen, then
                  open it and tap the bell again.
                </p>
                <SheetStep n={1} icon="ios_share" text="Tap the Share button in the Safari toolbar" />
                <SheetStep n={2} icon="add_to_home_screen" text={'Scroll down and tap "Add to Home Screen"'} />
                <SheetStep n={3} icon="notifications" text="Open the installed app and tap GET FESTIVAL ALERTS" />
              </>
            )}

            {sheet === 'denied' && (
              <>
                <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">
                  Notifications Blocked
                </h3>
                <p className="text-center text-xs text-outline mt-1 mb-5 px-2">
                  Notifications are turned off for this app in your browser or device settings.
                  Enable them there, then come back and tap the bell again.
                </p>
              </>
            )}

            {sheet === 'on' && (
              <>
                <h3 className="font-bebas text-2xl text-primary tracking-wide text-center">
                  You're All Set
                </h3>
                <p className="text-center text-xs text-outline mt-1 mb-5 px-2">
                  You'll get festival reminders and live updates during the event.
                </p>
                <button
                  onClick={disable}
                  disabled={busy}
                  className="w-full py-3 font-bebas text-lg tracking-widest text-outline"
                >
                  Turn off alerts
                </button>
              </>
            )}

            <button
              onClick={() => setSheet('none')}
              className="w-full mt-2 bg-flamingo-pink text-white py-3.5 rounded-full font-bebas text-xl tracking-widest active:scale-95 transition-transform"
            >
              Got it
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function SheetStep({ n, icon, text }: { n: number; icon: string; text: string }) {
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
