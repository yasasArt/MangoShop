import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductImage } from '@/components/ProductImage'
import { formatPrice, toNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Every range we stock, from premium local varieties to bulk juice mangoes.',
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      products: {
        where: { active: true },
        orderBy: { price: 'asc' },
        select: { price: true, name: true },
      },
    },
  })

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl text-bark-900 sm:text-4xl">Categories</h1>
        <p className="mt-2 text-bark-600">
          Five ranges. If you are buying to eat this week, start with Premium Local; if you are
          blending, Juice &amp; Pulp is the same fruit for half the price.
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const from = category.products[0] ? toNumber(category.products[0].price) : null
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100 transition hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-16/10 overflow-hidden">
                <ProductImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-xl text-bark-900">{category.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-bark-600">
                  {category.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-bark-100 pt-4">
                  <span className="text-sm text-bark-500">
                    {category.products.length}{' '}
                    {category.products.length === 1 ? 'product' : 'products'}
                  </span>
                  {from !== null && (
                    <span className="text-sm font-semibold text-bark-900">
                      from {formatPrice(from)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
