import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-page py-24">
      <div className="mx-auto max-w-md rounded-4xl bg-white p-12 text-center shadow-card ring-1 ring-bark-100">
        <p className="text-5xl">🥭</p>
        <h1 className="mt-5 font-display text-3xl text-bark-900">Page not found</h1>
        <p className="mt-2 text-sm text-bark-600">
          That page has gone the way of last season&apos;s harvest. Let&apos;s get you back to the
          fruit.
        </p>
        <Link
          href="/"
          className="mt-7 inline-block rounded-full bg-bark-900 px-7 py-3.5 text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
        >
          Back to the shop
        </Link>
      </div>
    </div>
  )
}
