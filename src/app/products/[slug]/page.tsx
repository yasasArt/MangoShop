import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/serialize'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductCard } from '@/components/ProductCard'
import { ProductImage } from '@/components/ProductImage'
import { SweetnessScale } from '@/components/SweetnessScale'
import { FREE_DELIVERY_THRESHOLD, formatPrice, toNumber } from '@/lib/format'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: product.description.slice(0, 155),
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product || !product.active) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, active: true },
    include: { category: { select: { name: true, slug: true } } },
    take: 4,
  })

  const price = toNumber(product.price)
  const comparePrice = product.comparePrice ? toNumber(product.comparePrice) : null
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0

  return (
    <div className="container-page py-8 sm:py-12">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-bark-500">
        <Link href="/" className="hover:text-mango-700">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-mango-700">
          Shop
        </Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-mango-700">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-bark-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="self-start overflow-hidden rounded-4xl bg-white shadow-card ring-1 ring-bark-100">
          <div className="aspect-4/3">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/products?category=${product.category.slug}`}
              className="rounded-full bg-mango-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-mango-700"
            >
              {product.category.name}
            </Link>
            {product.featured && (
              <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-leaf-700">
                Pick of the week
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-mango-600 px-3 py-1 text-xs font-bold text-white">
                Save {discount}%
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl leading-tight text-bark-900 sm:text-4xl">
            {product.name}
          </h1>

          {product.origin && (
            <p className="mt-2 text-bark-600">
              Grown in <span className="font-semibold text-bark-800">{product.origin}</span>
            </p>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl text-bark-900">{formatPrice(price)}</span>
            <span className="text-bark-500">per {product.unit}</span>
            {comparePrice && comparePrice > price && (
              <span className="text-bark-400 line-through">{formatPrice(comparePrice)}</span>
            )}
          </div>

          <div className="mt-5">
            <SweetnessScale value={product.sweetness} />
          </div>

          <p className="mt-6 text-base leading-relaxed text-bark-600">{product.description}</p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            {product.stock > 20 ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-leaf-600">
                <span className="h-2 w-2 rounded-full bg-leaf-500" />
                In stock — ready to pack
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-mango-700">
                <span className="h-2 w-2 rounded-full bg-mango-500" />
                Only {product.stock} {product.unit} left today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Sold out — back next harvest
              </span>
            )}
          </div>

          <div className="mt-7">
            <AddToCartButton
              withQuantity
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price,
                unit: product.unit,
                imageUrl: product.imageUrl,
                stock: product.stock,
              }}
            />
          </div>

          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-bark-100 ring-1 ring-bark-100 sm:grid-cols-2">
            {[
              ['Sold by', `the ${product.unit}`],
              ['Origin', product.origin ?? 'Sri Lanka'],
              ['Delivery', `Free over ${formatPrice(FREE_DELIVERY_THRESHOLD)}`],
              ['Best within', '3–4 days of delivery'],
            ].map(([label, value]) => (
              <div key={label} className="bg-white px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wider text-bark-400">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-bark-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl text-bark-900 sm:text-3xl">
            More from {product.category.name}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={toCardData(item)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
