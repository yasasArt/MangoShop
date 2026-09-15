'use client'

import { usePathname } from 'next/navigation'

/** The admin panel has its own chrome, so the shop header/footer sit this one out. */
export function StorefrontOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null
  return <>{children}</>
}
