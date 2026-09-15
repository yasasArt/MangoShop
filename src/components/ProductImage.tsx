'use client'

import { useState } from 'react'

/**
 * Plain <img> rather than next/image so shop staff can paste any image URL
 * into the admin panel without touching next.config remotePatterns.
 */
export function ProductImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  /** Set on above-the-fold images so they are not lazy-loaded. */
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)

  return (
    <img
      src={failed || !src ? '/mangoes/placeholder.svg' : src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      sizes={sizes}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}
