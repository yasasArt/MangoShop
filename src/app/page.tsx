import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/serialize'
import { ProductCard } from '@/components/ProductCard'
import { ProductImage } from '@/components/ProductImage'
import { FREE_DELIVERY_THRESHOLD, formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

const promises = [
  {
    icon: '🌅',
    title: 'Picked this morning',
    body: 'Orders placed before 10am are picked the same day and packed within the hour.',
  },
  {
    icon: '🏷️',
    title: 'Graded by hand',
    body: 'Every fruit is checked for bruising and ripeness. Anything we would not eat is not sold.',
  },
  {
    icon: '🚚',
    title: 'Island-wide delivery',
    body: `Flat ${formatPrice(450)} anywhere in Sri Lanka — free over ${formatPrice(FREE_DELIVERY_THRESHOLD)}.`,
  },
  {
    icon: '↩️',
    title: 'Replaced, no argument',
    body: 'If a mango arrives damaged, send a photo and we replace it on the next delivery run.',
  },
]

export default async function HomePage() {
  const [featured, categories, newest] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { active: true, featured: false },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ])

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-40 h-[30rem] w-[30rem] rounded-full bg-mango-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 rounded-full bg-leaf-100/70 blur-3xl" />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-leaf-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-leaf-700">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
              Season is open · 18 varieties in stock
            </span>

            <h1 className="mt-5 font-display text-4xl leading-[1.1] text-bark-900 sm:text-5xl lg:text-6xl">
              The best mangoes on the island,
              <span className="text-mango-600"> delivered ripe.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-bark-600">
              We buy direct from growers in Jaffna, Dambulla and Malwana, grade every fruit by hand,
              and get it to your door the day it is picked. No cold storage, no guesswork.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-full bg-bark-900 px-7 py-3.5 text-sm font-semibold text-mango-50 shadow-lift transition hover:bg-mango-600"
              >
                Shop all mangoes
              </Link>
              <Link
                href="/categories"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-bark-800 ring-1 ring-bark-200 transition hover:ring-mango-400"
              >
                Browse by category
              </Link>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ['4,200+', 'orders delivered'],
                ['18', 'varieties in season'],
                ['Same day', 'picking to packing'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-bark-900">{value}</dt>
                  <dd className="text-sm text-bark-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise relative">
            <div className="overflow-hidden rounded-4xl bg-white shadow-lift ring-1 ring-bark-100">
              <div className="aspect-4/3">
                <ProductImage
                  src={featured[0]?.imageUrl ?? '/mangoes/placeholder.svg'}
                  alt={featured[0]?.name ?? 'Fresh mangoes'}
                  priority
                />
              </div>
            </div>

            {featured[0] && (
              <div className="relative -mt-8 mx-4 rounded-3xl bg-bark-900 p-5 text-mango-50 shadow-lift sm:absolute sm:-bottom-6 sm:left-8 sm:right-auto sm:mx-0 sm:mt-0 sm:w-72">
                <p className="text-xs font-bold uppercase tracking-wider text-mango-400">
                  Pick of the week
                </p>
                <p className="mt-1.5 font-display text-xl">{featured[0].name}</p>
                <p className="mt-1 text-sm text-mango-200/80">
                  {formatPrice(featured[0].price)} per {featured[0].unit}
                </p>
                <Link
                  href={`/products/${featured[0].slug}`}
                  className="mt-4 inline-block rounded-full bg-mango-500 px-4 py-2 text-xs font-bold text-bark-900 transition hover:bg-mango-400"
                >
                  See this mango
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section className="container-page pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-bark-900 sm:text-4xl">Shop by category</h2>
            <p className="mt-2 text-bark-600">
              Five ranges, from everyday juice mangoes to gift boxes worth turning up with.
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-semibold text-mango-700 underline-offset-4 hover:underline"
          >
            View all categories →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`group relative overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100 transition hover:-translate-y-1 hover:shadow-lift ${
                index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="aspect-16/9 overflow-hidden">
                <ProductImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl text-bark-900">{category.name}</h3>
                  <span className="rounded-full bg-mango-100 px-2.5 py-1 text-xs font-bold text-mango-700">
                    {category._count.products}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-bark-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="container-page pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-bark-900 sm:text-4xl">This week&apos;s picks</h2>
            <p className="mt-2 text-bark-600">
              What the packing team is eating on their break — usually a reliable signal.
            </p>
          </div>
          <Link
            href="/products?featured=1"
            className="text-sm font-semibold text-mango-700 underline-offset-4 hover:underline"
          >
            All featured →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={toCardData(product)} />
          ))}
        </div>
      </section>

      {/* ---------- Promises ---------- */}
      <section className="container-page pt-20">
        <div className="rounded-4xl bg-bark-900 px-6 py-12 sm:px-12">
          <h2 className="font-display text-3xl text-white">How we work</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {promises.map((promise) => (
              <div key={promise.title}>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl">
                  {promise.icon}
                </div>
                <h3 className="mt-4 font-display text-lg text-white">{promise.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mango-100/70">{promise.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Newest ---------- */}
      {newest.length > 0 && (
        <section className="container-page pt-20">
          <h2 className="font-display text-3xl text-bark-900 sm:text-4xl">Just added</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newest.map((product) => (
              <ProductCard key={product.id} product={toCardData(product)} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
