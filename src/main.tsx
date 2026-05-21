import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Register the service worker only in production builds.
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
  } else {
    // In dev, make sure no stale SW is caching Vite modules.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister())
    })
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)))
    }
  }
}

// Force-load Material Symbols Outlined font (some envs lazy-load fails)
;(async () => {
  try {
    const font = new FontFace(
      'Material Symbols Outlined',
      'url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v338/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsLjBuVY.woff2) format("woff2")',
      { style: 'normal', weight: '100 700', display: 'swap' }
    )
    await font.load()
    document.fonts.add(font)
  } catch (e) {
    console.warn('Material Symbols load failed', e)
  }
})()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
