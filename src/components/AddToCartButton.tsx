'use client'

import { useState } from 'react'
import { useCart, type CartItem } from '@/context/CartContext'

type Props = {
  product: Omit<CartItem, 'quantity'>
  withQuantity?: boolean
  className?: string
}

export function AddToCartButton({ product, withQuantity = false, className = '' }: Props) {
  const { add, items } = useCart()
  const [quantity, setQuantity] = useState(1)

  const inCart = items.find((line) => line.productId === product.productId)?.quantity ?? 0
  const soldOut = product.stock <= 0
  const maxedOut = inCart >= product.stock

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={`w-full cursor-not-allowed rounded-full bg-bark-100 px-5 py-3 text-sm font-semibold text-bark-400 ${className}`}
      >
        Sold out
      </button>
    )
  }

  return (
    <div className={withQuantity ? 'flex flex-col gap-4 sm:flex-row sm:items-center' : ''}>
      {withQuantity && (
        <div className="flex items-center gap-1 rounded-full border border-bark-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="grid h-9 w-9 place-items-center rounded-full text-lg text-bark-600 transition hover:bg-mango-100"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(product.stock, 1)),
              )
            }
            aria-label="Quantity"
            className="w-12 border-0 bg-transparent text-center text-base font-semibold text-bark-900 outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
            className="grid h-9 w-9 place-items-center rounded-full text-lg text-bark-600 transition hover:bg-mango-100"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => add(product, quantity)}
        disabled={maxedOut}
        className={`group flex w-full items-center justify-center gap-2 rounded-full bg-bark-900 px-5 py-3 text-sm font-semibold text-mango-50 transition hover:bg-mango-600 disabled:cursor-not-allowed disabled:bg-bark-200 disabled:text-bark-500 ${className}`}
      >
        {maxedOut ? (
          'All stock in cart'
        ) : (
          <>
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M6 2a1 1 0 0 0 0 2h.6l1.6 8.4A2 2 0 0 0 10.16 14h5.3a2 2 0 0 0 1.95-1.56l1.1-4.8A1 1 0 0 0 17.54 6H8.1l-.3-1.6A2 2 0 0 0 5.84 2H6Z" />
              <circle cx="10" cy="17" r="1.5" />
              <circle cx="16" cy="17" r="1.5" />
            </svg>
            Add to cart
          </>
        )}
      </button>
    </div>
  )
}
