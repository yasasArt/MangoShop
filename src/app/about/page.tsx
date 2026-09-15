import type { Metadata } from 'next'
import Link from 'next/link'
import { FREE_DELIVERY_THRESHOLD, formatPrice } from '@/lib/format'

export const metadata: Metadata = {
  title: 'About',
  description: 'How MangoShop buys, grades and delivers mangoes across Sri Lanka.',
}

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="font-display text-4xl text-bark-900">Our story</h1>

      <p className="mt-6 text-lg leading-relaxed text-bark-600">
        MangoShop started in 2021 with one van and a standing arrangement with two growers in
        Malwana. The idea was simple: most mangoes sold in Colombo have been in a crate for days,
        and the people selling them cannot tell you which tree they came from. We thought we could
        do better by buying direct and delivering the same day.
      </p>

      <p className="mt-4 text-lg leading-relaxed text-bark-600">
        Today we work with eleven growers across Jaffna, Dambulla, Kurunegala and Malwana. Fruit is
        picked in the morning, graded by hand at our packhouse in Kelaniya, and on a van by
        mid-afternoon.
      </p>

      <h2 id="delivery" className="mt-12 scroll-mt-28 font-display text-2xl text-bark-900">
        Delivery &amp; returns
      </h2>
      <ul className="mt-4 space-y-3 text-bark-600">
        <li className="flex gap-3">
          <span className="text-mango-500">●</span>
          Flat {formatPrice(450)} anywhere in Sri Lanka. Free on orders over{' '}
          {formatPrice(FREE_DELIVERY_THRESHOLD)}.
        </li>
        <li className="flex gap-3">
          <span className="text-mango-500">●</span>
          Colombo and suburbs: same day for orders placed before 10am, next day otherwise.
        </li>
        <li className="flex gap-3">
          <span className="text-mango-500">●</span>
          Outstation: 1–2 days by courier, packed in ventilated boxes with paper padding.
        </li>
        <li className="flex gap-3">
          <span className="text-mango-500">●</span>
          If a mango arrives bruised or over-ripe, send a photo within 24 hours and we replace it on
          the next run — no need to return anything.
        </li>
      </ul>

      <h2 id="contact" className="mt-12 scroll-mt-28 font-display text-2xl text-bark-900">
        Contact
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          ['Phone', '011 234 5678', 'Mon–Sat, 8am–6pm'],
          ['Email', 'hello@mangoshop.lk', 'We reply within a day'],
          ['Packhouse', 'Kelaniya', 'Collection by appointment'],
        ].map(([label, value, note]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-bark-100">
            <p className="text-xs font-bold uppercase tracking-wider text-bark-400">{label}</p>
            <p className="mt-1.5 font-semibold text-bark-900">{value}</p>
            <p className="mt-0.5 text-sm text-bark-500">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-bark-900 p-8 text-center">
        <p className="font-display text-2xl text-white">Ready to taste the difference?</p>
        <Link
          href="/products"
          className="mt-5 inline-block rounded-full bg-mango-500 px-7 py-3.5 text-sm font-semibold text-bark-900 transition hover:bg-mango-400"
        >
          Shop this week&apos;s mangoes
        </Link>
      </div>
    </div>
  )
}
