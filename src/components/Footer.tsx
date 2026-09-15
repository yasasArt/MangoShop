import Link from 'next/link'

const columns = [
  {
    title: 'Shop',
    links: [
      { href: '/products', label: 'All mangoes' },
      { href: '/categories', label: 'Categories' },
      { href: '/products?sort=price-asc', label: 'Best value' },
      { href: '/products?featured=1', label: "This week's picks" },
    ],
  },
  {
    title: 'Your account',
    links: [
      { href: '/login', label: 'Sign in' },
      { href: '/register', label: 'Create an account' },
      { href: '/orders', label: 'Track an order' },
      { href: '/cart', label: 'Your cart' },
    ],
  },
  {
    title: 'The shop',
    links: [
      { href: '/about', label: 'Our story' },
      { href: '/about#delivery', label: 'Delivery & returns' },
      { href: '/about#contact', label: 'Contact us' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-24 bg-bark-900 text-mango-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-linear-to-br from-mango-400 to-mango-600 text-lg">
              🥭
            </span>
            <span className="font-display text-xl text-white">
              Mango<span className="text-mango-400">Shop</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mango-200/80">
            Picked in the morning, graded by hand, delivered the same day across the island. Fifteen
            varieties in season — and we tell you honestly which ones are worth it this week.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-mango-400">
              {column.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-mango-100/80 transition hover:text-mango-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-mango-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MangoShop. Built with Next.js, Prisma and PostgreSQL.</p>
          <p>Colombo, Sri Lanka · hello@mangoshop.lk · 011 234 5678</p>
        </div>
      </div>
    </footer>
  )
}
