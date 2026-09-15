'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ProductImage } from './ProductImage'
import { formatPrice } from '@/lib/format'

export function CartToast() {
  const { lastAdded, dismissToast } = useCart()

  if (!lastAdded) return null

  return (
    <div
      role="status"
      className="animate-pop fixed bottom-5 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl bg-bark-900 p-3 text-mango-50 shadow-lift"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
          <ProductImage src={lastAdded.imageUrl} alt="" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{lastAdded.name}</p>
          <p className="text-xs text-mango-200">
            {lastAdded.quantity} × {formatPrice(lastAdded.price)} added to cart
          </p>
        </div>
        <Link
          href="/cart"
          onClick={dismissToast}
          className="shrink-0 rounded-full bg-mango-500 px-3.5 py-2 text-xs font-bold text-bark-900 transition hover:bg-mango-400"
        >
          View cart
        </Link>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss"
          className="shrink-0 px-1 text-mango-300 transition hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
