export type Platform = 'ios' | 'android' | 'inapp' | 'other'

/** True when the app is already running as an installed PWA. */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function detectPlatform(): Platform {
  const ua = navigator.userAgent || ''
  // In-app browsers (Instagram, Facebook, etc.) cannot install PWAs.
  if (/FBAN|FBAV|Instagram|Line|MicroMessenger|Snapchat|Pinterest/i.test(ua)) return 'inapp'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}
