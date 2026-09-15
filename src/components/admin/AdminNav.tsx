'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const items = [
  { href: '/admin', label: 'Dashboard', icon: '▦', exact: true },
  { href: '/admin/orders', label: 'Orders', icon: '🧾' },
  { href: '/admin/products', label: 'Products', icon: '🥭' },
  { href: '/admin/categories', label: 'Categories', icon: '🗂' },
  { href: '/admin/customers', label: 'Customers', icon: '👤' },
]

export function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/')
    router.refresh()
  }

  const nav = (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-mango-500 text-bark-900'
                : 'text-mango-100/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between gap-3 bg-bark-900 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-mango-500 text-sm">🥭</span>
          <span className="font-display">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && <div className="bg-bark-900 px-4 pb-4 lg:hidden">{nav}</div>}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-bark-900 p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-mango-400 to-mango-600 text-lg">
            🥭
          </span>
          <span>
            <span className="block font-display text-lg leading-tight">MangoShop</span>
            <span className="block text-xs text-mango-400">Admin panel</span>
          </span>
        </Link>

        <div className="mt-8 flex-1">{nav}</div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-mango-200/60">{email}</p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/"
              className="flex-1 whitespace-nowrap rounded-xl bg-white/10 px-2 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/20"
            >
              View shop
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex-1 whitespace-nowrap rounded-xl bg-white/10 px-2 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
