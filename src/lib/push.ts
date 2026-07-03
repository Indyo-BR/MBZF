import OneSignal from 'react-onesignal'

const ONESIGNAL_APP_ID = 'e62fa68b-91d7-4b40-aa7d-97ec3bc6de16'

let initPromise: Promise<void> | null = null

/**
 * Idempotent OneSignal SDK init — safe to call from anywhere, any number
 * of times (App on mount, AlertsButton on demand). No auto-prompt: the
 * permission request is driven exclusively by the AlertsButton.
 */
export function initPush(): Promise<void> {
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      // Keep OneSignal's worker in its own scope, away from the app SW at '/'.
      serviceWorkerPath: 'push/OneSignalSDKWorker.js',
      serviceWorkerParam: { scope: '/push/' },
      autoResubscribe: true,
      // Local preview (prod build served on localhost) still needs to subscribe.
      allowLocalhostAsSecureOrigin: location.hostname === 'localhost',
    }).catch((e: unknown) => {
      console.warn('[push] OneSignal init failed:', e)
      // Allow a retry on the next call instead of caching the failure forever.
      initPromise = null
      throw e
    })
  }
  return initPromise
}

export { OneSignal }
