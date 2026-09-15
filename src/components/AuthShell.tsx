import Link from 'next/link'

/** Shared two-panel layout for the sign-in and register screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-4xl bg-white shadow-lift ring-1 ring-bark-100 lg:grid-cols-2">
        {/* Left: the form */}
        <div className="order-2 p-8 sm:p-12 lg:order-1">
          <h1 className="font-display text-3xl text-bark-900">{title}</h1>
          <p className="mt-2 text-sm text-bark-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-bark-600">{footer}</div>
        </div>

        {/* Right: the brand panel */}
        <div className="relative order-1 overflow-hidden bg-linear-to-br from-mango-400 via-mango-500 to-mango-700 p-8 sm:p-12 lg:order-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-leaf-400/30 blur-2xl" />

          <div className="relative flex h-full flex-col">
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-lg backdrop-blur">
                🥭
              </span>
              <span className="font-display text-xl">MangoShop</span>
            </Link>

            <blockquote className="mt-10 lg:mt-auto">
              <p className="font-display text-2xl leading-snug text-white">
                “I stopped guessing at the market. They tell me which variety is good this week and
                it always is.”
              </p>
              <footer className="mt-4 text-sm text-mango-50/80">
                Shanika F. — ordering since 2023
              </footer>
            </blockquote>

            <ul className="mt-8 space-y-2.5 text-sm text-white/90">
              {[
                'Track every order from picking to your door',
                'Reorder your usual box in two taps',
                'Free delivery on orders over Rs 5,000',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/25 text-[10px]">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
