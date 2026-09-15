'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { ProductImage } from '@/components/ProductImage'
import { FREE_DELIVERY_THRESHOLD, formatPrice } from '@/lib/format'

export default function CartPage() {
  const { items, subtotal, delivery, total, setQuantity, remove, clear, ready } = useCart()

  if (!ready) {
    return (
      <div className="container-page py-20">
        <div className="h-8 w-48 animate-pulse rounded-full bg-bark-100" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md rounded-4xl bg-white p-12 text-center shadow-card ring-1 ring-bark-100">
          <p className="text-5xl">🧺</p>
          <h1 className="mt-5 font-display text-2xl text-bark-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-bark-600">
            Eighteen varieties are in stock right now. The Karutha Colomban is having a very good
            week.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-block rounded-full bg-bark-900 px-7 py-3.5 text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
          >
            Start shopping
          </Link>
        </div>
      </div>
    )
  }

  const awayFromFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl text-bark-900 sm:text-4xl">Your cart</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-semibold text-bark-500 underline-offset-4 transition hover:text-rose-600 hover:underline"
        >
          Empty cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-4">
          {items.map((line) => (
            <li
              key={line.productId}
              className="flex gap-4 rounded-3xl bg-white p-4 shadow-card ring-1 ring-bark-100"
            >
              <Link
                href={`/products/${line.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mango-50 sm:h-28 sm:w-28"
              >
                <ProductImage src={line.imageUrl} alt={line.name} />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg text-bark-900">
                      <Link href={`/products/${line.slug}`} className="hover:text-mango-700">
                        {line.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-bark-500">
                      {formatPrice(line.price)} per {line.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    aria-label={`Remove ${line.name}`}
                    className="shrink-0 rounded-full p-1.5 text-bark-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-1 rounded-full border border-bark-200 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="grid h-8 w-8 place-items-center rounded-full text-bark-600 transition hover:bg-mango-100"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-bark-900">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      disabled={line.quantity >= line.stock}
                      aria-label="Increase quantity"
                      className="grid h-8 w-8 place-items-center rounded-full text-bark-600 transition hover:bg-mango-100 disabled:cursor-not-allowed disabled:text-bark-300"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-display text-lg text-bark-900">
                    {formatPrice(line.price * line.quantity)}
                  </p>
                </div>

                {line.quantity >= line.stock && (
                  <p className="pt-2 text-xs text-mango-700">
                    That is everything we have of this one today.
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-bark-100">
            <h2 className="font-display text-xl text-bark-900">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-bark-600">Subtotal</dt>
                <dd className="font-semibold text-bark-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-bark-600">Delivery</dt>
                <dd className="font-semibold text-bark-900">
                  {delivery === 0 ? (
                    <span className="text-leaf-600">Free</span>
                  ) : (
                    formatPrice(delivery)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-bark-100 pt-3">
                <dt className="font-display text-lg text-bark-900">Total</dt>
                <dd className="font-display text-lg text-bark-900">{formatPrice(total)}</dd>
              </div>
            </dl>

            {awayFromFreeDelivery > 0 && (
              <div className="mt-5 rounded-2xl bg-mango-50 p-4">
                <p className="text-xs font-semibold text-mango-800">
                  Add {formatPrice(awayFromFreeDelivery)} more for free delivery
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mango-200">
                  <div
                    className="h-full rounded-full bg-mango-500 transition-all"
                    style={{
                      width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <Link
              href="/checkout"
              className="mt-6 block rounded-full bg-bark-900 px-6 py-3.5 text-center text-sm font-semibold text-mango-50 transition hover:bg-mango-600"
            >
              Continue to checkout
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm font-semibold text-bark-600 underline-offset-4 hover:underline"
            >
              Keep shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
