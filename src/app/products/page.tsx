import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/serialize'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shop all mangoes',
  description: 'Browse every variety in stock — local, imported, juice grade and gift boxes.',
}

type SearchParams = Promise<{
  q?: string
  category?: string
  sort?: string
  featured?: string
}>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = params.q?.trim()
  const category = params.category
  const sort = params.sort ?? 'newest'
  const featuredOnly = params.featured === '1'

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(featuredOnly ? { featured: true } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { origin: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc'
      ? { price: 'asc' }
      : sort === 'price-desc'
        ? { price: 'desc' }
        : sort === 'name'
          ? { name: 'asc' }
          : { createdAt: 'desc' }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
  ])

  const activeCategory = categories.find((entry) => entry.slug === category)

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl text-bark-900 sm:text-4xl">
          {q
            ? `Results for “${q}”`
            : featuredOnly
              ? "This week's picks"
              : (activeCategory?.name ?? 'All mangoes')}
        </h1>
        <p className="mt-2 text-bark-600">
          {activeCategory?.description ??
            'Everything currently in stock. Prices are per kilo unless the card says otherwise.'}
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<div className="h-12" />}>
          <ProductFilters
            categories={categories.map((entry) => ({
              id: entry.id,
              name: entry.name,
              slug: entry.slug,
              count: entry._count.products,
            }))}
            activeCategory={category}
            sort={sort}
          />
        </Suspense>
      </div>

      <p className="mt-6 text-sm text-bark-500">
        {products.length} {products.length === 1 ? 'product' : 'products'}
      </p>

      {products.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-card ring-1 ring-bark-100">
          <p className="text-4xl">🥭</p>
          <h2 className="mt-4 font-display text-xl text-bark-900">Nothing matches that yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-bark-600">
            Try a different variety name, or clear the filters to see everything we have in stock
            today.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-bark-900 px-6 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
          >
            Show all mangoes
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={toCardData(product)} />
          ))}
        </div>
      )}
    </div>
  )
}
