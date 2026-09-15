'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/context/CartContext'
import type { SessionPayload } from '@/lib/session'

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
]

export function Navbar({ session }: { session: SessionPayload | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { count, ready } = useCart()

  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [pathname])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/')
    router.refresh()
  }

  function onSearch(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mango-100 bg-mango-50/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3 sm:h-20 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-mango-400 to-mango-600 text-lg shadow-sm">
            🥭
          </span>
          <span className="font-display text-xl leading-none text-bark-900">
            Mango<span className="text-mango-600">Shop</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-white text-mango-700 shadow-sm'
                    : 'text-bark-600 hover:bg-white/70 hover:text-bark-900'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-400"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.64 3.63a1 1 0 0 0 1.42-1.42l-3.64-3.63A5.5 5.5 0 0 0 9 3.5Zm-3.5 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search mangoes…"
              aria-label="Search products"
              className="w-full rounded-full border border-bark-200 bg-white py-2.5 pl-10 pr-4 text-sm text-bark-900 placeholder:text-bark-400 focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/cart"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-bark-700 shadow-sm ring-1 ring-bark-100 transition hover:text-mango-600"
            aria-label={`Cart${ready && count ? `, ${count} items` : ''}`}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M6 2a1 1 0 0 0 0 2h.6l1.6 8.4A2 2 0 0 0 10.16 14h5.3a2 2 0 0 0 1.95-1.56l1.1-4.8A1 1 0 0 0 17.54 6H8.1l-.3-1.6A2 2 0 0 0 5.84 2H6Z" />
              <circle cx="10" cy="17" r="1.5" />
              <circle cx="16" cy="17" r="1.5" />
            </svg>
            {ready && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-mango-600 px-1 text-[11px] font-bold text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {session ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-bark-100 transition hover:ring-mango-300"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-mango-100 text-sm font-bold text-mango-700">
                  {session.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-semibold text-bark-800 sm:block">
                  {session.name.split(' ')[0]}
                </span>
              </button>

              {accountOpen && (
                <div className="animate-pop absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-bark-100">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-bark-900">{session.name}</p>
                    <p className="truncate text-xs text-bark-500">{session.email}</p>
                  </div>
                  <div className="my-1 h-px bg-bark-100" />
                  {session.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-mango-700 transition hover:bg-mango-50"
                    >
                      Admin panel
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="block rounded-xl px-3 py-2 text-sm text-bark-700 transition hover:bg-mango-50"
                  >
                    My orders
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-bark-700 transition hover:bg-mango-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-bark-900 px-4 py-2.5 text-sm font-semibold text-mango-50 transition hover:bg-mango-600 sm:block"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-bark-700 shadow-sm ring-1 ring-bark-100 lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
              {menuOpen ? (
                <path d="M5.3 4.3a1 1 0 0 1 1.4 0L10 7.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 9l3.3 3.3a1 1 0 0 1-1.4 1.4L10 10.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 9 5.3 5.7a1 1 0 0 1 0-1.4Z" />
              ) : (
                <path d="M3 5.5A1 1 0 0 1 4 4.5h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 4.5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 3.5a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H4Z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-mango-100 bg-mango-50 lg:hidden">
          <div className="container-page space-y-1 py-4">
            <form onSubmit={onSearch} className="pb-2 md:hidden">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search mangoes…"
                aria-label="Search products"
                className="w-full rounded-full border border-bark-200 bg-white px-4 py-2.5 text-sm focus:border-mango-400 focus:outline-none focus:ring-2 focus:ring-mango-200"
              />
            </form>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-bark-700 transition hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <Link
                href="/login"
                className="mt-2 block rounded-full bg-bark-900 px-4 py-2.5 text-center text-sm font-semibold text-mango-50"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
