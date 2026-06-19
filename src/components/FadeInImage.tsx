import { useState } from 'react'
import type { ImgHTMLAttributes, SyntheticEvent } from 'react'

/**
 * Drop-in <img> replacement: starts transparent and fades in smoothly
 * once the image finishes loading, so photos never "pop" abruptly.
 * Pair it with a `skeleton` class on the parent container for a
 * shimmer placeholder while loading.
 */
export default function FadeInImage({
  className = '',
  onLoad,
  onError,
  priority = false,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true)
    onLoad?.(e)
  }
  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true)
    onError?.(e)
  }

  return (
    <img
      {...props}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={`img-fade ${loaded ? 'is-loaded' : ''} ${className}`}
    />
  )
}
