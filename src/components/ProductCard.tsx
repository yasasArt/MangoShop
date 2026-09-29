import Link from 'next/link'
import { AddToCartButton } from './AddToCartButton'
import { ProductImage } from './ProductImage'
import { SweetnessScale } from './SweetnessScale'
import { formatPrice } from '@/lib/format'

export type ProductCardData = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  unit: string
  stock: number
  imageUrl: string
  origin: string | null
  sweetness: number
  categoryName: string
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-bark-100 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/products/${product.slug}`} className="relative block aspect-4/3 overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-mango-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              −{discount}%
            </span>
          )}
          {product.stock > 0 && product.stock <= 20 && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-bark-700 shadow-sm">
              Only {product.stock} left
            </span>
          )}
          {product.stock <= 0 && (
            <span className="rounded-full bg-bark-900/90 px-2.5 py-1 text-xs font-semibold text-white">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-mango-600">
            {product.categoryName}
          </p>
          <h3 className="mt-1 font-display text-lg leading-snug text-bark-900">
            <Link href={`/products/${product.slug}`} className="hover:text-mango-700">
              {product.name}
            </Link>
          </h3>
          {product.origin && <p className="mt-0.5 text-sm text-bark-500">from {product.origin}</p>}
        </div>

        <SweetnessScale value={product.sweetness} />

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="font-display text-xl text-bark-900">{formatPrice(product.price)}</p>
            <p className="text-xs text-bark-500">
              per {product.unit}
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="ml-1.5 line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </p>
          </div>
        </div>

        <AddToCartButton
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            unit: product.unit,
            imageUrl: product.imageUrl,
            stock: product.stock,
          }}
        />
      </div>
    </article>
  )
}
